const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://reseachbub.org'; // 确保使用HTTPS

// 获取当前日期
const currentDate = new Date().toISOString().split('T')[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

// 主要页面
const mainPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/iconbub', priority: '0.9', changefreq: 'weekly' },
  { url: '/toolbub', priority: '0.9', changefreq: 'weekly' },
  { url: '/softbub', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' },
  { url: '/license', priority: '0.3', changefreq: 'yearly' }
];

// 工具页面
const toolPages = [
  { url: '/citation-tool', priority: '0.7', changefreq: 'monthly' },
  { url: '/unit-converter', priority: '0.7', changefreq: 'monthly' },
  { url: '/file-compressor', priority: '0.7', changefreq: 'monthly' },
  { url: '/watermark-tool', priority: '0.7', changefreq: 'monthly' },
  { url: '/pdf-tool', priority: '0.7', changefreq: 'monthly' },
  { url: '/word-counter', priority: '0.7', changefreq: 'monthly' },
  { url: '/image-converter', priority: '0.7', changefreq: 'monthly' },
  { url: '/text-diff', priority: '0.7', changefreq: 'monthly' },
  { url: '/timer-tool', priority: '0.7', changefreq: 'monthly' }
];

// 添加主要页面
mainPages.forEach(page => {
  sitemap += `  <url>\n`;
  sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
  sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
  sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
  sitemap += `    <priority>${page.priority}</priority>\n`;
  sitemap += `  </url>\n`;
});

// 添加工具页面
toolPages.forEach(page => {
  sitemap += `  <url>\n`;
  sitemap += `    <loc>${BASE_URL}${page.url}</loc>\n`;
  sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
  sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
  sitemap += `    <priority>${page.priority}</priority>\n`;
  sitemap += `  </url>\n`;
});

// 添加博客文章
const blogPosts = [
  'Apply-fusion360',
  'Cell_culture_basic_medium', 
  'HowToFindPI',
  'Reference_Management_Software_Improved',
  'Zotero_webdev_tutorial'
];

blogPosts.forEach(post => {
  sitemap += `  <url>\n`;
  sitemap += `    <loc>${BASE_URL}/blog/${post}</loc>\n`;
  sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
  sitemap += `    <changefreq>monthly</changefreq>\n`;
  sitemap += `    <priority>0.6</priority>\n`;
  sitemap += `  </url>\n`;
});

// 添加图标页面（如果metadata.json存在）
try {
  const metadata = require('./public/icons/metadata.json');
  metadata.forEach(icon => {
    sitemap += `  <url>\n`;
    sitemap += `    <loc>${BASE_URL}/icons/${icon.filename}</loc>\n`;
    sitemap += `    <lastmod>${currentDate}</lastmod>\n`;
    sitemap += `    <changefreq>monthly</changefreq>\n`;
    sitemap += `    <priority>0.5</priority>\n`;
    sitemap += `  </url>\n`;
  });
} catch (error) {
  console.log('No metadata.json found, skipping icon pages');
}

sitemap += `</urlset>\n`;

// 写入sitemap文件
fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), sitemap, 'utf8');
console.log('sitemap.xml generated successfully!');
console.log(`Total URLs: ${mainPages.length + toolPages.length + blogPosts.length} main pages + icon pages`);