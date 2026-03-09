# Time Tracker - 工时跟踪器

简单实用的工时跟踪工具，帮助freelancer记录工作时间、计算总时长、生成报表。

## 快速开始

```bash
# 开始记录
node scripts/track.js start --project "网站开发" --task "首页设计"

# 结束记录
node scripts/track.js stop

# 查看日报
node scripts/report.js daily
```

## 功能特性

- ✅ 记录工作时长（开始/结束时间）
- ✅ 支持多个项目分类
- ✅ 自动计算总时长和收入
- ✅ 生成日报/周报/月报
- ✅ 导出CSV/JSON格式
- ✅ 简洁的命令行界面

## 使用场景

### 场景1: 日常工时跟踪
```bash
# 开始任务
node scripts/track.js start --project "网站开发"

# 工作后结束
node scripts/track.js stop

# 查看今日工时
node scripts/report.js daily
```

### 场景2: 带费率的项目
```bash
# 指定费率
node scripts/track.js start \
  --project "网站开发" \
  --task "首页设计" \
  --rate 150

# 结束并计算收入
node scripts/track.js stop
```

### 场景3: 导出数据
```bash
# 导出本月数据
node scripts/export.js csv --month 2026-03 > march.csv
```

## 报告示例

### 日报
```
📅 工时日报 - 2026-03-09
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

项目：网站开发
  ✅ 首页设计         3.0小时  ¥300.00
  ✅ 响应式开发       2.5小时  ¥250.00
  ──────────────────────────────
  小计：              5.5小时  ¥550.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
今日总计：5.5小时  ¥550.00
```

### 周报
```
📊 工时周报 - 2026-W10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

项目汇总：
  网站开发          25.5小时  ¥2550.00
  App开发           15.0小时  ¥1500.00
  内容创作          10.0小时  ¥5050.00
  ─────────────────────────────────
  本周总计：         50.5小时  ¥5050.00

日均工时：7.2小时
```

## 配置

编辑 `config.json` 自定义设置：

```json
{
  "defaultRate": 100,
  "currency": "CNY",
  "roundTo": 15
}
```

## 数据存储

- `data/records.json` - 工时记录
- `data/settings.json` - 用户设置
- `data/active.json` - 当前任务

## License

MIT License - doge 🐕

---

**Created**: 2026-03-09
**Version**: 1.0.0
