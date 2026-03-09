#!/usr/bin/env node

/**
 * Interactive Quote Calculator - 交互式报价计算器
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
📋 Quote Calculator - 交互式报价计算器
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  // 选择计费模式
  console.log('请选择计费模式:');
  console.log('  1. 按时计费 (hourly)');
  console.log('  2. 按件计费 (per-item)');
  console.log('  3. 按项目计费 (project)\n');

  const modeChoice = await question('请输入选择 (1-3): ');
  let mode;

  switch (modeChoice.trim()) {
    case '1':
      mode = 'hourly';
      break;
    case '2':
      mode = 'per-item';
      break;
    case '3':
      mode = 'project';
      break;
    default:
      console.log('❌ 无效选择');
      rl.close();
      return;
  }

  // 收集参数
  let command = `node ${__dirname}/calculate.js ${mode}`;

  if (mode === 'hourly') {
    console.log('\n⏰ 按时计费\n');
    const rate = await question('小时费率: ');
    const hours = await question('工作小时数: ');
    const complexity = await question('复杂度 (simple|normal|complex|very-complex) [normal]: ') || 'normal';

    command += ` --rate ${rate} --hours ${hours} --complexity ${complexity}`;

  } else if (mode === 'per-item') {
    console.log('\n📦 按件计费\n');
    const price = await question('单价: ');
    const quantity = await question('数量: ');

    command += ` --price ${price} --quantity ${quantity}`;

  } else if (mode === 'project') {
    console.log('\n🎯 按项目计费\n');
    const base = await question('基础价格: ');
    const features = await question('额外功能费用 (用逗号分隔): ');
    const discount = await question('折扣金额 [0]: ') || '0';

    command += ` --base ${base}`;

    if (features.trim()) {
      command += ` --features ${features}`;
    }

    if (discount !== '0') {
      command += ` --discount ${discount}`;
    }
  }

  // 通用参数
  console.log('\n⚙️  通用设置\n');
  const currency = await question('货币 (CNY|USD|EUR) [CNY]: ') || 'CNY';
  const tax = await question('税率 (0-1) [0]: ') || '0';
  const save = await question('保存到历史记录? (y/n) [n]: ') || 'n';

  command += ` --currency ${currency} --tax ${tax}`;
  if (save.toLowerCase() === 'y') {
    command += ' --save';
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('计算中...\n');

  // 执行计算
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      rl.close();
      return;
    }

    if (stderr) {
      console.error(`❌ ${stderr}`);
      rl.close();
      return;
    }

    console.log(stdout);
    rl.close();
  });
}

main();
