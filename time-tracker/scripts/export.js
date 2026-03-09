#!/usr/bin/env node

/**
 * Data Exporter - 数据导出
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

// 导出CSV
function exportCSV(filtered) {
  if (filtered.length === 0) {
    console.log('📭 没有记录');
    return;
  }

  const headers = ['ID', '项目', '任务', '开始时间', '结束时间', '时长(秒)', '时长', '费率', '货币', '收入'];
  const symbol = CURRENCY_SYMBOLS[filtered[0].currency] || filtered[0].currency;

  const rows = filtered.map(r => [
    r.id,
    r.project,
    r.task || '',
    new Date(r.startTime).toLocaleString('zh-CN'),
    new Date(r.endTime).toLocaleString('zh-CN'),
    r.duration,
    r.durationHuman,
    r.rate,
    r.currency,
    `${symbol}${r.earnings.toFixed(2)}`
  ]);

  // CSV格式化
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  console.log(csv);
}

// 导出JSON
function exportJSON(filtered) {
  console.log(JSON.stringify(filtered, null, 2));
}

// 导出文本
function exportText(filtered) {
  if (filtered.length === 0) {
    console.log('📭 没有记录');
    return;
  }

  const symbol = CURRENCY_SYMBOLS[filtered[0].currency] || filtered[0].currency;

  let text = '工时记录导出\n';
  text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n';

  filtered.forEach((r, i) => {
    text += `${i + 1}. ${r.project}\n`;
    text += `   任务：${r.task || '未命名'}\n`;
    text += `   时间：${new Date(r.startTime).toLocaleString('zh-CN')} - ${new Date(r.endTime).toLocaleString('zh-CN')}\n`;
    text += `   时长：${r.durationHuman}\n`;
    text += `   收入：${symbol}${r.earnings.toFixed(2)}\n`;
    text += '\n';
  });

  const totalDuration = filtered.reduce((sum, r) => sum + r.duration, 0);
  const totalEarnings = filtered.reduce((sum, r) => sum + r.earnings, 0);

  text += '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n';
  text += `总计：${(totalDuration / 3600).toFixed(1)}小时  ${symbol}${totalEarnings.toFixed(2)}\n`;

  console.log(text);
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
Data Exporter - 数据导出

用法:
  node export.js <format> [options]

格式:
  csv         CSV格式
  json        JSON格式
  txt         文本格式

选项:
  --month     指定月份（YYYY-MM），默认全部
  --project   指定项目，默认全部
  --output    输出文件

示例:
  # 导出全部数据为CSV
  node export.js csv > records.csv

  # 导出本月数据
  node export.js csv --month 2026-03 > march.csv

  # 导出指定项目
  node export.js csv --project "网站开发" > web-dev.csv

  # 导出为JSON
  node export.js json --month 2026-03 > march.json

  # 导出为文本
  node export.js txt --project "网站开发"
`);
    process.exit(0);
  }

  const format = args[0];
  const params = parseArgs(args.slice(1));

  // 过滤记录
  let filtered = [...records];

  // 按月份过滤
  if (params.month) {
    filtered = filtered.filter(r => r.startTime.startsWith(params.month));
  }

  // 按项目过滤
  if (params.project) {
    filtered = filtered.filter(r => r.project === params.project);
  }

  // 导出
  switch (format) {
    case 'csv':
      exportCSV(filtered);
      break;

    case 'json':
      exportJSON(filtered);
      break;

    case 'txt':
      exportText(filtered);
      break;

    default:
      console.log(`❌ 未知格式: ${format}`);
      process.exit(1);
  }
}

main();
