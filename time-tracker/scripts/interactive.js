#!/usr/bin/env node

/**
 * Interactive Mode - 交互模式
 */

const readline = require('readline');
const { exec } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log(`
🕐 Time Tracker - 交互式工时跟踪
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  while (true) {
    console.log(`
1. 开始记录工时
2. 停止记录工时
3. 查看当前状态
4. 查看记录
5. 查看日报
6. 查看周报
7. 退出
`);

    const choice = await question('请选择 (1-7): ');

    switch (choice.trim()) {
      case '1':
        await startTask();
        break;
      case '2':
        await stopTask();
        break;
      case '3':
        await showStatus();
        break;
      case '4':
        await listRecords();
        break;
      case '5':
        await showDaily();
        break;
      case '6':
        await showWeekly();
        break;
      case '7':
        console.log('👋 再见！');
        rl.close();
        return;
      default:
        console.log('❌ 无效选择\n');
    }
  }
}

async function startTask() {
  console.log('\n📝 开始记录工时\n');

  const project = await question('项目名称: ');
  const task = await question('任务描述: ');
  const rate = await question('小时费率 [100]: ') || '100';

  const command = `node ${__dirname}/track.js start --project "${project}" --task "${task}" --rate ${rate}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    console.log(stdout);
  });
}

async function stopTask() {
  console.log('\n⏹️  停止记录工时\n');

  exec(`node ${__dirname}/track.js stop`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    console.log(stdout);
  });
}

async function showStatus() {
  console.log('\n⏱️  当前状态\n');

  exec(`node ${__dirname}/track.js status`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    console.log(stdout);
  });
}

async function listRecords() {
  const limit = await question('显示数量 [10]: ') || '10';

  exec(`node ${__dirname}/track.js list --limit ${limit}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    console.log(stdout);
  });
}

async function showDaily() {
  const date = await question('日期 [今天]: ');

  let command = `node ${__dirname}/report.js daily`;
  if (date.trim()) {
    command += ` --date ${date}`;
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    console.log(stdout);
  });
}

async function showWeekly() {
  console.log('\n📊 本周周报\n');

  exec(`node ${__dirname}/report.js weekly`, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ ${error.message}`);
      return;
    }
    console.log(stdout);
  });
}

main();
