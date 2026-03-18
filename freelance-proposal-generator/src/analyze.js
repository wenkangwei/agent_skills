#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PROPOSALS_FILE = path.join(DATA_DIR, 'proposals.json');
const ANALYTICS_FILE = path.join(DATA_DIR, 'analytics.json');

function analyzeProposals() {
  if (!fs.existsSync(PROPOSALS_FILE)) {
    console.log('📝 还没有提案记录，无法分析\n');
    console.log('运行以下命令创建提案：');
    console.log('  node src/generate.js');
    return;
  }

  const proposals = JSON.parse(fs.readFileSync(PROPOSALS_FILE, 'utf8'));

  if (proposals.length === 0) {
    console.log('📝 还没有提案记录，无法分析\n');
    console.log('运行以下命令创建提案：');
    console.log('  node src/generate.js');
    return;
  }

  // 统计数据
  const total = proposals.length;
  const won = proposals.filter(p => p.status === 'won').length;
  const lost = proposals.filter(p => p.status === 'lost').length;
  const pending = proposals.filter(p => p.status === 'pending').length;
  const draft = proposals.filter(p => p.status === 'draft').length;

  const successRate = total > 0 ? ((won / (won + lost)) * 100).toFixed(1) : '0';

  // 按模板统计
  const templateStats = {};
  proposals.forEach(p => {
    if (!templateStats[p.template]) {
      templateStats[p.template] = { total: 0, won: 0, lost: 0 };
    }
    templateStats[p.template].total++;
    if (p.status === 'won') templateStats[p.template].won++;
    if (p.status === 'lost') templateStats[p.template].lost++;
  });

  // 最佳模板
  let bestTemplate = null;
  let bestRate = -1;
  Object.entries(templateStats).forEach(([template, stats]) => {
    const rate = stats.total > 0 ? (stats.won / (stats.won + stats.lost)) * 100 : 0;
    if (rate > bestRate && stats.total > 1) {
      bestRate = rate;
      bestTemplate = template;
    }
  });

  // 保存分析结果
  const analytics = {
    lastAnalyzed: new Date().toISOString(),
    total,
    won,
    lost,
    pending,
    draft,
    successRate: parseFloat(successRate),
    templateStats,
    bestTemplate,
    bestTemplateRate: bestRate
  };

  fs.writeFileSync(ANALYTICS_FILE, JSON.stringify(analytics, null, 2));

  // 输出结果
  console.log('\n📊 提案成功率分析\n');
  console.log('='.repeat(80));
  console.log(`总提案数: ${total}`);
  console.log(`✅ 赢单: ${won} (${((won/total)*100).toFixed(1)}%)`);
  console.log(`❌ 输单: ${lost} (${((lost/total)*100).toFixed(1)}%)`);
  console.log(`⏳ 待定: ${pending} (${((pending/total)*100).toFixed(1)}%)`);
  console.log(`📝 草稿: ${draft} (${((draft/total)*100).toFixed(1)}%)`);
  console.log('='.repeat(80));
  console.log(`\n🎯 总成功率: ${successRate}% (基于已确定结果的提案)\n`);

  if (bestTemplate) {
    console.log(`🏆 最佳模板: ${bestTemplate}`);
    console.log(`   成功率: ${bestRate.toFixed(1)}%\n`);
  }

  console.log('按模板统计:');
  console.log('-'.repeat(80));
  Object.entries(templateStats).forEach(([template, stats]) => {
    const rate = stats.total > 0 ? ((stats.won / (stats.won + stats.lost)) * 100).toFixed(1) : '0';
    console.log(`  ${template}:`);
    console.log(`    总数: ${stats.total} | 赢: ${stats.won} | 输: ${stats.lost} | 成功率: ${rate}%`);
  });
  console.log('-'.repeat(80));

  // 优化建议
  console.log('\n💡 优化建议:\n');

  if (successRate < 30) {
    console.log('  ⚠️  成功率较低，建议:');
    console.log('     - 重新审视提案模板内容');
    console.log('     - 调整报价策略');
    console.log('     - 分析输单原因');
  } else if (successRate < 50) {
    console.log('  📈 成功率中等，建议:');
    console.log('     - 分析赢单提案的共性');
    console.log('     - 优化项目理解和解决方案部分');
    console.log('     - 加强客户沟通');
  } else if (successRate >= 50) {
    console.log('  ✅ 成功率良好，建议:');
    console.log('     - 继续保持当前策略');
    console.log('     - 尝试提高报价');
    console.log('     - 分享成功经验到小红书');
  }

  if (pending > 5) {
    console.log('  ⏳ 有较多待定提案，建议:');
    console.log('     - 主动跟进客户');
    console.log('     - 了解客户反馈');
  }

  console.log('\n' + '='.repeat(80));
  console.log('💾 分析结果已保存到: data/analytics.json');
  console.log('='.repeat(80) + '\n');
}

if (require.main === module) {
  analyzeProposals();
}
