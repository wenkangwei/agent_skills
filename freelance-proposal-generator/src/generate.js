#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const CONFIG_DIR = path.join(__dirname, '..', 'config');
const TEMPLATES_DIR = path.join(CONFIG_DIR, 'templates');

// 确保目录存在
[DATA_DIR, CONFIG_DIR, TEMPLATES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// 默认提案模板
const defaultTemplates = {
  web_development: {
    name: 'Web开发提案',
    sections: [
      '项目理解',
      '解决方案',
      '技术栈',
      '时间规划',
      '报价',
      '为什么选择我'
    ],
    pricing_formula: 'base_hours * hourly_rate + (complexity * 500)'
  },
  mobile_development: {
    name: '移动应用开发提案',
    sections: [
      '项目背景',
      '核心功能',
      '开发流程',
      '报价明细',
      '服务保障'
    ],
    pricing_formula: 'base_hours * hourly_rate * 1.2'
  },
  content_writing: {
    name: '内容创作提案',
    sections: [
      '内容需求分析',
      '创作策略',
      '交付时间表',
      '报价',
      '质量承诺'
    ],
    pricing_formula: 'word_count * price_per_word'
  },
  general: {
    name: '通用提案',
    sections: [
      '项目需求理解',
      '解决方案概述',
      '执行计划',
      '项目预算',
      '我的优势'
    ],
    pricing_formula: 'base_hours * hourly_rate'
  }
};

// 初始化模板文件
function initTemplates() {
  const templatesFile = path.join(TEMPLATES_DIR, 'index.json');
  if (!fs.existsSync(templatesFile)) {
    fs.writeFileSync(templatesFile, JSON.stringify(defaultTemplates, null, 2));
    console.log('✅ 默认模板已初始化');
  }
  return JSON.parse(fs.readFileSync(templatesFile, 'utf8'));
}

// 初始化提案记录文件
function initProposals() {
  const proposalsFile = path.join(DATA_DIR, 'proposals.json');
  if (!fs.existsSync(proposalsFile)) {
    fs.writeFileSync(proposalsFile, JSON.stringify([], null, 2));
  }
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, 'utf8'));
  return proposals;
}

// 生成提案ID
function generateId() {
  return 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 计算报价
function calculatePrice(config) {
  const { hours, hourlyRate, complexity, wordCount, pricePerWord, formula } = config;

  switch (formula) {
    case 'base_hours * hourly_rate + (complexity * 500)':
      return hours * hourlyRate + (complexity * 500);
    case 'base_hours * hourly_rate * 1.2':
      return hours * hourlyRate * 1.2;
    case 'word_count * price_per_word':
      return wordCount * pricePerWord;
    case 'base_hours * hourly_rate':
    default:
      return hours * hourlyRate;
  }
}

// 生成提案内容
function generateProposal(template, projectInfo) {
  const sections = template.sections;
  const content = [];

  sections.forEach(section => {
    switch (section) {
      case '项目理解':
      case '项目需求分析':
      case '项目背景':
        content.push(`\n## ${section}\n\n${projectInfo.description || '请提供项目详细描述'}`);
        break;
      case '解决方案':
      case '解决方案概述':
      case '创作策略':
        content.push(`\n## ${section}\n\n基于您的需求，我将提供以下解决方案：\n- ${projectInfo.solution || '定制化解决方案'}\n- 专业执行流程\n- 持续沟通与优化`);
        break;
      case '技术栈':
        content.push(`\n## ${section}\n\n${projectInfo.techStack || '现代技术栈，根据项目需求定制'}`);
        break;
      case '时间规划':
      case '开发流程':
      case '交付时间表':
        content.push(`\n## ${section}\n\n预计工期：${projectInfo.timeline || '2-4周'}\n\n关键里程碑：\n1. 需求确认与方案设计\n2. 开发/执行阶段\n3. 测试与优化\n4. 最终交付与培训`);
        break;
      case '报价':
      case '报价明细':
      case '项目预算':
        const price = calculatePrice({
          hours: projectInfo.hours || 40,
          hourlyRate: projectInfo.hourlyRate || 100,
          complexity: projectInfo.complexity || 1,
          wordCount: projectInfo.wordCount || 0,
          pricePerWord: projectInfo.pricePerWord || 0.1,
          formula: template.pricing_formula
        });
        content.push(`\n## ${section}\n\n**总报价：¥${price.toFixed(2)}**\n\n包含：\n- 专业服务\n- 3次免费修改\n- 售后支持（1个月）`);
        break;
      case '为什么选择我':
      case '服务保障':
      case '我的优势':
      case '质量承诺':
        content.push(`\n## ${section}\n\n- 5年+专业经验\n- 高质量交付\n- 准时完成\n- 优质客户服务`);
        break;
      default:
        content.push(`\n## ${section}\n\n待补充内容`);
    }
  });

  return content.join('\n');
}

// 主函数
async function main() {
  console.log('📝 自由职业提案生成器\n');

  // 初始化
  const templates = initTemplates();
  const proposals = initProposals();

  // 交互式输入
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const ask = (question) => new Promise(resolve => rl.question(question, resolve));

  try {
    // 选择模板
    console.log('\n可用提案模板：');
    Object.entries(templates).forEach(([key, template]) => {
      console.log(`  ${key}. ${template.name}`);
    });
    const templateKey = await ask('\n选择模板类型 (general): ') || 'general';
    const template = templates[templateKey] || templates.general;

    // 收集项目信息
    console.log('\n请输入项目信息：');
    const projectInfo = {
      description: await ask('项目描述: '),
      solution: await ask('解决方案 (可选): '),
      hours: parseInt(await ask('预估工时 (40): ') || '40'),
      hourlyRate: parseInt(await ask('时薪 (100): ') || '100'),
      complexity: parseInt(await ask('复杂度 1-5 (1): ') || '1'),
      timeline: await ask('预期工期 (2-4周): ') || '2-4周',
      techStack: await ask('技术栈 (可选): ')
    };

    // 生成提案
    const proposalContent = generateProposal(template, projectInfo);
    const proposalId = generateId();

    const proposal = {
      id: proposalId,
      template: templateKey,
      projectInfo,
      content: proposalContent,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };

    proposals.push(proposal);
    fs.writeFileSync(path.join(DATA_DIR, 'proposals.json'), JSON.stringify(proposals, null, 2));

    // 输出提案
    console.log('\n' + '='.repeat(60));
    console.log(`📋 提案 ID: ${proposalId}`);
    console.log('='.repeat(60));
    console.log(proposalContent);
    console.log('\n' + '='.repeat(60));
    console.log('✅ 提案已保存到 data/proposals.json');
    console.log('='.repeat(60));

    rl.close();
  } catch (error) {
    console.error('❌ 错误:', error.message);
    rl.close();
    process.exit(1);
  }
}

// 如果直接运行此文件
if (require.main === module) {
  main();
}

module.exports = { generateProposal, calculatePrice, initTemplates, initProposals };
