import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  // 获取base路径
  const base = import.meta.env.BASE_URL;

  // Get all unique categories
  const categories = ['All', ...new Set(icons.map(icon => icon.category))];

  // Filter icons
  const filteredIcons =
    activeCategory === 'All'
      ? icons
      : icons.filter(icon => icon.category === activeCategory);
  // 搜索过滤
  const searchedIcons = search.trim() === ''
    ? filteredIcons
    : filteredIcons.filter(icon =>
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        (icon.category && icon.category.toLowerCase().includes(search.toLowerCase()))
      );

  useEffect(() => {
    // Load icon data from public/icons/metadata.json
    fetch(`${base}icons/metadata.json`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load icon data');
        return res.json();
      })
      .then(data => {
        // Complete download count and image path
        const fullData = data.map((item, index) => ({
          ...item,
          id: item.id || index + 1,
          downloads: item.downloads || 0,
          imageUrl: `${base}icons/${item.filename}`,
        }));
        setIcons(fullData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [base]);

  if (loading)
    return (
      <div className="min-h-screen bg-scientific-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scientific-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading icon data, please wait...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-scientific-gray flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-scientific-dark mb-4">Categories</h2>
        <div className="overflow-x-auto">
          <div className="inline-flex space-x-3 pb-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`category-button ${
                  activeCategory === category ? 'active' : 'inactive'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="mb-8 flex justify-end">
        <input
          type="text"
          placeholder="搜索图标名称或类别..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-scientific-blue"
          style={{ minWidth: 220 }}
        />
      </div>

      {/* Icons Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {searchedIcons.map(icon => (
          <div
            key={icon.id}
            className="icon-card group"
          >
            <div className="p-4 bg-white">
              <img
                src={icon.imageUrl}
                alt={icon.name}
                className="w-full h-32 object-contain bg-white group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="p-4 bg-gray-50">
              <h3 className="font-semibold text-scientific-dark mb-1 truncate">{icon.name}</h3>
              <p className="text-sm text-gray-600 mb-2">Category: {icon.category}</p>
              <p className="text-sm text-gray-600 mb-4">Downloads: {icon.downloads.toLocaleString()}</p>
              <a
                href={icon.imageUrl}
                download
                className="download-button"
              >
                Download SVG
              </a>
            </div>
          </div>
        ))}
      </div>

      {searchedIcons.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">未找到符合条件的图标。</p>
          <p className="text-gray-500 text-sm mt-2">请尝试更换类别或修改搜索关键词。</p>
        </div>
      )}
    </main>
  );
}

function About() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-4 text-scientific-dark">关于本站</h2>
      <p className="mb-4 text-gray-700">ReseachBub 致力于为科研和教育提供高质量的科学图标资源，所有图标均可免费下载和使用。</p>
      <p className="mb-4 text-gray-700">本项目开源，遵循 MIT 许可协议，欢迎贡献和反馈。</p>
      <p className="mb-4 text-gray-700">图标资源仅供学术、教学和非商业用途，若需商业使用请联系作者。</p>
      <p className="mb-4 text-gray-700">GitHub仓库地址：<a href="https://github.com/iamKlufee/ReseachBub" className="text-scientific-blue underline" target="_blank" rel="noopener noreferrer">https://github.com/iamKlufee/ReseachBub</a></p>
    </main>
  );
}

export default function App() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-scientific-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-scientific-dark">ReseachBub</h1>
              <p className="text-gray-600 mt-1">Scientific Icon Resources for Research & Education</p>
            </div>
            <button
              className="px-4 py-2 bg-gray-100 text-scientific-dark rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
              onClick={() => navigate('/about')}
            >
              About
            </button>
          </div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              © 2025 ReseachBub. All rights reserved.
            </p>
            <p className="text-sm text-gray-500">
              High-quality scientific icons for research and educational purposes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 