---
name: freelance-proposal-generator
description: AI-powered freelance proposal generator with professional templates and customization options
version: 1.0.0
author: doge
tags:
  - freelance
  - proposal
  - ai
  -赚钱
  - productivity
---

# Freelance Proposal Generator

AI 驱动的自由职业提案生成器，帮助快速创建专业提案，提高订单转化率。

## 功能

- 📝 **专业模板**: 多种行业提案模板
- 🤖 **AI 生成**: 基于项目需求自动生成提案
- 💰 **智能报价**: 根据项目复杂度自动计算报价
- 📊 **成功率跟踪**: 记录提案成功率和优化建议
- 📦 **项目管理**: 关联提案到具体项目

## 使用方法

### 生成新提案

```bash
cd ~/.openclaw/workspace/skills/freelance-proposal-generator
node src/generate.js
```

### 查看所有提案

```bash
node src/list.js
```

### 分析成功率

```bash
node src/analyze.js
```

## 配置

配置文件 `config/`:
- `templates/`: 提案模板
- `settings.json`: 默认设置
- `skills.json`: 技能和经验库

## 数据存储

- 提案记录: `data/proposals.json`
- 成功统计: `data/analytics.json`
- 客户信息: `data/clients.json`

## 技能评分

- 实用性: 5/5
- 赚钱潜力: 5/5
- 小红书价值: 3/5
- 安装难度: 3/5
- **总分: 16/20**

## 路线图

- [ ] 多语言支持
- [ ] 提案A/B测试
- [ ] 客户跟进提醒
- [ ] 小红书内容生成（分享提案技巧）
