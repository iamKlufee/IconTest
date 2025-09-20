# 文献引用格式生成器

一个简单易用的在线工具，可以根据DOI（数字对象标识符）自动生成多种格式的学术引用。

## 功能特点

- 🔍 **DOI查询**: 支持输入完整的DOI链接或仅DOI号码
- 📚 **多种格式**: 支持APA、MLA、Chicago、Harvard、IEEE等主流引用格式
- 🎨 **现代界面**: 响应式设计，支持桌面和移动设备
- 📋 **一键复制**: 快速复制生成的引用格式
- 🌐 **纯前端**: 无需服务器，直接在浏览器中运行

## 使用方法

1. 打开 `index.html` 文件
2. 在输入框中输入DOI（例如：`10.1038/nature12373`）
3. 点击"获取引用"按钮
4. 查看生成的文献信息和多种引用格式
5. 选择需要的格式并点击"复制引用"

## 支持的DOI格式

- 完整URL: `https://doi.org/10.1038/nature12373`
- 简化URL: `doi.org/10.1038/nature12373`
- 纯DOI: `10.1038/nature12373`

## 支持的引用格式

- **APA**: 美国心理学会格式
- **MLA**: 现代语言学会格式
- **Chicago**: 芝加哥格式
- **Harvard**: 哈佛格式
- **IEEE**: 电气和电子工程师学会格式

## 技术实现

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **API**: Crossref API (免费，无需注册)
- **样式**: 现代CSS Grid和Flexbox布局
- **字体**: Inter字体，提供更好的可读性

## 文件结构

```
citation_tool/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── script.js           # JavaScript逻辑
└── README.md           # 说明文档
```

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 注意事项

- 需要网络连接以访问Crossref API
- 某些DOI可能无法找到对应的文献信息
- 生成的引用格式仅供参考，请根据具体要求进行调整

## 许可证

MIT License - 可自由使用和修改

