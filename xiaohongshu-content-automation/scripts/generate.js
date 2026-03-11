#!/usr/bin/env node

/**
 * Xiaohongshu Content Generator
 * AI-powered content generation for maximum engagement
 */

const fs = require('fs');
const path = require('path');

// Data paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const CONTENT_FILE = path.join(DATA_DIR, 'content.json');
const HASHTAGS_FILE = path.join(DATA_DIR, 'hashtags.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load hashtags database
function loadHashtags() {
  if (!fs.existsSync(HASHTAGS_FILE)) {
    // Default hashtag database
    const defaultHashtags = {
      popular: ['#热门', '#推荐', '#干货', '#必备', '#好物'],
      lifestyle: ['#生活方式', '#日常', '#生活', '#分享', '#记录'],
      tech: ['#科技', '#AI', '#编程', '#工具', '#效率'],
      fashion: ['#穿搭', '#时尚', '#搭配', '#种草', '#好物'],
      food: ['#美食', '#探店', '#食谱', '#美食分享', '#吃货'],
      travel: ['#旅行', '#旅游', '#打卡', '#攻略', '#风景'],
      career: ['#职场', '#工作', '#成长', '#经验', '#干货'],
      study: ['#学习', '#笔记', '#知识', '#教育', '#自学']
    };
    fs.writeFileSync(HASHTAGS_FILE, JSON.stringify(defaultHashtags, null, 2));
    return defaultHashtags;
  }
  return JSON.parse(fs.readFileSync(HASHTAGS_FILE, 'utf8'));
}

// Load content database
function loadContent() {
  if (!fs.existsSync(CONTENT_FILE)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
}

// Generate content ID
function generateContentId(content) {
  const count = content.length;
  return `CNT${String(count + 1).padStart(3, '0')}`;
}

// Select relevant hashtags
function selectHashtags(topic, hashtags, count = 8) {
  const topicLower = topic.toLowerCase();
  let selectedHashtags = [];

  // Popular hashtags (always include a few)
  const popular = hashtags.popular || [];
  selectedHashtags.push(...popular.slice(0, 2));

  // Category-specific hashtags
  const categoryMap = {
    'ai': 'tech',
    '工具': 'tech',
    '科技': 'tech',
    '职场': 'career',
    '工作': 'career',
    '穿搭': 'fashion',
    '时尚': 'fashion',
    '美食': 'food',
    '旅行': 'travel',
    '学习': 'study',
    '生活': 'lifestyle'
  };

  for (const [keyword, category] of Object.entries(categoryMap)) {
    if (topicLower.includes(keyword)) {
      const categoryTags = hashtags[category] || [];
      selectedHashtags.push(...categoryTags.slice(0, 3));
      break;
    }
  }

  // Fill with remaining popular hashtags
  while (selectedHashtags.length < count) {
    const allTags = Object.values(hashtags).flat();
    const randomTag = allTags[Math.floor(Math.random() * allTags.length)];
    if (!selectedHashtags.includes(randomTag)) {
      selectedHashtags.push(randomTag);
    }
  }

  return selectedHashtags.slice(0, count);
}

// Generate content templates
function generateContent(topic, style = 'casual') {
  const templates = {
    casual: [
      `✨ ${topic}超实用！\n\n真心推荐给姐妹们\n一定要试试看\n\n干货满满\n记得收藏哦~\n\n#${topic}`,
      `🔥 ${topic}来了！\n\n今天分享一个超级有用的东西\n绝对值得拥有\n\n大家快冲！\n\n#分享 #推荐`
    ],
    informative: [
      `📖 ${topic}完全指南\n\n今天给大家详细讲讲\n\n1️⃣ 核心要点\n2️⃣ 实用技巧\n3️⃣ 注意事项\n\n建议收藏备用\n\n#干货 #知识`,
      `💡 ${topic}深度解析\n\n从专业角度分析\n帮你快速理解\n\n建议反复观看\n\n#学习 #成长`
    ],
    professional: [
      `📊 ${topic}专业报告\n\n基于最新数据\n提供专业见解\n\n适合从业者参考\n\n#专业 #行业`,
      `🎯 ${topic}最佳实践\n\n总结了多年经验\n帮你少走弯路\n\n值得认真阅读\n\n#经验 #干货`
    ]
  };

  const styleTemplates = templates[style] || templates.casual;
  return styleTemplates[Math.floor(Math.random() * styleTemplates.length)];
}

// Generate hashtags based on topic
function generateTopicHashtags(topic) {
  const topicLower = topic.toLowerCase();
  const hashtags = [];

  // Add topic as hashtag
  if (!hashtags.includes(`#${topic}`)) {
    hashtags.push(`#${topic}`);
  }

  // Add related keywords
  const relatedKeywords = {
    'ai': ['#人工智能', '#机器学习'],
    '工具': ['#效率', '#助手'],
    '职场': ['#成长', '#经验'],
    '穿搭': ['#时尚', '#搭配'],
    '美食': ['#菜谱', '#做饭'],
    '健身': ['#运动', '#健康']
  };

  for (const [keyword, related] of Object.entries(relatedKeywords)) {
    if (topicLower.includes(keyword)) {
      hashtags.push(...related.slice(0, 2));
      break;
    }
  }

  return hashtags;
}

// Main generation function
function generatePost(args) {
  const topic = args.topic || args[0];
  const style = args.style || 'casual';
  const variants = parseInt(args.variants || 1);

  if (!topic) {
    console.error('❌ Error: Topic is required');
    console.error('Usage: node generate.js --topic "your topic"');
    process.exit(1);
  }

  console.log('🚀 Generating Xiaohongshu Content');
  console.log('═════════════════════════════════\n');

  const hashtags = loadHashtags();
  const content = loadContent();

  console.log(`📝 Topic: ${topic}`);
  console.log(`🎨 Style: ${style}`);
  console.log(`🔄 Variants: ${variants}\n`);

  for (let i = 1; i <= variants; i++) {
    console.log(`📄 Variant ${i}:`);
    console.log('─────────────────────────────────');

    // Generate content
    const textContent = generateContent(topic, style);

    // Select optimized hashtags
    const selectedHashtags = selectHashtags(topic, hashtags, 8);

    // Add topic-specific hashtags
    const topicHashtags = generateTopicHashtags(topic);
    const finalHashtags = [...new Set([...selectedHashtags, ...topicHashtags])].slice(0, 10);

    const finalContent = `${textContent}\n\n${finalHashtags.join(' ')}`;

    // Generate content object
    const contentId = generateContentId(content);
    const contentObj = {
      id: contentId,
      topic,
      style,
      content: finalContent,
      hashtags: finalHashtags,
      createdAt: new Date().toISOString(),
      scheduledAt: null,
      postedAt: null,
      metrics: {
        views: 0,
        likes: 0,
        comments: 0,
        saves: 0,
        shares: 0
      }
    };

    // Save content
    content.push(contentObj);
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2));

    // Display content
    console.log(finalContent);
    console.log(`\n✅ Content ID: ${contentId}`);
    console.log(`📁 Saved to: ${CONTENT_FILE}\n`);
  }

  console.log('═════════════════════════════════');
  console.log('✅ All content generated successfully!');
  console.log(`💡 Next steps:`);
  console.log(`   - Schedule: node scripts/schedule.js --content-id <ID>`);
  console.log(`   - View all: node scripts/list.js`);
}

// Parse command line arguments
function parseArgs() {
  const args = {};
  process.argv.slice(2).forEach(arg => {
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      args[key] = value || true;
    } else {
      args._ = args._ || [];
      args._.push(arg);
    }
  });
  return args;
}

// Run
if (require.main === module) {
  const args = parseArgs();
  generatePost(args);
}

module.exports = { generatePost };
