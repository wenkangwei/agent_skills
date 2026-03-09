---
name: quote-calculator
description: 快速项目报价计算器，支持多种计费模式（按时、按件、按项目）
homepage: https://github.com/openclaw/skills
metadata:
  {
    "openclaw":
      {
        "requires": { "bins": ["node"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "node",
              "bins": ["node"],
              "label": "Install Node.js Runtime"
            }
          ]
      },
    "skill":
      {
        "name": "Quote Calculator",
        "version": "1.0.0",
        "category": "finance",
        "author": "doge",
        "tags": ["quote", "pricing", "freelance", "billing", "project"]
      }
  }
---

# Quote Calculator - 快速项目报价计算器

## 概述

一个灵活的项目报价计算器，支持多种计费模式，帮助freelancer快速生成准确的报价单。

**核心特性：**
1. 多种计费模式：按时计费、按件计费、按项目计费
2. 灵活的折扣和税费设置
3. 支持多项目组合报价
4. 导出报价单（文本、JSON）
5. 报价历史记录

## 计费模式

### 1. 按时计费 (hourly)
```
报价 = 小时费率 × 工作小时数 × 复杂度系数
```

**复杂度系数：**
- 简单: 0.8
- 普通: 1.0
- 复杂: 1.3
- 非常复杂: 1.6

### 2. 按件计费 (per-item)
```
报价 = 单价 × 数量 × 折扣系数
```

**折扣系数：**
- 1-10件: 1.0
- 11-50件: 0.95
- 51-100件: 0.9
- >100件: 0.85

### 3. 按项目计费 (project)
```
报价 = 基础价格 + 额外功能费用 - 折扣
```

## 使用方法

### 基本用法

```bash
# 按时计费
node scripts/calculate.js hourly --rate 100 --hours 8 --complexity normal

# 按件计费
node scripts/calculate.js per-item --price 50 --quantity 20

# 按项目计费
node scripts/calculate.js project --base 5000 --features 1000,500 --discount 200

# 导出JSON
node scripts/calculate.js hourly --rate 100 --hours 8 --format json > quote.json
```

### 交互模式

```bash
node scripts/interactive.js
```

### 历史记录

```bash
# 查看历史
node scripts/history.js list

# 查看详情
node scripts/history.js show <quote-id>

# 删除记录
node scripts/history.js delete <quote-id>
```

## 参数说明

### 通用参数
- `--format <type>`: 输出格式 (text|json)，默认text
- `--currency <code>`: 货币代码 (CNY|USD|EUR)，默认CNY
- `--tax <rate>`: 税率 (0-1)，默认0
- `--save`: 保存到历史记录

### 按时计费参数
- `--rate <number>`: 小时费率
- `--hours <number>`: 工作小时数
- `--complexity <level>`: 复杂度 (simple|normal|complex|very-complex)

### 按件计费参数
- `--price <number>`: 单价
- `--quantity <number>`: 数量

### 按项目计费参数
- `--base <number>`: 基础价格
- `--features <list>`: 额外功能费用（逗号分隔）
- `--discount <number>`: 折扣金额

## 输出示例

### 文本格式
```
📋 报价单 #20260309-001
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

计费模式: 按时计费
小时费率: ¥100/小时
工作小时: 8小时
复杂度: 普通 (系数 1.0)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
小计: ¥800
税费 (0%): ¥0
总计: ¥800

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
创建时间: 2026-03-09 12:30:00
有效期: 7天
```

### JSON格式
```json
{
  "id": "20260309-001",
  "mode": "hourly",
  "subtotal": 800,
  "tax": 0,
  "total": 800,
  "currency": "CNY",
  "details": {
    "rate": 100,
    "hours": 8,
    "complexity": "normal",
    "complexityFactor": 1.0
  },
  "createdAt": "2026-03-09T12:30:00.000Z",
  "validDays": 7
}
```

## 配置文件

### config.json
```json
{
  "defaultCurrency": "CNY",
  "defaultTaxRate": 0,
  "defaultComplexity": "normal",
  "quoteValidityDays": 7,
  "historyMaxSize": 100
}
```

## 数据存储

### 历史记录存储位置
- `data/quotes.json`: 所有报价记录
- `data/settings.json`: 用户设置

## 常见场景

### 场景1: 网站开发报价
```bash
node scripts/calculate.js project \
  --base 5000 \
  --features 2000,1000,500 \
  --discount 300 \
  --save
```

### 场景2: 批量设计服务
```bash
node scripts/calculate.js per-item \
  --price 100 \
  --quantity 30 \
  --currency USD \
  --save
```

### 场景3: 技术咨询
```bash
node scripts/calculate.js hourly \
  --rate 200 \
  --hours 10 \
  --complexity complex \
  --save
```

## 高级功能

### 批量报价
```bash
node scripts/batch.js batch-quotes.json
```

### 报价模板
```bash
# 使用模板
node scripts/calculate.js --template website-dev

# 查看可用模板
node scripts/calculate.js --list-templates
```

### 报价对比
```bash
node scripts/compare.js quote1.json quote2.json
```

## 开发计划

- [x] 基本计算功能
- [x] 多种计费模式
- [x] 历史记录
- [ ] 报价模板系统
- [ ] PDF导出
- [ ] 邮件发送
- [ ] 客户管理
- [ ] 收款跟踪

## License

MIT License

---

**Created**: 2026-03-09
**Author**: doge 🐕
**Version**: 1.0.0
