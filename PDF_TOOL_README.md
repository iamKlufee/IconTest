# PDF工具 - 基于PDF.js和pdf-lib的PDF处理工具

## 功能概述

PDF工具是一个结合PDF.js和pdf-lib技术的强大PDF处理工具，完全在浏览器中运行，为用户提供安全、快速的PDF处理功能。

## 技术选型说明

### 为什么选择PDF.js + pdf-lib组合？

**MuPDF.js的问题：**
1. **浏览器兼容性问题**：MuPDF.js依赖Node.js模块（如`fs`），这些在浏览器中不可用
2. **WebAssembly加载问题**：Top-level await在Vite配置的目标环境中不可用
3. **构建配置复杂**：需要特殊的构建配置来支持WebAssembly模块

**PDF.js + pdf-lib的优势：**
1. **浏览器原生支持**：两个库都是专为浏览器环境设计
2. **成熟稳定**：PDF.js由Mozilla维护，pdf-lib经过大量项目验证
3. **功能互补**：PDF.js擅长读取和渲染，pdf-lib擅长创建和修改
4. **构建简单**：无需特殊配置，开箱即用

## 主要功能

### 1. PDF压缩 📄
- **功能描述**: 通过移除不必要的元数据和优化PDF结构来减小文件大小
- **技术特点**: 
  - 移除文档元数据（标题、作者、主题等）
  - 优化PDF内部结构
  - 保持文档内容完整性
- **适用场景**: 减小PDF文件大小，便于存储和传输

### 2. PDF分割 ✂️
- **功能描述**: 在指定页数处将PDF分割成多个部分
- **技术特点**:
  - 支持自定义分割点
  - 精确页数控制
  - 保持原文档格式
- **使用方法**: 输入分割页数，用逗号分隔（如：5,10,15）
- **适用场景**: 提取特定页面，分割长文档

### 3. PDF合并 🔗
- **功能描述**: 将多个PDF文件按顺序合并成一个文档
- **技术特点**:
  - 按文件选择顺序合并
  - 保持所有页面格式
  - 自动处理页面编号
- **适用场景**: 合并相关文档，创建完整报告

## 技术架构

### WebAssembly支持
- 使用`pdf-lib`库，基于WebAssembly技术
- 完全在浏览器客户端运行
- 无需服务器端处理
- 支持Cloudflare Pages部署

### 隐私保护
- 所有处理都在本地完成
- 文件不会上传到任何服务器
- 确保敏感文档的安全性
- 符合数据保护法规

### 浏览器兼容性
- 支持所有现代浏览器
- 自动检测WebAssembly支持
- 优雅降级处理

## 使用方法

### 1. 访问工具
- 访问 `/pdf-tool` 页面
- 或通过工具菜单进入

### 2. 选择功能
- 点击对应的标签页（压缩/分割/合并）
- 根据需求设置参数

### 3. 上传文件
- 拖拽PDF文件到上传区域
- 或点击选择文件按钮
- 支持多文件选择（合并功能）

### 4. 处理文件
- 点击相应的处理按钮
- 等待处理完成
- 下载处理后的文件

## 技术实现细节

### 依赖库
```json
{
  "pdfjs-dist": "^4.0.379",
  "pdf-lib": "^1.17.1"
}
```

### 核心功能实现

#### PDF信息读取（PDF.js）
```javascript
// 使用PDF.js读取PDF信息
const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
const info = {
  pageCount: pdf.numPages,
  title: pdf.info?.Title || 'Unknown',
  author: pdf.info?.Author || 'Unknown'
};
```

#### 压缩功能（pdf-lib）
```javascript
// 移除元数据并优化结构
pdfDoc.setTitle('');
pdfDoc.setAuthor('');
pdfDoc.setSubject('');
// 保存时启用压缩选项
const pdfBytes = await pdfDoc.save({
  useObjectStreams: true,
  addDefaultPage: false,
  objectsPerTick: 50
});
```

#### 分割功能
```javascript
// 按页数分割
const [copiedPages] = await splitDoc.copyPages(pdfDoc, 
  Array.from({length: endPage - startPage}, (_, idx) => startPage + idx)
);
copiedPages.forEach(page => splitDoc.addPage(page));
```

#### 合并功能
```javascript
// 复制所有页面到新文档
const [copiedPages] = await mergedPdf.copyPages(pdfDoc, 
  pdfDoc.getPageIndices()
);
copiedPages.forEach(page => mergedPdf.addPage(page));
```

## 性能特点

### 处理速度
- WebAssembly提供接近原生的处理速度
- 支持大文件处理
- 内存使用优化

### 文件大小限制
- 受浏览器内存限制
- 建议单个文件不超过100MB
- 支持批量处理

### 错误处理
- 完善的错误捕获机制
- 用户友好的错误提示
- 处理失败时的恢复选项

## 部署说明

### Cloudflare Pages兼容性
- 完全静态文件部署
- 无需服务器端配置
- 支持全球CDN加速
- 自动HTTPS支持

### 构建配置
```javascript
// vite.config.js
export default {
  build: {
    target: 'es2020', // 支持WebAssembly
    rollupOptions: {
      output: {
        manualChunks: {
          'pdf-lib': ['pdf-lib']
        }
      }
    }
  }
}
```

## 未来扩展计划

### 计划功能
- [ ] PDF转图片
- [ ] 图片转PDF
- [ ] PDF密码保护
- [ ] PDF表单处理
- [ ] OCR文字识别
- [ ] 批量处理优化

### 性能优化
- [ ] 代码分割优化
- [ ] 懒加载实现
- [ ] 缓存策略优化
- [ ] 多线程处理

## 故障排除

### 常见问题

1. **文件无法上传**
   - 检查文件格式是否为PDF
   - 确认文件大小未超过限制
   - 检查浏览器兼容性

2. **处理失败**
   - 确认PDF文件未损坏
   - 检查浏览器内存使用情况
   - 尝试刷新页面重新处理

3. **下载失败**
   - 检查浏览器下载设置
   - 确认有足够的磁盘空间
   - 尝试使用其他浏览器

### 技术支持
- 检查浏览器控制台错误信息
- 确认WebAssembly支持
- 联系技术支持团队

## 版本历史

### v1.0.0 (2024-01-XX)
- 初始版本发布
- 支持PDF压缩、分割、合并功能
- 基于PDF.js和pdf-lib技术实现
- 完整的用户界面和错误处理
- 自动显示PDF页数信息
- 优化的用户体验和性能

---

**注意**: 此工具完全在客户端运行，确保您的文档隐私安全。所有处理过程都不会离开您的设备。
