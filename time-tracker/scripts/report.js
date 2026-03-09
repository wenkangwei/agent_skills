#!/usr/bin/env node

/**
 * Report Generator - 报告生成
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const DATA_PATH = path.join(__dirname, '..', 'data');
const RECORDS_PATH = path.join(DATA_PATH, 'records.json');

// 货币符号
const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
  EUR: '€'
};

// 加载记录
let records = [];
try {
  if (fs.existsSync(RECORDS_PATH)) {
    records = JSON.parse(fs.readFileSync(RECORDS_PATH, 'utf8'));
  }
} catch (err) {
  console.error('❌ 无法加载记录');
  process.exit(1);
}

// 获取今日日期
function getToday() {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

// 获取本周
function getWeekRange(date = new Date()) {
  const now = new Date(date);
  const day = now.getDay() || 7; // 周日为7
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { start: monday, end: sunday };
}

// 获取本月
function getMonthRange(year, month) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

// 格式化时长
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toFixed(1)}小时`;
}

// 生成日报
function generateDailyReport(dateStr) {
  const todayRecords = records.filter(r => {
    return r.startTime.startsWith(dateStr);
  });

  if (todayRecords.length === 0) {
    console.log(`📭 ${dateStr} 没有记录`);
    return;
  }

  // 按项目分组
  const byProject = {};
  let totalDuration = 0;
  let totalEarnings = 0;

  todayRecords.forEach(r => {
    if (!byProject[r.project]) {
      byProject[r.project] = { duration: 0, earnings: 0, tasks: [] };
    }
    byProject[r.project].duration += r.duration;
    byProject[r.project].earnings += r.earnings;
    byProject[r.project].tasks.push(r);
    totalDuration += r.duration;
    totalEarnings += r.earnings;
  });

  const symbol = CURRENCY_SYMBOLS[todayRecords[0].currency] || todayRecords[0].currency;

  console.log(`\n📅 工时日报 - ${dateStr}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  Object.keys(byProject).forEach(project => {
    const data = byProject[project];
    console.log(`项目：${project}`);
    data.tasks.forEach(t => {
      console.log(`  ✅ ${t.task || '未命名'}      ${formatDuration(t.duration).padEnd(10)} ${symbol}${t.earnings.toFixed(2).padStart(8)}`);
    });
    console.log(`  ──────────────────────────────`);
    console.log(`  小计：             ${formatDuration(data.duration).padEnd(10)} ${symbol}${data.earnings.toFixed(2).padStart(8)}\n`);
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`今日总计：${formatDuration(totalDuration).padEnd(10)} ${symbol}${totalEarnings.toFixed(2).padStart(8)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 生成周报
function generateWeeklyReport(year, week) {
  const range = getWeekRange();
  const weekRecords = records.filter(r => {
    const time = new Date(r.startTime);
    return time >= range.start && time <= range.end;
  });

  if (weekRecords.length === 0) {
    console.log(`📭 本周没有记录`);
    return;
  }

  // 按项目分组
  const byProject = {};
  let totalDuration = 0;
  let totalEarnings = 0;

  weekRecords.forEach(r => {
    if (!byProject[r.project]) {
      byProject[r.project] = { duration: 0, earnings: 0 };
    }
    byProject[r.project].duration += r.duration;
    byProject[r.project].earnings += r.earnings;
    totalDuration += r.duration;
    totalEarnings += r.earnings;
  });

  const symbol = CURRENCY_SYMBOLS[weekRecords[0].currency] || weekRecords[0].currency;
  const avgDaily = totalDuration / 7 / 3600;

  console.log(`\n📊 工时周报 - ${year}-W${week}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('项目汇总：');
  Object.keys(byProject).forEach(project => {
    const data = byProject[project];
    console.log(`  ${project.padEnd(18)} ${formatDuration(data.duration).padEnd(10)} ${symbol}${data.earnings.toFixed(2).padStart(8)}`);
  });

  console.log(`  ─────────────────────────────────`);
  console.log(`  本周总计：         ${formatDuration(totalDuration).padEnd(10)} ${symbol}${totalEarnings.toFixed(2).padStart(8)}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`日均工时：${avgDaily.toFixed(1)}小时`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 生成月报
function generateMonthlyReport(year, month) {
  const range = getMonthRange(year, month);
  const monthRecords = records.filter(r => {
    const time = new Date(r.startTime);
    return time >= range.start && time <= range.end;
  });

  if (monthRecords.length === 0) {
    console.log(`📭 ${year}-${month} 没有记录`);
    return;
  }

  // 按项目分组
  const byProject = {};
  let totalDuration = 0;
  let totalEarnings = 0;

  monthRecords.forEach(r => {
    if (!byProject[r.project]) {
      byProject[r.project] = { duration: 0, earnings: 0 };
    }
    byProject[r.project].duration += r.duration;
    byProject[r.project].earnings += r.earnings;
    totalDuration += r.duration;
    totalEarnings += r.earnings;
  });

  const symbol = CURRENCY_SYMBOLS[monthRecords[0].currency] || monthRecords[0].currency;
  const days = new Date(year, month, 0).getDate();
  const avgDaily = totalDuration / days / 3600;

  console.log(`\n📆 工时月报 - ${year}-${month}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('项目汇总：');
  Object.keys(byProject).forEach(project => {
    const data = byProject[project];
    console.log(`  ${project.padEnd(18)} ${formatDuration(data.duration).padEnd(10)} ${symbol}${data.earnings.toFixed(2).padStart(8)}`);
  });

  console.log(`  ─────────────────────────────────`);
  console.log(`  本月总计：         ${formatDuration(totalDuration).padEnd(10)} ${symbol}${totalEarnings.toFixed(2).padStart(8)}`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`日均工时：${avgDaily.toFixed(1)}小时（${days}天）`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 生成项目报告
function generateProjectReport(projectName) {
  const projectRecords = records.filter(r => r.project === projectName);

  if (projectRecords.length === 0) {
    console.log(`📭 项目"${projectName}"没有记录`);
    return;
  }

  let totalDuration = 0;
  let totalEarnings = 0;

  projectRecords.forEach(r => {
    totalDuration += r.duration;
    totalEarnings += r.earnings;
  });

  const symbol = CURRENCY_SYMBOLS[projectRecords[0].currency] || projectRecords[0].currency;

  console.log(`\n📁 项目报告 - ${projectName}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('记录详情：');
  projectRecords.forEach((r, i) => {
    console.log(`  ${i + 1}. ${r.task || '未命名'}`);
    console.log(`     时间：${new Date(r.startTime).toLocaleString('zh-CN')}`);
    console.log(`     时长：${formatDuration(r.duration)} | 收入：${symbol}${r.earnings.toFixed(2)}`);
    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`项目总计：${formatDuration(totalDuration).padEnd(10)} ${symbol}${totalEarnings.toFixed(2).padStart(8)}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
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
Report Generator - 报告生成

用法:
  node report.js <type> [options]

类型:
  daily       日报
  weekly      周报
  monthly     月报
  project     项目报告

daily 选项:
  --date      指定日期（YYYY-MM-DD），默认今天

weekly 选项:
  --year      指定年份，默认当年
  --week      指定周数，默认当前周

monthly 选项:
  --year      指定年份，默认当年
  --month     指定月份（1-12），默认当前月

project 选项:
  --project   项目名称（必需）

示例:
  # 今日日报
  node report.js daily

  # 指定日期
  node report.js daily --date 2026-03-09

  # 本周周报
  node report.js weekly

  # 本月月报
  node report.js monthly

  # 项目报告
  node report.js project --project "网站开发"
`);
    process.exit(0);
  }

  const type = args[0];
  const params = parseArgs(args.slice(1));

  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;
  const week = params.week ? Number(params.week) : getWeekNumber(now);

  switch (type) {
    case 'daily':
      const dateStr = params.date || getToday();
      generateDailyReport(dateStr);
      break;

    case 'weekly':
      generateWeeklyReport(year, week);
      break;

    case 'monthly':
      generateMonthlyReport(year, month);
      break;

    case 'project':
      if (!params.project) {
        console.log('❌ 请指定项目名称：--project "项目名"');
        process.exit(1);
      }
      generateProjectReport(params.project);
      break;

    default:
      console.log(`❌ 未知类型: ${type}`);
      process.exit(1);
  }
}

// 获取周数
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

main();
