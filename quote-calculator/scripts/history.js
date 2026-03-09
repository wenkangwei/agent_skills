#!/usr/bin/env node

/**
 * Quote History Manager - 报价历史记录管理
 */

const fs = require('fs');
const path = require('path');

// 数据文件路径
const DATA_PATH = path.join(__dirname, '..', 'data');
const QUOTES_PATH = path.join(DATA_PATH, 'quotes.json');

// 加载历史记录
function loadQuotes() {
  try {
    if (fs.existsSync(QUOTES_PATH)) {
      return JSON.parse(fs.readFileSync(QUOTES_PATH, 'utf8'));
    }
  } catch (err) {
    console.error('❌ 无法加载历史记录:', err.message);
  }
  return [];
}

// 保存历史记录
function saveQuotes(quotes) {
  try {
    fs.writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
    return true;
  } catch (err) {
    console.error('❌ 无法保存历史记录:', err.message);
    return false;
  }
}

// 格式化货币
function formatCurrency(amount, currency) {
  const symbols = { CNY: '¥', USD: '$', EUR: '€' };
  const symbol = symbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

// 列出所有报价
function listQuotes(quotes, options = {}) {
  if (quotes.length === 0) {
    console.log('📭 没有历史记录');
    return;
  }

  console.log(`\n📋 报价历史记录 (${quotes.length} 条)\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  quotes.forEach((quote, index) => {
    console.log(`#${index + 1} ${quote.id}`);
    console.log(`   模式: ${quote.mode}`);
    console.log(`   总计: ${formatCurrency(quote.total, quote.currency)}`);
    console.log(`   时间: ${new Date(quote.createdAt).toLocaleString('zh-CN')}`);

    if (options.details) {
      console.log(`   详情:`);
      if (quote.mode === 'hourly') {
        console.log(`     费率: ${quote.details.rate}/小时 × ${quote.details.hours}小时 × ${quote.details.complexityFactor}`);
      } else if (quote.mode === 'per-item') {
        console.log(`     单价: ${quote.details.price} × ${quote.details.quantity}件 (${quote.details.discountFactor}折扣)`);
      } else if (quote.mode === 'project') {
        console.log(`     基础: ${quote.details.base} + 功能: ${quote.details.featuresTotal} - 折扣: ${quote.details.discount}`);
      }
    }

    console.log('');
  });

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 显示报价详情
function showQuote(quotes, id) {
  const quote = quotes.find(q => q.id === id || quotes.indexOf(q) + 1 === Number(id));

  if (!quote) {
    console.error(`❌ 未找到报价: ${id}`);
    return;
  }

  console.log(`\n📋 报价单 #${quote.id}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`计费模式: ${quote.mode}\n`);

  if (quote.mode === 'hourly') {
    console.log(`小时费率: ${quote.details.rate}`);
    console.log(`工作小时: ${quote.details.hours}`);
    console.log(`复杂度: ${quote.details.complexity} (系数 ${quote.details.complexityFactor})`);
  } else if (quote.mode === 'per-item') {
    console.log(`单价: ${quote.details.price}`);
    console.log(`数量: ${quote.details.quantity}`);
    console.log(`折扣系数: ${quote.details.discountFactor}`);
    console.log(`节省金额: ${quote.details.discountAmount}`);
  } else if (quote.mode === 'project') {
    console.log(`基础价格: ${quote.details.base}`);
    if (quote.details.features.length > 0) {
      console.log(`额外功能: ${quote.details.features.join(', ')}`);
      console.log(`功能总价: ${quote.details.featuresTotal}`);
    }
    console.log(`折扣: ${quote.details.discount}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`小计: ${formatCurrency(quote.subtotal, quote.currency)}`);
  if (quote.taxRate > 0) {
    console.log(`税费 (${quote.taxRate * 100}%): ${formatCurrency(quote.taxAmount, quote.currency)}`);
  }
  console.log(`总计: ${formatCurrency(quote.total, quote.currency)}\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`创建时间: ${new Date(quote.createdAt).toLocaleString('zh-CN')}`);
  console.log(`有效期: ${quote.validDays}天\n`);
}

// 删除报价
function deleteQuote(quotes, id) {
  const index = quotes.findIndex(q => q.id === id || quotes.indexOf(q) + 1 === Number(id));

  if (index === -1) {
    console.error(`❌ 未找到报价: ${id}`);
    return false;
  }

  const deleted = quotes.splice(index, 1)[0];
  const success = saveQuotes(quotes);

  if (success) {
    console.log(`✅ 已删除报价: ${deleted.id}`);
  }

  return success;
}

// 统计信息
function showStats(quotes) {
  if (quotes.length === 0) {
    console.log('📭 没有数据可统计');
    return;
  }

  const totalQuotes = quotes.length;
  const totalAmount = quotes.reduce((sum, q) => sum + q.total, 0);
  const avgAmount = totalAmount / totalQuotes;

  const modeCounts = {
    hourly: quotes.filter(q => q.mode === 'hourly').length,
    'per-item': quotes.filter(q => q.mode === 'per-item').length,
    project: quotes.filter(q => q.mode === 'project').length
  };

  console.log(`\n📊 报价统计\n`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`总报价数: ${totalQuotes}`);
  console.log(`总金额: ${formatCurrency(totalAmount, quotes[0].currency)}`);
  console.log(`平均金额: ${formatCurrency(avgAmount, quotes[0].currency)}\n`);

  console.log(`按模式分布:`);
  console.log(`  按时计费: ${modeCounts.hourly} (${(modeCounts.hourly / totalQuotes * 100).toFixed(1)}%)`);
  console.log(`  按件计费: ${modeCounts['per-item']} (${(modeCounts['per-item'] / totalQuotes * 100).toFixed(1)}%)`);
  console.log(`  按项目计费: ${modeCounts.project} (${(modeCounts.project / totalQuotes * 100).toFixed(1)}%)\n`);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// 导出报价
function exportQuote(quotes, id, format = 'json') {
  const quote = quotes.find(q => q.id === id || quotes.indexOf(q) + 1 === Number(id));

  if (!quote) {
    console.error(`❌ 未找到报价: ${id}`);
    return;
  }

  if (format === 'json') {
    console.log(JSON.stringify(quote, null, 2));
  } else if (format === 'text') {
    // 简化版文本输出
    console.log(`报价单 #${quote.id}`);
    console.log(`总计: ${formatCurrency(quote.total, quote.currency)}`);
    console.log(`创建时间: ${new Date(quote.createdAt).toLocaleString('zh-CN')}`);
  }
}

// 清空所有记录
function clearAll(quotes) {
  if (quotes.length === 0) {
    console.log('📭 没有记录可清空');
    return;
  }

  console.log(`⚠️  确定要删除所有 ${quotes.length} 条记录吗？(yes/no)`);
  console.log('⚠️  此操作不可恢复！');
}

// 主函数
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
📋 Quote History Manager - 报价历史记录管理

用法:
  node scripts/history.js <command> [arguments]

命令:
  list [options]      列出所有报价
  show <id>           显示报价详情
  delete <id>         删除指定报价
  stats               显示统计信息
  export <id>         导出报价 (JSON格式)
  clear               清空所有记录 (需确认)

list 选项:
  --details           显示详细信息

示例:
  # 列出所有报价
  node scripts/history.js list

  # 显示详情
  node scripts/history.js show 20260309-001

  # 显示第3个报价
  node scripts/history.js show 3

  # 删除报价
  node scripts/history.js delete 20260309-001

  # 查看统计
  node scripts/history.js stats

  # 导出报价
  node scripts/history.js export 20260309-001 > quote.json
`);
    process.exit(0);
  }

  const command = args[0];
  const quotes = loadQuotes();

  switch (command) {
    case 'list':
      listQuotes(quotes, { details: args.includes('--details') });
      break;

    case 'show':
      if (args.length < 2) {
        console.error('❌ 错误: show 命令需要指定报价ID');
        process.exit(1);
      }
      showQuote(quotes, args[1]);
      break;

    case 'delete':
      if (args.length < 2) {
        console.error('❌ 错误: delete 命令需要指定报价ID');
        process.exit(1);
      }
      deleteQuote(quotes, args[1]);
      break;

    case 'stats':
      showStats(quotes);
      break;

    case 'export':
      if (args.length < 2) {
        console.error('❌ 错误: export 命令需要指定报价ID');
        process.exit(1);
      }
      exportQuote(quotes, args[1], args[2] || 'json');
      break;

    case 'clear':
      clearAll(quotes);
      break;

    default:
      console.error(`❌ 错误: 未知命令 '${command}'`);
      process.exit(1);
  }
}

// 运行主函数
main();
