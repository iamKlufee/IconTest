const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://reseachbub.org'; // 替换为你的实际域名
const metadata = require('./public/icons/metadata.json');

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n`;
sitemap += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

sitemap += `  <url><loc>${BASE_URL}/</loc></url>\n`;
sitemap += `  <url><loc>${BASE_URL}/about</loc></url>\n`;
sitemap += `  <url><loc>${BASE_URL}/softbub</loc></url>\n`;

metadata.forEach(icon => {
  sitemap += `  <url><loc>${BASE_URL}/icons/${icon.filename}</loc></url>\n`;
});

sitemap += `</urlset>\n`;

fs.writeFileSync(path.join(__dirname, 'public', 'sitemap.xml'), sitemap, 'utf8');
console.log('sitemap.xml generated!');