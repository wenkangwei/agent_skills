#!/usr/bin/env node

/**
 * Time Tracker - 工时跟踪
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const DATA_PATH = path.join(__dirname, '..', 'data');
const RECORDS_PATH = path.join(DATA_PATH, 'records.json');
const ACTIVE_PATH = path.join(DATA_PATH, 'active.json');

// 加载配置
let config = {};
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
  config = {
    defaultRate: 100,
    currency: 'CNY',
    roundTo: 15,
    autoStop: false
  };
}

// 确保数据目录存在
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true });
}

// 加载记录
let records = [];
try {
  if (fs.existsSync(RECORDS_PATH)) {
    records = JSON.parse(fs.readFileSync(RECORDS_PATH, 'utf8'));
  }
} catch (err) {
  console.error('❌ 无法加载记录');
}

// 生成ID
function generateId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${day}-${random}`;
}

// 格式化时长
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}小时${minutes}分钟`;
}

// 四舍五入到指定分钟
function roundDuration(seconds, roundToMinutes) {
  const minutes = Math.ceil(seconds / 60);
  const rounded = Math.ceil(minutes / roundToMinutes) * roundToMinutes;
  return rounded * 60;
}

// 开始记录
function startTask(project, task, rate, tags) {
  if (fs.existsSync(ACTIVE_PATH)) {
    console.log('⚠️  已有任务在进行中');
    return;
  }

  const active = {
    id: generateId(),
    project: project || '未分类',
    task: task || '',
    startTime: new Date().toISOString(),
    rate: Number(rate) || config.defaultRate,
    currency: config.currency,
    tags: tags || []
  };

  fs.writeFileSync(ACTIVE_PATH, JSON.stringify(active, null, 2));
  console.log(`✅ 开始记录工时`);
  console.log(`   项目：${active.project}`);
  console.log(`   费率：${active.rate} ${active.currency}/小时`);
}

// 停止记录
function stopTask() {
  if (!fs.existsSync(ACTIVE_PATH)) {
    console.log('⚠️  没有正在进行的任务');
    return;
  }

  const active = JSON.parse(fs.readFileSync(ACTIVE_PATH, 'utf8'));
  const endTime = new Date();
  const startTime = new Date(active.startTime);
  let duration = Math.floor((endTime - startTime) / 1000);

  // 四舍五入
  if (config.roundTo > 0) {
    duration = roundDuration(duration, config.roundTo);
  }

  const earnings = (duration / 3600) * active.rate;

  const record = {
    id: active.id,
    project: active.project,
    task: active.task,
    startTime: active.startTime,
    endTime: endTime.toISOString(),
    duration: duration,
    durationHuman: formatDuration(duration),
    rate: active.rate,
    currency: active.currency,
    earnings: Math.round(earnings * 100) / 100,
    tags: active.tags,
    createdAt: new Date().toISOString()
  };

  records.unshift(record);
  fs.writeFileSync(RECORDS_PATH, JSON.stringify(records, null, 2));
  fs.unlinkSync(ACTIVE_PATH);

  console.log(`✅ 停止记录工时`);
  console.log(`   时长：${record.durationHuman}`);
  console.log(`   收入：${record.currency}${record.earnings.toFixed(2)}`);
}

// 查看状态
function showStatus() {
  if (!fs.existsSync(ACTIVE_PATH)) {
    console.log('📭 没有正在进行的任务');
    return;
  }

  const active = JSON.parse(fs.readFileSync(ACTIVE_PATH, 'utf8'));
  const startTime = new Date(active.startTime);
  const now = new Date();
  const elapsed = Math.floor((now - startTime) / 1000);

  console.log(`⏱️  当前任务`);
  console.log(`   项目：${active.project}`);
  console.log(`   费率：${active.rate} ${active.currency}/小时`);
  console.log(`   已工作：${formatDuration(elapsed)}`);
}

// 列出记录
function listRecords(options = {}) {
  const limit = options.limit || 10;
  const filtered = records.slice(0, limit);

  if (filtered.length === 0) {
    console.log('📭 没有记录');
    return;
  }

  console.log(`\n📋 工时记录 (最近${limit}条)\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  filtered.forEach((r, i) => {
    console.log(`${i + 1}. ${r.project}`);
    console.log(`   时长：${r.durationHuman}`);
    console.log(`   收入：${r.currency}${r.earnings.toFixed(2)}`);
    console.log(`   时间：${new Date(r.startTime).toLocaleString('zh-CN')}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 删除记录
function deleteRecord(id) {
  const index = records.findIndex(r => r.id === id);
  if (index === -1) {
    console.log('❌ 未找到记录');
    return;
  }

  records.splice(index, 1);
  fs.writeFileSync(RECORDS_PATH, JSON.stringify(records, null, 2));
  console.log(`✅ 已删除记录`);
}

// 解析参数
function parseArgs(args) {
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const value = args[i + 1];
      if (value && !value.startsWith('--')) {
        params[key] = value;
        i++;
      } else {
        params[key] = true;
      }
    }
  }
  return params;
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Time Tracker - 工时跟踪

用法:
  node track.js <command> [options]

命令:
  start       开始记录工时
  stop        停止记录工时
  status      查看当前状态
  list        查看记录
  delete      删除记录

start 选项:
  --project   项目名称
  --task      任务描述
  --rate      小时费率
  --tags      标签（逗号分隔）

list 选项:
  --limit     显示数量，默认10

delete 参数:
  <id>        记录ID

示例:
  # 开始记录
  node track.js start --project "网站开发" --task "首页设计"

  # 带费率
  node track.js start --project "网站开发" --rate 150

  # 停止记录
  node track.js stop

  # 查看状态
  node track.js status

  # 查看记录
  node track.js list --limit 5
`);
    process.exit(0);
  }

  const command = args[0];
  const params = parseArgs(args.slice(1));

  switch (command) {
    case 'start':
      startTask(params.project, params.task, params.rate, params.tags);
      break;

    case 'stop':
      stopTask();
      break;

    case 'status':
      showStatus();
      break;

    case 'list':
      listRecords(params);
      break;

    case 'delete':
      if (args.length < 2) {
        console.log('❌ 请指定记录ID');
        process.exit(1);
      }
      deleteRecord(args[1]);
      break;

    default:
      console.log(`❌ 未知命令: ${command}`);
      process.exit(1);
  }
}

main();
