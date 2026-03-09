---
name: time-tracker
description: 工时跟踪器，记录工作时间、计算时长、生成报表，支持多项目和导出CSV
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
        "name": "Time Tracker",
        "version": "1.0.0",
        "category": "finance",
        "author": "doge",
        "tags": ["time", "tracking", "freelance", "productivity", "billing"]
      }
  }
---

# Time Tracker - 工时跟踪器

## 概述

一个简单实用的工时跟踪器，帮助freelancer记录工作时间、计算总时长、生成日报/周报，支持CSV导出。

**核心特性：**
1. 记录工作时长（开始/结束时间）
2. 支持多个项目分类
3. 自动计算总时长和工时费
4. 生成日报/周报
5. 导出CSV格式
6. 简洁的命令行界面

## 使用方法

### 基本用法

```bash
# 开始记录工时
node scripts/track.js start --project "网站开发" --task "首页设计"

# 结束记录
node scripts/track.js stop

# 查看当前记录
node scripts/track.js status

# 查看日报
node scripts/report.js daily

# 查看周报
node scripts/report.js weekly

# 导出CSV
node scripts/export.js csv > time-records.csv
```

### 交互模式

```bash
node scripts/interactive.js
```

## 数据结构

### 工时记录格式
```json
{
  "id": "20260309-001",
  "project": "网站开发",
  "task": "首页设计",
  "startTime": "2026-03-09T09:00:00.000Z",
  "endTime": "2026-03-09T12:00:00.000Z",
  "duration": 10800,
  "durationHuman": "3小时0分钟",
  "rate": 100,
  "earnings": 300
}
```

## 报告格式

### 日报示例
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
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 周报示例
```
📊 工时周报 - 2026-W10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

项目汇总：
  网站开发          25.5小时  ¥2550.00
  App开发           15.0小时  ¥1500.00
  内容创作          10.0小时  ¥1000.00
  ─────────────────────────────────
  本周总计：         50.5小时  ¥5050.00

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
日均工时：7.2小时
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 配置文件

### config.json
```json
{
  "defaultRate": 100,
  "currency": "CNY",
  "roundTo": 15,
  "autoStop": false,
  "notification": true
}
```

## 数据存储

### 文件位置
- `data/records.json`: 工时记录
- `data/settings.json`: 用户设置
- `data/active.json`: 当前正在进行的任务

## 常见场景

### 场景1: 简单跟踪
```bash
# 开始任务
node scripts/track.js start --project "网站开发"

# 工作一段时间后结束
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

# 结束并自动计算收入
node scripts/track.js stop
```

### 场景3: 导出数据
```bash
# 导出本月数据
node scripts/export.js csv --month 2026-03 > march.csv

# 导出单个项目
node scripts/export.js csv --project "网站开发" > web-dev.csv
```

## 高级功能

### 自动四舍五入
```json
{
  "roundTo": 15
}
```
将工时四舍五入到15分钟间隔。

### 多币种支持
```bash
node scripts/track.js start --project "国际项目" --currency USD --rate 50
```

### 标签管理
```bash
node scripts/track.js start \
  --project "网站开发" \
  --tags "前端,设计,紧急"
```

## 命令参考

### track.js - 工时跟踪
```bash
node scripts/track.js <command> [options]

命令:
  start       开始记录
  stop        停止记录
  status      查看状态
  list        查看记录
  delete      删除记录

选项:
  --project   项目名称
  --task      任务描述
  --rate      小时费率
  --tags      标签（逗号分隔）
  --currency  货币（CNY|USD|EUR）
```

### report.js - 报告生成
```bash
node scripts/report.js <type> [options]

类型:
  daily       日报
  weekly      周报
  monthly     月报
  project     项目报告

选项:
  --project   指定项目
  --date      指定日期（日报）
  --week      指定周（周报）
  --month     指定月份（月报）
```

### export.js - 数据导出
```bash
node scripts/export.js <format> [options]

格式:
  csv         CSV格式
  json        JSON格式
  txt         文本格式

选项:
  --month     指定月份
  --project   指定项目
  --output    输出文件
```

## 开发计划

- [x] 基本工时记录
- [x] 日报/周报生成
- [x] CSV导出
- [ ] PDF导出
- [ ] 图表可视化
- [ ] 集成Toggl API
- [ ] 语音提醒
- [ ] 多语言支持

## License

MIT License

---

**Created**: 2026-03-09
**Author**: doge 🐕
**Version**: 1.0.0
