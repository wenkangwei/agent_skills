#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const PROPOSALS_FILE = path.join(DATA_DIR, 'proposals.json');

function listProposals() {
  if (!fs.existsSync(PROPOSALS_FILE)) {
    console.log('📝 还没有提案记录\n');
    console.log('运行以下命令创建第一个提案：');
    console.log('  node src/generate.js');
    return;
  }

  const proposals = JSON.parse(fs.readFileSync(PROPOSALS_FILE, 'utf8'));

  if (proposals.length === 0) {
    console.log('📝 还没有提案记录\n');
    console.log('运行以下命令创建第一个提案：');
    console.log('  node src/generate.js');
    return;
  }

  console.log('\n📋 提案列表 (' + proposals.length + ' 条)\n');
  console.log('='.repeat(80));

  proposals.forEach((proposal, index) => {
    const date = new Date(proposal.createdAt).toLocaleDateString('zh-CN');
    const statusIcon = proposal.status === 'won' ? '✅' :
                       proposal.status === 'lost' ? '❌' :
                       proposal.status === 'pending' ? '⏳' : '📝';

    console.log(`${statusIcon} ${index + 1}. ${proposal.id}`);
    console.log(`   模板: ${proposal.template}`);
    console.log(`   创建: ${date}`);
    console.log(`   状态: ${proposal.status}`);

    if (proposal.projectInfo.description) {
      console.log(`   描述: ${proposal.projectInfo.description.substring(0, 50)}...`);
    }

    console.log();
  });

  console.log('='.repeat(80));
  console.log('\n💡 使用 "node src/generate.js" 创建新提案');
  console.log('💡 使用 "node src/analyze.js" 分析成功率\n');
}

if (require.main === module) {
  listProposals();
}
