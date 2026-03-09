#!/usr/bin/env node

/**
 * Quote Calculator - 计算报价
 * 支持：按时计费、按件计费、按项目计费
 */

const fs = require('fs');
const path = require('path');

// 配置文件路径
const CONFIG_PATH = path.join(__dirname, '..', 'config.json');
const DATA_PATH = path.join(__dirname, '..', 'data');
const QUOTES_PATH = path.join(DATA_PATH, 'quotes.json');

// 复杂度系数
const COMPLEXITY_FACTORS = {
  simple: 0.8,
  normal: 1.0,
  complex: 1.3,
  'very-complex': 1.6
};

// 折扣系数
const DISCOUNT_FACTORS = [
  { max: 10, factor: 1.0 },
  { max: 50, factor: 0.95 },
  { max: 100, factor: 0.9 },
  { max: Infinity, factor: 0.85 }
];

// 货币符号
const CURRENCY_SYMBOLS = {
  CNY: '¥',
  USD: '$',
  EUR: '€'
};

// 加载配置
let config = {};
try {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
} catch (err) {
  console.warn('⚠️  无法加载配置文件，使用默认值');
  config = {
    defaultCurrency: 'CNY',
    defaultTaxRate: 0,
    defaultComplexity: 'normal',
    quoteValidityDays: 7
  };
}

// 确保数据目录存在
if (!fs.existsSync(DATA_PATH)) {
  fs.mkdirSync(DATA_PATH, { recursive: true });
}

// 加载历史记录
let quotes = [];
try {
  if (fs.existsSync(QUOTES_PATH)) {
    quotes = JSON.parse(fs.readFileSync(QUOTES_PATH, 'utf8'));
  }
} catch (err) {
  console.warn('⚠️  无法加载历史记录');
}

// 生成报价ID
function generateQuoteId() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${year}${month}${day}-${random}`;
}

// 计算按时计费
function calculateHourly(rate, hours, complexity = config.defaultComplexity) {
  const factor = COMPLEXITY_FACTORS[complexity] || 1.0;
  const subtotal = rate * hours * factor;
  return {
    mode: 'hourly',
    subtotal: Math.round(subtotal * 100) / 100,
    details: {
      rate: Number(rate),
      hours: Number(hours),
      complexity: complexity,
      complexityFactor: factor
    }
  };
}

// 计算按件计费
function calculatePerItem(price, quantity) {
  const factor = DISCOUNT_FACTORS.find(d => quantity <= d.max)?.factor || 1.0;
  const subtotal = price * quantity * factor;
  const discountAmount = price * quantity * (1 - factor);
  return {
    mode: 'per-item',
    subtotal: Math.round(subtotal * 100) / 100,
    details: {
      price: Number(price),
      quantity: Number(quantity),
      discountFactor: factor,
      discountAmount: Math.round(discountAmount * 100) / 100
    }
  };
}

// 计算按项目计费
function calculateProject(base, features = [], discount = 0) {
  const featuresTotal = features.reduce((sum, f) => sum + Number(f), 0);
  const subtotal = Number(base) + featuresTotal - Number(discount);
  return {
    mode: 'project',
    subtotal: Math.round(subtotal * 100) / 100,
    details: {
      base: Number(base),
      features: features.map(f => Number(f)),
      featuresTotal: featuresTotal,
      discount: Number(discount)
    }
  };
}

// 计算税费
function calculateTax(subtotal, taxRate = config.defaultTaxRate) {
  const tax = subtotal * taxRate;
  return {
    taxRate: Number(taxRate),
    taxAmount: Math.round(tax * 100) / 100,
    total: Math.round((subtotal + tax) * 100) / 100
  };
}

// 格式化货币
function formatCurrency(amount, currency = config.defaultCurrency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
}

// 输出文本格式
function outputText(quote, currency = config.defaultCurrency) {
  const symbol = CURRENCY_SYMBOLS[currency] || currency;

  let output = `\n📋 报价单 #${quote.id}\n`;
  output += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

  // 计费模式
  if (quote.mode === 'hourly') {
    output += `计费模式: 按时计费\n`;
    output += `小时费率: ${symbol}${quote.details.rate}/小时\n`;
    output += `工作小时: ${quote.details.hours}小时\n`;
    output += `复杂度: ${quote.details.complexity} (系数 ${quote.details.complexityFactor})\n`;
  } else if (quote.mode === 'per-item') {
    output += `计费模式: 按件计费\n`;
    output += `单价: ${symbol}${quote.details.price}/件\n`;
    output += `数量: ${quote.details.quantity}件\n`;
    output += `折扣: ${(1 - quote.details.discountFactor) * 100}% (节省${symbol}${quote.details.discountAmount})\n`;
  } else if (quote.mode === 'project') {
    output += `计费模式: 按项目计费\n`;
    output += `基础价格: ${symbol}${quote.details.base}\n`;
    if (quote.details.features.length > 0) {
      output += `额外功能: ${symbol}${quote.details.featuresTotal}\n`;
    }
    if (quote.details.discount > 0) {
      output += `折扣: ${symbol}${quote.details.discount}\n`;
    }
  }

  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `小计: ${formatCurrency(quote.subtotal, currency)}\n`;

  if (quote.taxRate > 0) {
    output += `税费 (${quote.taxRate * 100}%): ${formatCurrency(quote.taxAmount, currency)}\n`;
  }

  output += `总计: ${formatCurrency(quote.total, currency)}\n`;

  output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
  output += `创建时间: ${new Date(quote.createdAt).toLocaleString('zh-CN')}\n`;
  output += `有效期: ${config.quoteValidityDays}天\n`;

  return output;
}

// 输出JSON格式
function outputJson(quote) {
  return JSON.stringify(quote, null, 2);
}

// 保存报价到历史记录
function saveQuote(quote) {
  quotes.unshift(quote);

  // 限制历史记录大小
  if (quotes.length > config.historyMaxSize) {
    quotes = quotes.slice(0, config.historyMaxSize);
  }

  fs.writeFileSync(QUOTES_PATH, JSON.stringify(quotes, null, 2));
  console.log(`✅ 报价已保存到历史记录 (#${quote.id})`);
}

// 解析命令行参数
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
  const params = parseArgs(args);

  // 帮助
  if (args.length === 0 || params.help) {
    console.log(`
📋 Quote Calculator - 项目报价计算器

用法:
  node scripts/calculate.js <mode> [options]

计费模式:
  hourly         按时计费
  per-item       按件计费
  project        按项目计费

通用参数:
  --format       输出格式 (text|json)，默认text
  --currency     货币 (CNY|USD|EUR)，默认CNY
  --tax          税率 (0-1)，默认0
  --save         保存到历史记录
  --help         显示帮助

按时计费参数:
  --rate         小时费率
  --hours        工作小时数
  --complexity   复杂度 (simple|normal|complex|very-complex)，默认normal

按件计费参数:
  --price        单价
  --quantity     数量

按项目计费参数:
  --base         基础价格
  --features     额外功能费用（逗号分隔）
  --discount     折扣金额

示例:
  # 按时计费
  node scripts/calculate.js hourly --rate 100 --hours 8 --complexity normal

  # 按件计费
  node scripts/calculate.js per-item --price 50 --quantity 20

  # 按项目计费
  node scripts/calculate.js project --base 5000 --features 1000,500 --discount 200

  # 保存并导出JSON
  node scripts/calculate.js hourly --rate 100 --hours 8 --format json --save > quote.json
`);
    process.exit(0);
  }

  // 获取计费模式
  const mode = args[0];
  if (!['hourly', 'per-item', 'project'].includes(mode)) {
    console.error('❌ 错误: 无效的计费模式');
    console.error('   请使用: hourly, per-item, project');
    process.exit(1);
  }

  // 其他参数
  const format = params.format || 'text';
  const currency = params.currency || config.defaultCurrency;
  const taxRate = params.tax !== undefined ? Number(params.tax) : config.defaultTaxRate;
  const shouldSave = params.save;

  // 根据模式计算
  let result;
  if (mode === 'hourly') {
    const rate = params.rate;
    const hours = params.hours;
    const complexity = params.complexity || config.defaultComplexity;

    if (!rate || !hours) {
      console.error('❌ 错误: 按时计费需要 --rate 和 --hours 参数');
      process.exit(1);
    }

    result = calculateHourly(rate, hours, complexity);
  } else if (mode === 'per-item') {
    const price = params.price;
    const quantity = params.quantity;

    if (!price || !quantity) {
      console.error('❌ 错误: 按件计费需要 --price 和 --quantity 参数');
      process.exit(1);
    }

    result = calculatePerItem(price, quantity);
  } else if (mode === 'project') {
    const base = params.base;
    const features = params.features ? params.features.split(',').map(s => s.trim()) : [];
    const discount = params.discount || 0;

    if (!base) {
      console.error('❌ 错误: 按项目计费需要 --base 参数');
      process.exit(1);
    }

    result = calculateProject(base, features, discount);
  }

  // 计算税费
  const tax = calculateTax(result.subtotal, taxRate);

  // 构建报价对象
  const quote = {
    id: generateQuoteId(),
    mode: result.mode,
    subtotal: result.subtotal,
    taxRate: tax.taxRate,
    taxAmount: tax.taxAmount,
    total: tax.total,
    currency: currency,
    details: result.details,
    createdAt: new Date().toISOString(),
    validDays: config.quoteValidityDays
  };

  // 保存到历史记录
  if (shouldSave) {
    saveQuote(quote);
  }

  // 输出
  if (format === 'json') {
    console.log(outputJson(quote));
  } else {
    console.log(outputText(quote, currency));
  }
}

// 运行主函数
main();
