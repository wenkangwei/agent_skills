#!/usr/bin/env node

/**
 * Interactive Mode - 交互模式
 */

const { exec } = require('child_process');
const path = require('path');

const SCRIPTS_PATH = path.join(__dirname);

function question(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.once('data', (data) => {
      resolve(data.toString().trim());
      process.stdin.pause();
    });
  });
}

async function main() {
  console.log(`
⏰ Time Tracker - 交互模式
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  console.log('请选择操作:');
  console.log('  1. 开始记录');
  console.log('  2. 停止记录');
  console.log('  3. 查看状态');
  console.log('  4. 查看记录');
  console.log('  5. 生成报告');
  console.log('  6. 导出数据\n');

  const choice = await question('请输入选择 (1-6): ');

  switch (choice) {
    case '1':
      await startRecord();
      break;
    case '2':
      execRecord('stop');
      break;
    case '3':
      execRecord('status');
      break;
    case '4':
      await listRecords();
      break;
    case '5':
      await generateReport();
      break;
    case '6':
      await exportData();
      break;
    default:
      console.log('❌ 无效选择');
  }
}

async function startRecord() {
  console.log('\n⏰ 开始记录工时\n');
  const project = await question('项目名称: ');
  const task = await question('任务描述（可选）: ');
  const rate = await question('小时费率（默认100）: ') || '100';
  const currency = await question('货币（CNY|USD|EUR，默认CNY）: ') || 'CNY';

  let command = `node ${path.join(SCRIPTS_PATH, 'track.js')} start --project "${project}" --rate ${rate} --currency ${currency}`;
  if (task) {
    command += ` --task "${task}"`;
  }

  console.log('\n执行中...\n');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

function execRecord(command) {
  const fullCommand = `node ${path.join(SCRIPTS_PATH, 'track.js')} ${command}`;
  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

async function listRecords() {
  console.log('\n📋 查看记录\n');
  const limit = await question('显示条数（默认20）: ') || '20';
  const project = await question('筛选项目（可选）: ');

  let command = `node ${path.join(SCRIPTS_PATH, 'track.js')} list --limit ${limit}`;
  if (project) {
    command += ` --project "${project}"`;
  }

  console.log('\n执行中...\n');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

async function generateReport() {
  console.log('\n📊 生成报告\n');
  console.log('报告类型:');
  console.log('  1. 日报');
  console.log('  2. 周报');
  console.log('  3. 月报');
  console.log('  4. 项目报告\n');

  const reportChoice = await question('请选择 (1-4): ');
  let command;

  switch (reportChoice) {
    case '1':
      const date = await question('日期（默认今天）: ');
      command = `node ${path.join(SCRIPTS_PATH, 'report.js')} daily`;
      if (date) command += ` --date ${date}`;
      break;
    case '2':
      const week = await question('周（默认本周）: ');
      command = `node ${path.join(SCRIPTS_PATH, 'report.js')} weekly`;
      if (week) command += ` --week ${week}`;
      break;
    case '3':
      const month = await question('月份（默认本月）: ');
      command = `node ${path.join(SCRIPTS_PATH, 'report.js')} monthly`;
      if (month) command += ` --month ${month}`;
      break;
    case '4':
      const project = await question('项目名称: ');
      command = `node ${path.join(SCRIPTS_PATH, 'report.js')} project --project "${project}"`;
      break;
    default:
      console.log('❌ 无效选择');
      return;
  }

  console.log('\n执行中...\n');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

async function exportData() {
  console.log('\n📤 导出数据\n');
  console.log('格式:');
  console.log('  1. CSV');
  console.log('  2. JSON');
  console.log('  3. TXT\n');

  const formatChoice = await question('请选择格式 (1-3): ');
  let format;

  switch (formatChoice) {
    case '1':
      format = 'csv';
      break;
    case '2':
      format = 'json';
      break;
    case '3':
      format = 'txt';
      break;
    default:
      console.log('❌ 无效选择');
      return;
  }

  const project = await question('筛选项目（可选）: ');
  const month = await question('筛选月份（可选，如 2026-03）: ');

  let command = `node ${path.join(SCRIPTS_PATH, 'export.js')} ${format}`;
  if (project) command += ` --project "${project}"`;
  if (month) command += ` --month ${month}`;

  console.log('\n执行中...\n');
  console.log('💡 输出重定向到文件: > export.csv\n');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`❌ ${stderr}`);
      return;
    }
    console.log(stdout);
  });
}

main();
