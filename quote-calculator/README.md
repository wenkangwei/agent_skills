# Quote Calculator - 项目报价计算器

一个灵活的项目报价计算器，帮助freelancer快速生成准确的报价单。

## 快速开始

```bash
# 基本用法
node scripts/calculate.js hourly --rate 100 --hours 8

# 查看帮助
node scripts/calculate.js --help

# 交互模式
node scripts/interactive.js
```

## 功能特性

- ✅ 多种计费模式（按时、按件、按项目）
- ✅ 复杂度和折扣计算
- ✅ 报价历史记录
- ✅ 多格式输出（文本、JSON）
- ✅ 可配置的税费和货币

## 计费模式

### 按时计费
适用于咨询、设计、开发等按时间计费的项目。

```
报价 = 小时费率 × 工作小时数 × 复杂度系数
```

### 按件计费
适用于批量内容创作、图片处理等。

```
报价 = 单价 × 数量 × 折扣系数
```

### 按项目计费
适用于固定项目，支持额外功能和折扣。

```
报价 = 基础价格 + 额外功能费用 - 折扣
```

## 使用示例

### 示例1: 网站开发
```bash
node scripts/calculate.js project \
  --base 5000 \
  --features 2000,1000,500 \
  --discount 300
```

输出:
```
小计: ¥7500
折扣: ¥300
总计: ¥7200
```

### 示例2: 批量文章
```bash
node scripts/calculate.js per-item \
  --price 100 \
  --quantity 30
```

输出:
```
小计: ¥3000
折扣 (5%): ¥150
总计: ¥2850
```

### 示例3: 技术咨询
```bash
node scripts/calculate.js hourly \
  --rate 200 \
  --hours 10 \
  --complexity complex
```

输出:
```
小计: ¥2000
复杂度系数: 1.3
总计: ¥2600
```

## 配置

编辑 `config.json` 自定义默认设置：

```json
{
  "defaultCurrency": "CNY",
  "defaultTaxRate": 0,
  "defaultComplexity": "normal",
  "quoteValidityDays": 7
}
```

## 历史记录

查看和管理之前的报价：

```bash
# 查看所有历史
node scripts/history.js list

# 查看详情
node scripts/history.js show 20260309-001

# 删除记录
node scripts/history.js delete 20260309-001
```

## 数据文件

- `data/quotes.json` - 报价历史记录
- `data/settings.json` - 用户设置
- `config.json` - 全局配置

## 开发

### 目录结构
```
quote-calculator/
├── SKILL.md          # OpenClaw技能配置
├── README.md         # 本文件
├── config.json       # 配置文件
├── scripts/          # 脚本
│   ├── calculate.js  # 计算主程序
│   ├── interactive.js # 交互模式
│   └── history.js    # 历史记录管理
└── data/             # 数据文件
```

### 运行测试
```bash
node scripts/test.js
```

## License

MIT License - doge 🐕

---

**Created**: 2026-03-09
**Version**: 1.0.0
