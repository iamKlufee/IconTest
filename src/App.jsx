import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { loadAllBlogPosts, loadBlogPost } from './utils/markdownParser.jsx';
import SEOHead from './components/SEOHead';
import WatermarkTool from './components/WatermarkTool';
import PDFTool from './components/PDFTool';
import WordCounter from './components/WordCounter';
import ImageConverter from './components/ImageConverter';
import TextDiff from './components/TextDiff';
import TimerTool from './components/TimerTool';

// 滚动到顶部的组件
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function IconBub() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const pageSize = 24;

  // Get base path
  const base = import.meta.env.BASE_URL;

  // Get all unique categories
  const categories = ['All', ...new Set(icons.map(icon => icon.category))];

  // Filter icons
  const filteredIcons =
    activeCategory === 'All'
      ? icons
      : icons.filter(icon => icon.category === activeCategory);
  
  // Search filter
  const searchedIcons = search.trim() === ''
    ? filteredIcons
    : filteredIcons.filter(icon =>
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        (icon.category && icon.category.toLowerCase().includes(search.toLowerCase()))
      );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(searchedIcons.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedIcons = searchedIcons.slice(startIndex, startIndex + pageSize);

  // Adjust current page if filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, search]);

  // Optimized download function
  const handleDownload = async (icon) => {
    try {
      const response = await fetch(icon.imageUrl);
      if (!response.ok) throw new Error('Failed to fetch SVG');
      const svgContent = await response.text();
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = icon.filename || `${icon.name}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      const link = document.createElement('a');
      link.href = icon.imageUrl;
      link.download = icon.filename || `${icon.name}.svg`;
      link.click();
    }
  };

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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading icon data, please wait...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error: {error}</p>
        </div>
      </div>
    );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
          Scientific Icon Library
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl">
          Discover {icons.length}+ high-quality SVG icons for laboratory equipment, research tools, 
          and scientific illustrations. Perfect for presentations, papers, and educational materials.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Categories</h2>
              <div className="space-y-1">
                {categories.map(category => {
                  const categoryCount = category === 'All' ? icons.length : icons.filter(icon => icon.category === category).length;
                  return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        activeCategory === category 
                          ? 'bg-primary-100 text-primary-700' 
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category}</span>
                        <span className="text-xs text-neutral-500">({categoryCount})</span>
                      </div>
              </button>
                  );
                })}
              </div>
          </div>
        </div>
      </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          {/* Search and View Controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
      {/* Search Box */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
        <input
          type="text"
                placeholder="Search icons by name or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
                className="search-input pl-10"
        />
      </div>

            {/* View Mode Toggle and Results Count */}
            <div className="flex items-center gap-4">
              <div className="flex items-center text-sm text-neutral-600">
                <span>{searchedIcons.length} icons found</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-neutral-600">View:</span>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Icons Grid/List */}
          {loading ? (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6' : 'space-y-4'}`}>
              {Array.from({ length: pageSize }).map((_, index) => (
                <div key={index} className="card p-6">
                  <div className="loading-skeleton h-20 mb-4"></div>
                  <div className="loading-skeleton h-4 w-3/4 mb-2"></div>
                  <div className="loading-skeleton h-3 w-1/2"></div>
                </div>
              ))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
        {paginatedIcons.map(icon => (
                <div key={icon.id} className="icon-card group">
                  <div className="p-6">
                    <div className="flex items-center justify-center h-24 mb-4 bg-neutral-50 rounded-xl group-hover:bg-primary-50 transition-colors duration-200">
                      <img
                        src={icon.imageUrl}
                        alt={icon.name}
                        className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-center">
                      {icon.name}
                    </h3>
                    <p className="text-xs text-neutral-600 mb-1 line-clamp-1 text-center">{icon.category}</p>
                    <p className="text-xs text-neutral-500 mb-4 text-center">
                      {icon.downloads.toLocaleString()} downloads
                    </p>
                    <button
                      onClick={() => handleDownload(icon)}
                      className="download-button"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedIcons.map(icon => (
                <div key={icon.id} className="card p-6">
                  <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0 w-16 h-16 bg-neutral-50 rounded-xl flex items-center justify-center">
              <img
                src={icon.imageUrl}
                alt={icon.name}
                        className="max-w-full max-h-full object-contain"
              />
            </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-neutral-900 mb-1">
                        {icon.name}
                      </h3>
                      <p className="text-xs text-neutral-600 mb-2">{icon.category}</p>
                      <p className="text-xs text-neutral-500">
                        {icon.downloads.toLocaleString()} downloads
                      </p>
                    </div>
                    <div className="flex-shrink-0">
              <button
                onClick={() => handleDownload(icon)}
                        className="btn-primary"
              >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download
              </button>
                    </div>
            </div>
          </div>
        ))}
      </div>
          )}

          {/* No Results */}
          {!loading && searchedIcons.length === 0 && (
            <div className="text-center py-20">
              <div className="text-neutral-300 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No icons found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search terms or selecting a different category.</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="btn-outline"
              >
                Clear Filters
              </button>
        </div>
      )}

          {/* Pagination */}
          {!loading && searchedIcons.length > 0 && (
            <div className="flex items-center justify-center gap-4 mt-12">
          <button
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
          </button>
              
              <div className="flex items-center space-x-2">
                {(() => {
                  const maxVisible = 7;
                  const halfVisible = Math.floor(maxVisible / 2);
                  let startPage = Math.max(1, currentPage - halfVisible);
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  
                  const pages = [];
                  
                  // 添加第一页和省略号
                  if (startPage > 1) {
                    pages.push(
          <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className="px-3 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <span key="ellipsis1" className="px-2 text-neutral-400">...</span>
                      );
                    }
                  }
                  
                  // 添加可见页面
                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === i
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }
                  
                  // 添加省略号和最后一页
                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <span key="ellipsis2" className="px-2 text-neutral-400">...</span>
                      );
                    }
                    pages.push(
                      <button
                        key={totalPages}
                        onClick={() => setCurrentPage(totalPages)}
                        className="px-3 py-2 text-sm font-medium rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      >
                        {totalPages}
                      </button>
                    );
                  }
                  
                  return pages;
                })()}
              </div>
              
              <button
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* No Results */}
      {!loading && searchedIcons.length === 0 && (
        <div className="text-center py-20">
          <div className="text-neutral-300 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No icons found</h3>
          <p className="text-neutral-600 mb-6">Try adjusting your search terms or selecting a different category.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All'); }}
            className="btn-outline"
          >
            Clear Filters
          </button>
        </div>
      )}
    </main>
  );
}

function Home() {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const base = import.meta.env.BASE_URL;

  useEffect(() => {
    fetch(`${base}icons/metadata.json`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const fullData = data.map((item, index) => ({
          ...item,
          id: item.id || index + 1,
          imageUrl: `${base}icons/${item.filename}`,
        }));
        setIcons(fullData);
        setLoading(false);
      })
      .catch(() => {
        setIcons([]);
        setLoading(false);
      });
  }, [base]);

  const featuredIcons = icons.slice(0, 12);

  const recommendedSoftware = [
    { name: 'ImageJ', desc: 'Open-source image analysis', link: '/softbub', icon: '🔬', category: 'Image Analysis' },
    { name: 'R', desc: 'Statistical computing', link: '/softbub', icon: '📊', category: 'Statistics' },
    { name: 'Python', desc: 'Scientific computing', link: '/softbub', icon: '🐍', category: 'Programming' },
    { name: 'Zotero', desc: 'Reference management', link: '/softbub', icon: '📚', category: 'Research Tools' },
    { name: 'Blender', desc: '3D visualization', link: '/softbub', icon: '🎭', category: 'Visualization' },
    { name: 'Inkscape', desc: 'Vector graphics', link: '/softbub', icon: '✏️', category: 'Design' },
  ];

  const stats = [
    { label: 'Scientific Icons', value: '268+', icon: '🎯' },
    { label: 'Software Tools', value: '46+', icon: '💻' },
    { label: 'Research Articles', value: '4+', icon: '📝' },
    { label: 'Active Users', value: '1K+', icon: '👥' },
  ];

  return (
    <>
      <SEOHead 
        title="ReseachBub - Scientific Research Platform | Free Icons, Tools & Resources"
        description="Empowering scientists, researchers, and academics worldwide with 200+ free scientific icons, comprehensive research tools, citation generators, unit converters, and educational resources to streamline research workflows and accelerate discovery."
        keywords="scientific icons, research tools, citation generator, unit converter, scientific visualization, biotechnology, laboratory equipment, academic resources, open source science, research platform, scientific figures, publication tools, academic software, scientific presentation, research workflow, laboratory software, scientific computing, data visualization, research methodology, scientific communication, academic tools, research productivity, scientific resources, laboratory management, research collaboration, scientific education, academic research, laboratory automation, scientific analysis, research innovation, scientific discovery, academic excellence, research efficiency, scientific methodology, laboratory techniques, research development, scientific progress, academic advancement, research optimization, scientific excellence"
        url="https://reseachbub.org/"
        type="website"
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
      <section className="text-center py-20 lg:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-800 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-primary-500 rounded-full mr-2 animate-pulse"></span>
            Scientific Resources Hub
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-neutral-900 mb-6 leading-tight">
            Accelerate Your
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Scientific Research</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-neutral-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Empowering scientists, researchers, and academics worldwide with 200+ free scientific icons, comprehensive research tools, citation generators, unit converters, and educational resources to streamline research workflows and accelerate discovery 
            to streamline your academic workflow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/iconbub" className="btn-primary px-8 py-4 text-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Explore Icons
            </Link>
            <Link to="/softbub" className="btn-outline px-8 py-4 text-lg">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Browse Software
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 lg:py-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                {stat.icon}
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-2">
                {stat.value}
              </div>
              <div className="text-neutral-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Icons */}
      <section className="py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Featured Scientific Icons
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              High-quality SVG icons for laboratory equipment, research tools, and scientific illustrations.
            </p>
        </div>
          <Link to="/iconbub" className="btn-outline mt-6 lg:mt-0">
            View All Icons
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="card p-6">
                <div className="loading-skeleton h-20 mb-4"></div>
                <div className="loading-skeleton h-4 w-3/4"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {featuredIcons.map(icon => (
              <div key={icon.id} className="card p-6 group cursor-pointer">
                <div className="flex items-center justify-center h-20 mb-4 bg-neutral-50 rounded-xl group-hover:bg-primary-50 transition-colors duration-200">
                  <img 
                    src={icon.imageUrl} 
                    alt={icon.name} 
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200" 
                  />
                </div>
                <h3 className="text-sm font-medium text-neutral-900 text-center line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {icon.name}
                </h3>
                <div className="text-xs text-neutral-500 text-center mt-1">
                  {icon.category}
                </div>
            </div>
          ))}
        </div>
        )}
      </section>

      {/* Recommended Software */}
      <section className="py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4">
              Essential Research Tools
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl">
              Curated collection of powerful software tools for data analysis, visualization, and research management.
            </p>
        </div>
          <Link to="/softbub" className="btn-outline mt-6 lg:mt-0">
            View All Software
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedSoftware.map((software, index) => (
            <Link key={software.name} to={software.link} className="card p-6 group">
              <div className="flex items-start space-x-4">
                <div className="text-3xl group-hover:scale-110 transition-transform duration-200">
                  {software.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                      {software.name}
                    </h3>
                    <span className="tag-secondary text-xs">
                      {software.category}
                    </span>
                  </div>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {software.desc}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="rounded-3xl p-8 lg:p-16 text-center" style={{background: 'linear-gradient(135deg, #6ba0c4 0%, #5680a0 100%)'}}>
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-white">
            Ready to Enhance Your Research?
          </h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of researchers who trust ReseachBub for their scientific resources and tools.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/blog" className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-neutral-100 transition-colors">
              Read Our Blog
            </Link>
            <Link to="/about" className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}

function About() {
  return (
    <>
      <SEOHead 
        title="About ReseachBub - Scientific Research Platform | Dr. GlauNee"
        description="Learn about ReseachBub, a comprehensive scientific research platform founded by Dr. GlauNee, a biotechnology postdoctoral researcher with 20+ years of laboratory experience. Discover our mission to accelerate scientific discovery through free tools and resources."
        keywords="about reseachbub, dr glaunee, biotechnology researcher, scientific research platform, open science, research tools, scientific visualization, laboratory experience, postdoctoral researcher, scientific community, research collaboration, academic resources, scientific discovery, research innovation"
        url="https://reseachbub.org/about"
        type="website"
      />
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* SEO优化：添加结构化数据 */}
        <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          "name": "GlauNee",
          "jobTitle": "Biotechnology Postdoctoral Researcher",
          "description": "Creator of ReseachBub - A comprehensive platform for scientific research tools, icons, and resources",
          "url": "https://reseachbub.com/about",
          "image": "https://reseachbub.com/images/glauNee-avatar.png",
          "sameAs": [],
          "worksFor": {
            "@type": "Organization",
            "name": "ReseachBub"
          }
        })}
      </script>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* 头像区域 */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 text-center">
              <div className="w-48 h-48 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg">
                <img 
                  src="/images/glauNee-avatar.png" 
                  alt="GlauNee - Biotechnology Postdoctoral Researcher and Creator of ReseachBub Scientific Research Platform" 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>
              <h3 className="text-xl font-bold text-scientific-dark mb-2">Dr. GlauNee</h3>
              <p className="text-gray-600 mb-4">Founder & Lead Researcher</p>
              <p className="text-sm text-gray-500 mb-4">
                Biotechnology Postdoctoral Researcher<br />
                20+ years laboratory experience<br />
                Open Science Advocate
              </p>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Scientific Visualization</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span>Research Tools</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Open Source</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="lg:col-span-2">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4 text-scientific-dark">About ReseachBub: Advancing Scientific Research Through Technology</h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              A comprehensive research platform dedicated to empowering scientists, researchers, and academics with essential tools and resources for modern scientific work.
            </p>
          </header>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-scientific-dark">Our Mission</h2>
            <p className="mb-4 text-gray-700 leading-relaxed">
              ReseachBub was founded by Dr. GlauNee, a biotechnology postdoctoral researcher with over two decades of hands-on laboratory experience. Having witnessed firsthand the challenges researchers face in creating compelling scientific visualizations and managing research workflows, we recognized the need for a centralized platform that streamlines these processes.
            </p>
            <p className="mb-4 text-gray-700 leading-relaxed">
              Our mission is to accelerate scientific discovery by providing researchers with high-quality, open-source scientific icons, comprehensive research tools, and curated resources that reduce time spent on administrative tasks and increase time focused on breakthrough research.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-scientific-dark">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                  Scientific Icon Library
                </h3>
                <p className="text-blue-700 text-sm">
                  Over 200+ high-quality, open-source scientific icons covering biology, chemistry, physics, and engineering disciplines. All icons are optimized for presentations, publications, and educational materials.
                </p>
              </div>
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Research Tools
                </h3>
                <p className="text-green-700 text-sm">
                  Comprehensive collection of citation generators, unit converters, file compression tools, and software recommendations specifically curated for scientific research workflows.
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Educational Resources
                </h3>
                <p className="text-purple-700 text-sm">
                  Expert-written blog posts, tutorials, and guides covering scientific visualization techniques, research methodologies, and best practices for academic presentations.
                </p>
              </div>
              <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                  </svg>
                  Open Science
                </h3>
                <p className="text-orange-700 text-sm">
                  Committed to open science principles, providing free access to research tools and resources that promote collaboration and accelerate scientific progress.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-scientific-dark">Our Impact</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-2">200+</div>
                <div className="text-sm text-gray-600">Scientific Icons</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-2">10K+</div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
                <div className="text-sm text-gray-600">Research Tools</div>
              </div>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Since our launch, ReseachBub has become a trusted resource for researchers worldwide, supporting scientists in universities, research institutions, and industry laboratories. Our platform has facilitated thousands of research projects, helping researchers create more impactful presentations and streamline their workflows.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-scientific-dark">Our Values</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Accessibility</h3>
                  <p className="text-gray-700 text-sm">We believe high-quality research tools should be accessible to all researchers, regardless of budget constraints or institutional resources.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Quality</h3>
                  <p className="text-gray-700 text-sm">Every resource on our platform is carefully curated and tested to ensure it meets the high standards required for professional scientific work.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Collaboration</h3>
                  <p className="text-gray-700 text-sm">We foster a collaborative environment where researchers can share knowledge, tools, and best practices to advance scientific discovery together.</p>
                </div>
              </div>
            </div>
          </section>
          
          <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">About Our Name</h3>
            <p className="text-blue-700">
              You might have noticed the distinctive spelling of our domain name. Originally intended to be "ResearchBub," a typo during registration led to "ReseachBub." Rather than seeing this as a mistake, we embraced it as a unique identity that reflects our innovative and unconventional approach to supporting scientific research. This quirky name has become a memorable part of our brand, representing our commitment to thinking outside the box in service of the scientific community.
            </p>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-2xl font-bold mb-4 text-scientific-dark">Legal Information</h3>
            <p className="mb-4 text-gray-700">
              For detailed information about licensing, terms of service, and privacy policies, please visit our <Link to="/license" className="text-scientific-primary hover:text-scientific-dark underline">License page</Link> and <Link to="/terms-of-service" className="text-scientific-primary hover:text-scientific-dark underline">Terms of Service</Link>.
            </p>
          </div>
        </div>
      </div>
    </main>
    </>
  );
}

function PrivacyPolicy() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Privacy Policy</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          We are committed to protecting your privacy and ensuring transparency in how we handle your information.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <p className="text-sm text-neutral-500 mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Introduction</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            Welcome to ReseachBub. This Privacy Policy explains how we handle information when you visit our website. 
            We are committed to transparency and privacy protection. Please read this policy carefully.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">What We Collect</h2>
          <p className="text-neutral-700 mb-4">
            Our website currently has <strong>no user registration, contact forms, or data collection forms</strong>. 
            We do not collect any personal information that you actively provide to us.
          </p>
          
          <p className="text-neutral-700 mb-4">
            However, certain information is automatically collected by third-party services we use:
          </p>

          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Google AdSense</h3>
          <p className="text-neutral-700 mb-4">
            We use Google AdSense to display advertisements. Google may collect:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li>IP address and general location</li>
            <li>Browser type and device information</li>
            <li>Pages visited and time spent on site</li>
            <li>Ad interactions and clicks</li>
        </ul>
          <p className="text-neutral-700 mb-6">
            <strong>Data Use:</strong> Google uses this information to show relevant ads and measure ad performance. 
            You can control ad personalization through your <a href="https://adssettings.google.com" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
          </p>

          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Google Fonts</h3>
          <p className="text-neutral-700 mb-6">
            We use Google Fonts to display text. Google may collect your IP address and browser information when fonts are loaded. 
            This is standard practice for web fonts and is necessary for the fonts to display properly.
          </p>

          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Cloudflare Pages (Hosting)</h3>
          <p className="text-neutral-700 mb-6">
            Our website is hosted on Cloudflare Pages, which automatically logs:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li>IP addresses</li>
            <li>Request timestamps</li>
            <li>Pages accessed</li>
            <li>Browser information</li>
        </ul>
          <p className="text-neutral-700 mb-6">
            These logs are used for website operation and basic analytics. Cloudflare's privacy policy applies to this data.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">What We Don't Collect</h2>
          <p className="text-neutral-700 mb-4">
            We do <strong>not</strong> collect:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li>Names, email addresses, or contact information</li>
            <li>User accounts or login credentials</li>
            <li>Payment information or transaction data</li>
            <li>Personal preferences or custom settings</li>
            <li>Survey responses or feedback</li>
            <li>Newsletter subscriptions</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">How We Use Information</h2>
          <p className="text-neutral-700 mb-4">
            The automatically collected information is used for:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li>Displaying advertisements (Google AdSense)</li>
            <li>Loading fonts properly (Google Fonts)</li>
            <li>Website operation and performance (Cloudflare)</li>
            <li>Basic website analytics and security</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Third-Party Services</h2>
          <p className="text-neutral-700 mb-4">
            Our website uses these third-party services:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>Google AdSense:</strong> <a href="https://policies.google.com/privacy" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
            <li><strong>Google Fonts:</strong> <a href="https://policies.google.com/privacy" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
            <li><strong>Cloudflare:</strong> <a href="https://www.cloudflare.com/privacypolicy/" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Cloudflare Privacy Policy</a></li>
          </ul>
          <p className="text-neutral-700 mb-6">
            We are not responsible for the privacy practices of these third-party services. Please review their privacy policies.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Your Choices</h2>
          <p className="text-neutral-700 mb-4">
            You can control your privacy in several ways:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>Ad Personalization:</strong> Use <a href="https://adssettings.google.com" className="text-primary-600 hover:text-primary-700" target="_blank" rel="noopener noreferrer">Google Ads Settings</a> to control ad preferences</li>
            <li><strong>Browser Settings:</strong> Configure your browser to block cookies or tracking</li>
            <li><strong>Ad Blockers:</strong> Use ad-blocking software to prevent ad tracking</li>
            <li><strong>Private Browsing:</strong> Use private/incognito mode when visiting our site</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Data Security</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            We rely on third-party services (Google, Cloudflare) for data security. These companies implement industry-standard 
            security measures. Since we don't collect or store personal information directly, there's minimal risk of data breaches on our end.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Children's Privacy</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            Our website is suitable for all ages and does not knowingly collect personal information from children under 13. 
            Since we don't collect personal information, this is not a concern for our current setup.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Changes to This Policy</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            We may update this Privacy Policy if we add new features or services. We will post the updated policy on this page 
            with a new "Last updated" date. Since we don't collect contact information, we cannot notify users directly of changes.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Contact Us</h2>
          <p className="text-neutral-700 mb-4">
            If you have questions about this Privacy Policy, you can:
          </p>
          <div className="bg-neutral-50 rounded-xl p-6 mb-6">
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Visit our <a href="/about" className="text-primary-600 hover:text-primary-700">About page</a> for general information</li>
              <li>Check our <a href="/terms-of-service" className="text-primary-600 hover:text-primary-700">Terms of Service</a> for usage policies</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              <strong>Note:</strong> We currently do not have a contact form or email address for privacy inquiries. 
              This is intentional to minimize data collection.
            </p>
          </div>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-800 mb-3">Privacy Summary</h3>
            <p className="text-primary-700 text-sm leading-relaxed">
              <strong>In simple terms:</strong> We don't collect your personal information. Our website uses Google services 
              for ads and fonts, which may collect some browsing data. You can control this through your browser and Google settings. 
              We prioritize your privacy by keeping our data collection to the absolute minimum.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function TermsOfService() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Terms of Service</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Please read these terms of service carefully before using our website and services.
        </p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <p className="text-sm text-neutral-500 mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">1. Acceptance of Terms</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            By accessing and using ReseachBub ("the Website"), you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use this service.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">2. Description of Service</h2>
          <p className="text-neutral-700 mb-4">
            ReseachBub provides the following free services:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>IconBub:</strong> Scientific icon library with 100+ high-quality SVG format scientific icons</li>
            <li><strong>SoftBub:</strong> Curated free and open-source research software recommendations and download links</li>
            <li><strong>Blog:</strong> Research tutorials, tool reviews, and best practice guides</li>
            <li><strong>Resource Navigation:</strong> Organized collection and recommendations of research tools and resources</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">3. User Conduct</h2>
          <p className="text-neutral-700 mb-4">
            You agree to use the Website only for lawful purposes and in accordance with the following rules:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li>Do not use the Website for any illegal or harmful purposes</li>
            <li>Do not attempt to hack, attack, or disrupt Website functionality</li>
            <li>Do not use automated tools to access the Website in bulk</li>
            <li>Do not use Website content for commercial purposes (unless explicitly permitted)</li>
            <li>Respect other users' rights to use the Website</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">4. Intellectual Property Rights</h2>
          
          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Scientific Icons License</h3>
          <p className="text-neutral-700 mb-4">
            All scientific icons provided on this Website are protected by copyright. Usage license is as follows:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>✅ Permitted Use:</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Academic research and educational purposes</li>
                <li>University courses and academic papers</li>
                <li>Student projects and assignments</li>
                <li>Non-profit research activities</li>
              </ul>
            </li>
            <li><strong>❌ Prohibited Use:</strong>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Commercial use and profit-making activities</li>
                <li>Redistribution or resale</li>
                <li>Inclusion in commercial software packages</li>
                <li>Unauthorized derivative works</li>
              </ul>
            </li>
          </ul>

          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Blog Content</h3>
          <p className="text-neutral-700 mb-6">
            Blog articles may be freely read and cited, but please acknowledge the source. Code examples and tutorials 
            in articles may be used freely, but we recommend crediting the source.
          </p>

          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Third-Party Content</h3>
          <p className="text-neutral-700 mb-6">
            The Website contains links to third-party websites and software. We are not responsible for these external 
            contents, and you must comply with the respective terms of service when visiting third-party websites.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">5. Software Recommendations Disclaimer</h2>
          <p className="text-neutral-700 mb-4">
            Our software recommendations are provided for reference only. Important disclaimers:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li>We do <strong>not host or distribute</strong> any software packages</li>
            <li>All software belongs to their original developers</li>
            <li>You must download and comply with each software's license agreement</li>
            <li>We do <strong>not guarantee</strong> software functionality, security, or compatibility</li>
            <li>Risks of using third-party software are borne by you</li>
            <li>If you discover infringing software, please contact us promptly</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">6. Disclaimer of Warranties</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            Information on this Website is provided "as is" without any express or implied warranties. We do not 
            guarantee the accuracy, completeness, or applicability of information. You bear all risks of using this 
            Website and its content. To the maximum extent permitted by law, we exclude all liability.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">7. Limitation of Liability</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            In no event shall ReseachBub and its operators be liable for any direct, indirect, incidental, special, 
            or consequential damages arising from your use of this Website, including but not limited to loss of 
            profits, data loss, business interruption, etc.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">8. Service Changes and Termination</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            We reserve the right to modify, suspend, or terminate Website services at any time without prior notice. 
            Since this is a free service, we do not assume responsibility for service interruptions. We may perform 
            regular Website maintenance, during which brief unavailability may occur.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">9. Advertising and Third-Party Services</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            This Website may contain third-party advertisements (such as Google AdSense). We are not responsible 
            for advertisement content. Any transactions between you and advertisers are between you and the advertisers; 
            we are not a party to such transactions. Please review our <a href="/privacy-policy" className="text-primary-600 hover:text-primary-700">Privacy Policy</a> for data processing details.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">10. Changes to Terms</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            We may modify these Terms of Service at any time. Material changes will be posted on this page with an 
            updated "Last updated" date. Since we cannot proactively notify users, we recommend checking this page 
            regularly. Continued use of the Website constitutes acceptance of modified terms.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">11. Governing Law</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            These Terms of Service are governed by the laws of the jurisdiction where the Website operates. In case 
            of disputes, resolution should first be attempted through friendly consultation. If consultation fails, 
            legal remedies may be sought.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">12. Contact Information</h2>
          <p className="text-neutral-700 mb-4">
            If you have questions about these Terms of Service, you may:
          </p>
          <div className="bg-neutral-50 rounded-xl p-6 mb-6">
            <ul className="list-disc pl-6 text-neutral-700 space-y-2">
              <li>Visit our <a href="/about" className="text-primary-600 hover:text-primary-700">About page</a> for Website information</li>
              <li>Read our <a href="/privacy-policy" className="text-primary-600 hover:text-primary-700">Privacy Policy</a> for data processing details</li>
            </ul>
            <p className="text-neutral-700 mt-4">
              <strong>Note:</strong> We currently do not provide contact forms or email addresses. This is intentional 
              to minimize data collection and protect user privacy.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">13. Severability</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            If any part of these terms is deemed invalid or unenforceable, the remaining parts shall remain in effect. 
            These terms constitute the entire agreement between you and us regarding the use of this Website.
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-800 mb-3">Terms Summary</h3>
            <p className="text-primary-700 text-sm leading-relaxed">
              <strong>In simple terms:</strong> We provide free scientific icons, software recommendations, and tutorials. 
              Icons are for academic and educational use only, commercial use is prohibited. We do not guarantee 
              third-party software quality, use at your own risk. We may modify services at any time, so please 
              check for updates regularly.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SoftBub() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  
  const [softwareList] = useState([
    {
      id: 1,
      name: "ImageJ",
      category: "Image Analysis",
      description: "Open-source image processing and analysis software, widely used in biomedical research",
      icon: "🔬",
      downloadUrl: "https://imagej.nih.gov/ij/download.html",
      website: "https://imagej.nih.gov/ij/",
      license: "Public Domain",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 2,
      name: "R",
      category: "Statistical Analysis",
      description: "Powerful statistical computing and graphics language with rich biostatistics packages",
      icon: "📊",
      downloadUrl: "https://cran.r-project.org/",
      website: "https://www.r-project.org/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 3,
      name: "Python",
      category: "Programming Language",
      description: "General-purpose programming language with rich scientific computing libraries like NumPy, SciPy, Pandas",
      icon: "🐍",
      downloadUrl: "https://www.python.org/downloads/",
      website: "https://www.python.org/",
      license: "PSF License",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 4,
      name: "Bioconductor",
      category: "Bioinformatics",
      description: "R-based bioinformatics software package collection for genomic data analysis",
      icon: "🧬",
      downloadUrl: "https://bioconductor.org/install/",
      website: "https://bioconductor.org/",
      license: "Artistic-2.0",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 5,
      name: "GIMP",
      category: "Image Editing",
      description: "Free image editing software similar to Photoshop, suitable for scientific image processing",
      icon: "🎨",
      downloadUrl: "https://www.gimp.org/downloads/",
      website: "https://www.gimp.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 6,
      name: "Inkscape",
      category: "Vector Graphics",
      description: "Professional vector graphics editor, perfect for creating scientific charts and diagrams",
      icon: "✏️",
      downloadUrl: "https://inkscape.org/release/",
      website: "https://inkscape.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 7,
      name: "Audacity",
      category: "Audio Processing",
      description: "Free audio editing and recording software, suitable for acoustic research",
      icon: "🎵",
      downloadUrl: "https://www.audacityteam.org/download/",
      website: "https://www.audacityteam.org/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 8,
      name: "LibreOffice",
      category: "Office Suite",
      description: "Complete office suite including word processing, spreadsheets, presentations, and more",
      icon: "📝",
      downloadUrl: "https://www.libreoffice.org/download/",
      website: "https://www.libreoffice.org/",
      license: "MPL-2.0",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 9,
      name: "RStudio",
      category: "Development Environment",
      description: "Integrated development environment for R programming language with powerful debugging and visualization tools",
      icon: "💻",
      downloadUrl: "https://posit.co/download/rstudio-desktop/",
      website: "https://posit.co/products/rstudio/",
      license: "AGPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 10,
      name: "Scilab",
      category: "Numerical Computing",
      description: "Open-source alternative to MATLAB for numerical computations and scientific simulations",
      icon: "🧮",
      downloadUrl: "https://www.scilab.org/download",
      website: "https://www.scilab.org/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 11,
      name: "draw.io",
      category: "Diagram Creation",
      description: "Free online diagram software for creating flowcharts, network diagrams, and scientific illustrations",
      icon: "📋",
      downloadUrl: "https://github.com/jgraph/drawio-desktop/releases",
      website: "https://app.diagrams.net/",
      license: "Apache-2.0",
      platforms: ["Windows", "macOS", "Linux", "Web"]
    },
    {
      id: 12,
      name: "Blender",
      category: "3D Modeling",
      description: "Professional 3D computer graphics software for modeling, animation, and scientific visualization",
      icon: "🎭",
      downloadUrl: "https://www.blender.org/download/",
      website: "https://www.blender.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 13,
      name: "Zotero",
      category: "Reference Management",
      description: "Free reference manager to help collect, organize, cite, and share research sources",
      icon: "📚",
      downloadUrl: "https://www.zotero.org/download/",
      website: "https://www.zotero.org/",
      license: "AGPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 14,
      name: "Mendeley",
      category: "Reference Management",
      description: "Reference manager and academic social network for organizing research papers and collaboration",
      icon: "📖",
      downloadUrl: "https://www.mendeley.com/download-desktop/",
      website: "https://www.mendeley.com/",
      license: "Proprietary",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 15,
      name: "LibreCAD",
      category: "CAD Software",
      description: "Free 2D CAD application for creating technical drawings and engineering designs",
      icon: "📐",
      downloadUrl: "https://librecad.org/download/",
      website: "https://librecad.org/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 16,
      name: "SciDAVis",
      category: "Data Analysis",
      description: "Free application for scientific data analysis and visualization, alternative to Origin",
      icon: "📈",
      downloadUrl: "https://scidavis.sourceforge.net/download.html",
      website: "https://scidavis.sourceforge.net/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 17,
      name: "JabRef",
      category: "Reference Management",
      description: "Open-source bibliography reference manager for BibTeX, designed for researchers and academics",
      icon: "📑",
      downloadUrl: "https://www.jabref.org/#downloads",
      website: "https://www.jabref.org/",
      license: "MIT",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 18,
      name: "QuPath",
      category: "Image Analysis",
      description: "Open-source software for digital pathology and whole slide image analysis",
      icon: "🔍",
      downloadUrl: "https://qupath.github.io/downloads",
      website: "https://qupath.github.io/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 19,
      name: "DWSIM",
      category: "Chemical Engineering",
      description: "Open-source chemical process simulator for modeling and simulation of chemical processes",
      icon: "⚗️",
      downloadUrl: "https://dwsim.org/download/",
      website: "https://dwsim.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 20,
      name: "Obsidian",
      category: "Note Taking",
      description: "Powerful knowledge base that works on top of a local folder of plain text Markdown files",
      icon: "💎",
      downloadUrl: "https://obsidian.md/download",
      website: "https://obsidian.md/",
      license: "Proprietary",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 21,
      name: "Fusion 360",
      category: "CAD Software",
      description: "Professional 3D CAD/CAM software for product design and manufacturing, free for students and educators",
      icon: "🔧",
      downloadUrl: "https://www.autodesk.com/products/fusion-360/overview",
      website: "https://www.autodesk.com/products/fusion-360",
      license: "Proprietary",
      platforms: ["Windows", "macOS"]
    },
    {
      id: 22,
      name: "LTspice",
      category: "Circuit Simulation",
      description: "High-performance SPICE simulation software for electronic circuit design and analysis",
      icon: "⚡",
      downloadUrl: "https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html",
      website: "https://www.analog.com/en/design-center/design-tools-and-calculators/ltspice-simulator.html",
      license: "Proprietary",
      platforms: ["Windows", "macOS"]
    },
    {
      id: 23,
      name: "FreeMind",
      category: "Mind Mapping",
      description: "Free mind mapping software for brainstorming, organizing ideas, and project planning",
      icon: "🧠",
      downloadUrl: "https://sourceforge.net/projects/freemind/",
      website: "https://freemind.sourceforge.net/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 24,
      name: "Sumatra PDF",
      category: "PDF Reader",
      description: "Fast, lightweight PDF reader for Windows with minimal resource usage",
      icon: "📄",
      downloadUrl: "https://www.sumatrapdfreader.org/download-free-pdf-viewer",
      website: "https://www.sumatrapdfreader.org/",
      license: "GPL-3",
      platforms: ["Windows"]
    },
    {
      id: 25,
      name: "VMware Fusion",
      category: "Virtualization",
      description: "Professional virtualization software for running Windows and other operating systems on macOS",
      icon: "🖥️",
      downloadUrl: "https://www.vmware.com/products/fusion/fusion-evaluation.html",
      website: "https://www.vmware.com/products/fusion.html",
      license: "Proprietary",
      platforms: ["macOS"]
    },
    {
      id: 26,
      name: "Krita",
      category: "Digital Art",
      description: "Professional free and open-source painting program for digital artists and illustrators",
      icon: "🎨",
      downloadUrl: "https://krita.org/en/download/krita-desktop/",
      website: "https://krita.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 27,
      name: "AutoDock",
      category: "Molecular Docking",
      description: "Automated docking software for predicting the binding of small molecules to protein targets",
      icon: "🧬",
      downloadUrl: "http://autodock.scripps.edu/downloads",
      website: "http://autodock.scripps.edu/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 28,
      name: "VirtualBox",
      category: "Virtualization",
      description: "Free and open-source virtualization software for running multiple operating systems",
      icon: "💻",
      downloadUrl: "https://www.virtualbox.org/wiki/Downloads",
      website: "https://www.virtualbox.org/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 29,
      name: "GNU Octave",
      category: "Numerical Computing",
      description: "Free software for numerical computations, largely compatible with MATLAB",
      icon: "📊",
      downloadUrl: "https://octave.org/download",
      website: "https://octave.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 30,
      name: "Cytoscape",
      category: "Network Analysis",
      description: "Open-source platform for visualizing complex networks and integrating these with any type of attribute data",
      icon: "🕸️",
      downloadUrl: "https://cytoscape.org/download.html",
      website: "https://cytoscape.org/",
      license: "LGPL-2.1",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 31,
      name: "SageMath",
      category: "Mathematical Software",
      description: "Free open-source mathematics software system for algebra, geometry, number theory, and calculus",
      icon: "🔢",
      downloadUrl: "https://www.sagemath.org/download.html",
      website: "https://www.sagemath.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 32,
      name: "ParaView",
      category: "Scientific Visualization",
      description: "Open-source multi-platform data analysis and visualization application for scientific datasets",
      icon: "📊",
      downloadUrl: "https://www.paraview.org/download/",
      website: "https://www.paraview.org/",
      license: "BSD-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 33,
      name: "Thunderbird",
      category: "Email Client",
      description: "Free and open-source email client developed by Mozilla, supporting multiple email protocols and extensions",
      icon: "📧",
      downloadUrl: "https://www.thunderbird.net/zh-CN/",
      website: "https://www.thunderbird.net/",
      license: "MPL-2.0",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 34,
      name: "Arduino IDE",
      category: "Development Environment",
      description: "Official integrated development environment for Arduino microcontrollers, perfect for electronics prototyping and learning",
      icon: "🔌",
      downloadUrl: "https://www.arduino.cc/en/software",
      website: "https://www.arduino.cc/en/software",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 35,
      name: "LibrePCB",
      category: "CAD Software",
      description: "Free and open-source EDA software for designing printed circuit boards (PCB) with schematic capture capabilities",
      icon: "🔧",
      downloadUrl: "https://librepcb.org/download/",
      website: "https://librepcb.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 36,
      name: "Visual Studio Code",
      category: "Development Environment",
      description: "Free source-code editor developed by Microsoft, supporting multiple programming languages with rich extensions",
      icon: "💻",
      downloadUrl: "https://code.visualstudio.com/Download",
      website: "https://code.visualstudio.com/",
      license: "MIT",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 37,
      name: "KiCAD",
      category: "CAD Software",
      description: "Open-source EDA software suite for creating electronic schematic diagrams and printed circuit board layouts",
      icon: "⚡",
      downloadUrl: "https://www.kicad.org/download/",
      website: "https://www.kicad.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 38,
      name: "ImageOptim",
      category: "Image Editing",
      description: "Tool for optimizing images to reduce file sizes without quality loss, supporting multiple image formats",
      icon: "🖼️",
      downloadUrl: "https://imageoptim.com/mac",
      website: "https://imageoptim.com/",
      license: "GPL-3",
      platforms: ["macOS"]
    },
    {
      id: 39,
      name: "OpenShot",
      category: "Video Editing",
      description: "Free and open-source video editor with multi-track timeline, effects, and transitions for all skill levels",
      icon: "🎬",
      downloadUrl: "https://www.openshot.org/download/",
      website: "https://www.openshot.org/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 40,
      name: "RustDesk",
      category: "Remote Access",
      description: "Open-source remote desktop software supporting cross-platform remote control with security features",
      icon: "🖥️",
      downloadUrl: "https://rustdesk.com/",
      website: "https://rustdesk.com/",
      license: "AGPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 41,
      name: "Zettlr",
      category: "Note Taking",
      description: "Markdown editor designed for academic writing with citation management and multiple export formats",
      icon: "📝",
      downloadUrl: "https://www.zettlr.com/download",
      website: "https://www.zettlr.com/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 42,
      name: "Simplenote",
      category: "Note Taking",
      description: "Cross-platform note-taking app by Automattic with real-time sync and Markdown support",
      icon: "📄",
      downloadUrl: "https://simplenote.com/downloads/",
      website: "https://simplenote.com/",
      license: "GPL-2",
      platforms: ["Windows", "macOS", "Linux", "Web"]
    },
    {
      id: 43,
      name: "MarkText",
      category: "Note Taking",
      description: "Open-source Markdown editor with real-time preview, multiple themes, and clean interface",
      icon: "✏️",
      downloadUrl: "https://github.com/marktext/marktext/releases",
      website: "https://marktext.app/",
      license: "MIT",
      platforms: ["Windows", "macOS", "Linux"]
    },
    {
      id: 44,
      name: "Skim",
      category: "PDF Reader",
      description: "PDF reader and note-taking application for macOS with annotation and highlighting features for academic reading",
      icon: "📖",
      downloadUrl: "https://skim-app.sourceforge.io/",
      website: "https://skim-app.sourceforge.io/",
      license: "BSD-2",
      platforms: ["macOS"]
    },
    {
      id: 45,
      name: "Notepads",
      category: "Text Editor",
      description: "Modern Windows text editor with multi-tab support, Markdown preview, and syntax highlighting",
      icon: "📝",
      downloadUrl: "https://www.microsoft.com/store/apps/9nhl4nsc67wm",
      website: "https://www.notepads.app/",
      license: "MIT",
      platforms: ["Windows"]
    },
    {
      id: 46,
      name: "Calibre",
      category: "E-book Management",
      description: "Powerful e-book management software supporting multiple formats for reading, converting, and editing e-books",
      icon: "📚",
      downloadUrl: "https://calibre-ebook.com/download",
      website: "https://calibre-ebook.com/",
      license: "GPL-3",
      platforms: ["Windows", "macOS", "Linux"]
    }
  ]);

  // Get all unique categories
  const categories = ['All', ...new Set(softwareList.map(software => software.category))];

  // Filter software
  const filteredSoftware = activeCategory === 'All' 
    ? softwareList 
    : softwareList.filter(software => software.category === activeCategory);

  // Search filter
  const searchedSoftware = search.trim() === '' 
    ? filteredSoftware 
    : filteredSoftware.filter(software =>
        software.name.toLowerCase().includes(search.toLowerCase()) ||
        software.description.toLowerCase().includes(search.toLowerCase()) ||
        software.category.toLowerCase().includes(search.toLowerCase())
      );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
          Research Software Hub
        </h1>
        <p className="text-lg text-neutral-600 max-w-2xl">
          Discover {softwareList.length}+ essential software tools for researchers and educators. 
          From data analysis to visualization, find the perfect tools for your research workflow.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar - Categories */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="sticky top-8">
            <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Categories</h2>
              <div className="space-y-1">
                {categories.map(category => {
                  const categoryCount = category === 'All' ? softwareList.length : softwareList.filter(software => software.category === category).length;
                  return (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                        activeCategory === category
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category}</span>
                        <span className="text-xs text-neutral-500">({categoryCount})</span>
                      </div>
              </button>
                  );
                })}
              </div>
          </div>
        </div>
      </div>

        {/* Right Content Area */}
        <div className="flex-1">
          {/* Search and View Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-8">
      {/* Search Box */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
        <input
          type="text"
                placeholder="Search software by name, description, or category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
                className="search-input pl-10"
        />
      </div>

            {/* View Mode Toggle */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-neutral-600 mr-3">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-neutral-500 hover:text-neutral-700'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Results Count */}
            <div className="flex items-center text-sm text-neutral-600">
              <span>{searchedSoftware.length} tools found</span>
            </div>
          </div>

          {/* Software Grid/List */}
          {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {searchedSoftware.map(software => (
            <div key={software.id} className="card group">
              {/* Software Header */}
              <div className="p-6 border-b border-neutral-100">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="text-4xl group-hover:scale-110 transition-transform duration-200">
                    {software.icon}
                </div>
                  <div className="flex-1">
                    <div className="mb-2">
                      <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                        {software.name}
                      </h3>
              </div>
                    <p className="text-neutral-600 text-sm leading-relaxed line-clamp-3">
                      {software.description}
                    </p>
              </div>
                </div>
            </div>

            {/* Software Information */}
              <div className="p-6 bg-neutral-50">
              {/* Platform Support */}
              <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-700 mb-3">Supported Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {software.platforms.map(platform => (
                      <span key={platform} className="tag-secondary text-xs">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* License */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-neutral-700 mb-1">License</h4>
                  <span className="text-sm text-neutral-600">{software.license}</span>
              </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <a
                    href={software.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex-1 text-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Visit
                  </a>
                  <a
                    href={software.downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-outline flex-1 text-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download
                  </a>
                </div>
            </div>
          </div>
        ))}
      </div>
          ) : (
            <div className="space-y-4">
              {searchedSoftware.map(software => (
                <div key={software.id} className="card p-6">
                  <div className="flex items-center space-x-6">
                    <div className="text-4xl flex-shrink-0">
                      {software.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h3 className="text-xl font-semibold text-neutral-900">
                          {software.name}
                        </h3>
                      </div>
                      <p className="text-neutral-600 text-sm mb-3 line-clamp-2">
                        {software.description}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-neutral-500">
                        <span>License: {software.license}</span>
                        <span>•</span>
                        <span>Platforms: {software.platforms.join(', ')}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex gap-3">
                      <a
                        href={software.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                      >
                        Visit
                      </a>
                      <a
                        href={software.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Results */}
      {searchedSoftware.length === 0 && (
            <div className="text-center py-20">
              <div className="text-neutral-300 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">No software found</h3>
              <p className="text-neutral-600 mb-6">Try adjusting your search terms or selecting a different category.</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All'); }}
                className="btn-outline"
              >
                Clear Filters
              </button>
        </div>
      )}
        </div>
      </div>
    </main>
  );
}

function Blog() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    loadAllBlogPosts()
      .then(posts => {
        setBlogPosts(posts);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const handlePostClick = async (post) => {
    if (post.parsedContent) {
      setSelectedPost(post);
    } else {
      // Load the full post if not already loaded
      const fullPost = await loadBlogPost(post.filename);
      if (fullPost) {
        setSelectedPost(fullPost);
      }
    }
  };

  const handleBackToList = () => {
    setSelectedPost(null);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-scientific-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-500">
          <p className="text-lg font-medium">Error: {error}</p>
        </div>
      </main>
    );
  }

  if (selectedPost) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBackToList}
          className="mb-8 flex items-center text-primary-600 hover:text-primary-700 transition-colors group"
        >
          <svg className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </button>
        
        {/* Article Header */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-4">
            <span className="px-4 py-2 bg-primary-100 text-primary-700 text-sm font-medium rounded-xl">
              {selectedPost.category}
            </span>
            <span className="text-sm text-neutral-500">{selectedPost.readTime}</span>
          </div>
          <h1 className="text-5xl font-bold text-neutral-900 mb-6 leading-tight">{selectedPost.title}</h1>
          <div className="flex items-center space-x-6 text-neutral-600 mb-8">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>By {selectedPost.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{selectedPost.date}</span>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {selectedPost.image && (
          <div className="mb-10">
            <img 
              src={selectedPost.image} 
              alt={selectedPost.title}
              className="w-full h-80 object-cover rounded-2xl shadow-large" 
            />
          </div>
        )}

        {/* Article Content */}
        <div className="prose prose-lg max-w-none">
          {selectedPost.parsedContent}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-primary rounded-2xl mb-6">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Research Blog</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Practical tutorials and guides for researchers and educators. Learn about useful tools 
          and techniques to enhance your research workflow.
        </p>
      </div>

      {/* All Posts - Horizontal Layout */}
      <div className="space-y-8">
        {blogPosts.map(post => (
          <div key={post.filename} className="bg-white rounded-2xl shadow-soft overflow-hidden border border-neutral-200/50 hover:shadow-medium transition-all duration-300 hover:scale-[1.01]">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img 
                  src={post.image || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"} 
                  alt={post.title}
                  className="w-full h-48 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-6">
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm font-medium rounded-xl">
                    {post.category}
                  </span>
                  <span className="text-sm text-neutral-500">{post.readTime}</span>
                </div>
                <h3 className="text-xl font-bold text-neutral-900 mb-3 leading-tight">{post.title}</h3>
                <p className="text-neutral-600 mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-neutral-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <button
                    onClick={() => handlePostClick(post)}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors flex items-center"
                  >
                    Read More
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
              </div>
              </div>
            </div>
          </div>
        ))}
      </div>


    </main>
  );
}


function License() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">License Information</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Clear licensing terms for all content and resources provided on ReseachBub.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <p className="text-sm text-neutral-500 mb-6">
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Scientific Icons License</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            All scientific icons provided on ReseachBub are original creations by the site owner (GlauNee) and are 
            protected by copyright. These icons were created over years of research work and are shared with the 
            scientific community under the following terms:
          </p>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-green-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Permitted Use (Free for Academic and Educational Purposes)
            </h3>
            <p className="text-green-700 mb-4">
              You are welcome to use these icons for any academic and educational projects, including:
            </p>
            <ul className="list-disc pl-6 text-green-700 space-y-2">
              <li>Academic research papers and publications</li>
              <li>Educational materials and presentations</li>
              <li>University seminars and conference talks</li>
              <li>Student projects, theses, and dissertations</li>
              <li>Non-profit research activities and reports</li>
              <li>Scientific posters and educational content</li>
            </ul>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <h3 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Prohibited Use (Strictly Not Allowed)
            </h3>
            <p className="text-red-700 mb-4">
              The use of these icons is strictly prohibited in any commercial context. This includes, but is not limited to:
            </p>
            <ul className="list-disc pl-6 text-red-700 space-y-2">
              <li>Business websites and commercial applications</li>
              <li>Advertisements and marketing materials</li>
              <li>Product packaging and branding</li>
              <li>Corporate presentations and reports</li>
              <li>Commercial software and apps</li>
              <li>For-profit training materials</li>
            </ul>
          </div>

          <h3 className="text-xl font-semibold text-neutral-800 mb-3">Additional Terms</h3>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>Redistribution:</strong> You may not redistribute, resell, or include these icons in any download platform or package without explicit written permission.</li>
            <li><strong>Modification:</strong> You may modify icons for your specific use case, but you may not claim ownership of the modified versions.</li>
            <li><strong>Attribution:</strong> While not required, we appreciate attribution to ReseachBub when possible.</li>
            <li><strong>Commercial Licensing:</strong> For commercial use or special licensing arrangements, please contact us through our About page.</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Blog Content License</h2>
          <p className="text-neutral-700 mb-4">
            Blog articles and tutorials on ReseachBub are provided under the following terms:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>Reading and Citation:</strong> Articles may be freely read and cited in academic work with proper attribution.</li>
            <li><strong>Code Examples:</strong> Code snippets and tutorials may be used freely in your projects, but we recommend crediting the source.</li>
            <li><strong>Educational Use:</strong> Tutorials and guides may be used for educational purposes without restriction.</li>
            <li><strong>Commercial Use:</strong> Commercial use of blog content requires permission.</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Software Recommendations</h2>
          <p className="text-neutral-700 mb-4">
            Important disclaimers regarding software recommendations:
          </p>
          <ul className="list-disc pl-6 text-neutral-700 space-y-2 mb-6">
            <li><strong>No Distribution:</strong> We do not host, distribute, or provide software packages ourselves.</li>
            <li><strong>Third-Party Licenses:</strong> All software listed belongs to their respective owners and is subject to their individual license agreements.</li>
            <li><strong>User Responsibility:</strong> You must review and comply with each software's specific license before use.</li>
            <li><strong>No Warranty:</strong> We make no guarantees about software functionality, security, or compatibility.</li>
          </ul>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Website Code and Design</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            The website code, design, and structure are proprietary to ReseachBub. The underlying technology stack 
            (React, Tailwind CSS, etc.) uses their respective open-source licenses. You may not copy, modify, or 
            redistribute the website's design or code without permission.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Copyright Infringement</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            If you believe any content on this website infringes upon a copyright or license, please contact us 
            immediately through our About page, and we will investigate and remove any infringing content without delay.
          </p>

          <h2 className="text-2xl font-bold text-neutral-900 mb-4">License Changes</h2>
          <p className="text-neutral-700 mb-6 leading-relaxed">
            We reserve the right to modify these license terms at any time. Changes will be posted on this page 
            with an updated "Last updated" date. Continued use of our content after changes constitutes acceptance 
            of the modified terms.
          </p>

          <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-primary-800 mb-3">License Summary</h3>
            <p className="text-primary-700 text-sm leading-relaxed">
              <strong>In simple terms:</strong> Use our icons freely for academic and educational purposes. 
              Commercial use is prohibited without permission. Blog content can be cited and used for education. 
              We don't distribute software - only provide links to official sources. Always check individual 
              software licenses before use.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function ToolBub() {
  const tools = [
    {
      id: 1,
      name: "Citation Generator",
      description: "Generate academic citations in multiple formats (APA, MLA, Chicago, Harvard, IEEE, AMA, ACS, APSA) from DOI",
      icon: "📚",
      category: "Academic Tools",
      url: "/citation-tool",
      features: ["DOI-based citation", "8 citation formats", "Copy to clipboard", "Free to use"]
    },
    {
      id: 2,
      name: "Unit Converter",
      description: "Convert between different scientific units including length, weight, temperature, concentration, volume, and area",
      icon: "🔧",
      category: "Scientific Tools",
      url: "/unit-converter",
      features: ["6 unit categories", "Real-time conversion", "Scientific precision", "Easy to use"]
    },
    {
      id: 3,
      name: "Image Compressor",
      description: "Compress image files to reduce file size while maintaining quality. Perfect for optimizing images for web, email, and storage",
      icon: "🗜️",
      category: "File Tools",
      url: "/file-compressor",
      features: ["Image compression", "Drag & drop upload", "Quality control", "Multiple formats"]
    },
    {
      id: 4,
      name: "Image Watermark Tool",
      description: "Add custom watermarks to your images with precise control over position, style, and opacity. Perfect for protecting your scientific images and presentations",
      icon: "🏷️",
      category: "Image Tools",
      url: "/watermark-tool",
      features: ["Custom watermark text", "Multiple positions", "Style controls", "Drag & drop upload"]
    },
    {
      id: 5,
      name: "PDF Tool",
      description: "Powerful PDF processing tool based on WebAssembly. Compress, split, and merge PDF files directly in your browser with complete privacy protection",
      icon: "📄",
      category: "Document Tools",
      url: "/pdf-tool",
      features: ["PDF compression", "PDF splitting", "PDF merging", "WebAssembly powered", "Privacy safe"]
    },
    {
      id: 6,
      name: "Word Counter",
      description: "Count words, characters, sentences, and paragraphs in your text with detailed statistics and reading time estimation",
      icon: "📊",
      category: "Text Tools",
      url: "/word-counter",
      features: ["Real-time counting", "Multiple metrics", "Reading time", "Copy & download", "Privacy safe"]
    },
    {
      id: 7,
      name: "Image Converter",
      description: "Convert images between different formats (JPEG, PNG, WebP, BMP, GIF) with quality control and batch processing",
      icon: "🖼️",
      category: "Image Tools",
      url: "/image-converter",
      features: ["Multiple formats", "Quality control", "Batch processing", "Size optimization", "Privacy safe"]
    },
    {
      id: 8,
      name: "Text Diff Tool",
      description: "Compare two texts and highlight differences with detailed line-by-line and character-level analysis",
      icon: "🔍",
      category: "Text Tools",
      url: "/text-diff",
      features: ["Line-by-line diff", "Character-level analysis", "Statistics", "Case sensitivity", "Privacy safe"]
    },
    {
      id: 9,
      name: "Laboratory Timer",
      description: "Professional timing tool for scientific experiments with lap recording, keyboard shortcuts, and precise timing",
      icon: "⏱️",
      category: "Laboratory Tools",
      url: "/timer-tool",
      features: ["Precise timing", "Lap recording", "Keyboard shortcuts", "Clean interface", "Lab optimized"]
    }
    // 未来可以添加更多工具
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">ToolBub</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          A collection of useful web tools to enhance your research workflow and academic productivity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {tools.map((tool) => (
          <div key={tool.id} className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 hover:shadow-lg transition-all duration-300 group">
            <div className="text-center mb-6">
              <div className="text-4xl mb-4">{tool.icon}</div>
              <h3 className="text-xl font-semibold text-neutral-900 mb-2">{tool.name}</h3>
              <span className="inline-block bg-primary-100 text-primary-700 text-xs font-medium px-3 py-1 rounded-full">
                {tool.category}
              </span>
            </div>
            
            <p className="text-neutral-600 mb-6 leading-relaxed">
              {tool.description}
            </p>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-neutral-700 mb-3">Features:</h4>
              <ul className="space-y-1">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm text-neutral-600">
                    <svg className="w-4 h-4 text-primary-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <Link 
              to={tool.url}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 group-hover:shadow-lg"
            >
              <span>Launch Tool</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">More Tools Coming Soon</h2>
          <p className="text-neutral-600 mb-6">
            We're constantly working on adding new tools to help with your research workflow. 
            Have a tool suggestion? Let us know!
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-neutral-500">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              Reference Manager
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              Data Converter
            </span>
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
              Lab Calculator
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

function CitationTool() {
  const [doi, setDoi] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paperData, setPaperData] = useState(null);
  const [activeFormat, setActiveFormat] = useState('apa');
  const [copied, setCopied] = useState(false);

  const citationFormats = ['apa', 'mla', 'chicago', 'harvard', 'ieee', 'ama', 'acs', 'apsa'];

  // 清理DOI格式
  const cleanDOIFormat = (doi) => {
    let cleanDOI = doi.replace(/^https?:\/\/(dx\.)?doi\.org\//, '');
    cleanDOI = cleanDOI.replace(/^doi:/, '');
    
    if (!cleanDOI.startsWith('10.')) {
      throw new Error('DOI format is incorrect, should start with 10.');
    }
    
    return cleanDOI;
  };

  // 获取文献数据
  const fetchPaperData = async (doi) => {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Paper not found for this DOI');
      } else if (response.status === 429) {
        throw new Error('Too many requests, please try again later');
      } else {
        throw new Error('Failed to fetch paper information');
      }
    }
    
    const data = await response.json();
    const work = data.message;
    
    return {
      title: work.title ? work.title[0] : 'Unknown Title',
      authors: work.author || [],
      journal: work['container-title'] ? work['container-title'][0] : 'Unknown Journal',
      year: work['published-print'] ? work['published-print']['date-parts'][0][0] : 
            work['published-online'] ? work['published-online']['date-parts'][0][0] : 
            work['created']['date-parts'][0][0],
      volume: work.volume || '',
      issue: work.issue || '',
      pages: work.page || '',
      doi: work.DOI,
      publisher: work.publisher || '',
      url: work.URL || `https://doi.org/${work.DOI}`,
      abstract: work.abstract || ''
    };
  };

  // 格式化作者列表
  const formatAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    
    return authors.map(author => {
      const given = author.given || '';
      const family = author.family || '';
      return `${given} ${family}`.trim();
    }).join(', ');
  };

  // 生成APA格式引用
  const generateAPACitation = (data) => {
    const authors = formatAPAAuthors(data.authors);
    const year = data.year;
    const title = data.title;
    const journal = data.journal;
    const volume = data.volume;
    const issue = data.issue;
    const pages = data.pages;
    const doi = data.doi;
    
    let citation = `${authors} (${year}). ${title}. ${journal}`;
    
    if (volume) {
      citation += `, ${volume}`;
      if (issue) {
        citation += `(${issue})`;
      }
    }
    
    if (pages) {
      citation += `, ${pages}`;
    }
    
    citation += `. https://doi.org/${doi}`;
    
    return citation;
  };

  // 格式化APA作者
  const formatAPAAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    
    if (authors.length === 1) {
      return formatSingleAuthorAPA(authors[0]);
    } else if (authors.length <= 7) {
      const formattedAuthors = authors.map(author => formatSingleAuthorAPA(author));
      const lastAuthor = formattedAuthors.pop();
      return formattedAuthors.join(', ') + ', & ' + lastAuthor;
    } else {
      const firstAuthor = formatSingleAuthorAPA(authors[0]);
      return firstAuthor + ' et al.';
    }
  };

  const formatSingleAuthorAPA = (author) => {
    const family = author.family || '';
    const given = author.given || '';
    const initials = given.split(' ').map(name => name.charAt(0) + '.').join(' ');
    return `${family}, ${initials}`;
  };

  // 生成AMA格式引用
  const generateAMACitation = (data) => {
    const authors = formatAMAAuthors(data.authors);
    const year = data.year;
    const title = data.title;
    const journal = data.journal;
    const volume = data.volume;
    const issue = data.issue;
    const pages = data.pages;
    const doi = data.doi;
    
    let citation = `${authors}. ${title}. ${journal}`;
    
    if (year) {
      citation += `. ${year}`;
    }
    
    if (volume) {
      citation += `;${volume}`;
      if (issue) {
        citation += `(${issue})`;
      }
    }
    
    if (pages) {
      citation += `:${pages}`;
    }
    
    citation += `. doi:${doi}`;
    
    return citation;
  };

  // 格式化AMA作者
  const formatAMAAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    
    if (authors.length <= 6) {
      return authors.map(author => formatSingleAuthorAMA(author)).join(', ');
    } else {
      const firstThree = authors.slice(0, 3).map(author => formatSingleAuthorAMA(author)).join(', ');
      const lastAuthor = formatSingleAuthorAMA(authors[authors.length - 1]);
      return `${firstThree}, et al. ${lastAuthor}`;
    }
  };

  const formatSingleAuthorAMA = (author) => {
    const family = author.family || '';
    const given = author.given || '';
    const initials = given.split(' ').map(name => name.charAt(0)).join('');
    return `${family} ${initials}`;
  };

  // 生成ACS格式引用
  const generateACSCitation = (data) => {
    const authors = formatACSAuthors(data.authors);
    const year = data.year;
    const title = data.title;
    const journal = data.journal;
    const volume = data.volume;
    const issue = data.issue;
    const pages = data.pages;
    const doi = data.doi;
    
    let citation = `${authors} ${title} ${journal}`;
    
    if (year) {
      citation += ` ${year}`;
    }
    
    if (volume) {
      citation += `, ${volume}`;
      if (issue) {
        citation += ` (${issue})`;
      }
    }
    
    if (pages) {
      citation += `, ${pages}`;
    }
    
    citation += `. DOI: ${doi}`;
    
    return citation;
  };

  // 格式化ACS作者
  const formatACSAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    
    if (authors.length === 1) {
      return formatSingleAuthorACS(authors[0]);
    } else if (authors.length <= 10) {
      const formattedAuthors = authors.map(author => formatSingleAuthorACS(author));
      const lastAuthor = formattedAuthors.pop();
      return formattedAuthors.join('; ') + '; ' + lastAuthor;
    } else {
      const firstAuthor = formatSingleAuthorACS(authors[0]);
      return firstAuthor + ' et al.';
    }
  };

  const formatSingleAuthorACS = (author) => {
    const family = author.family || '';
    const given = author.given || '';
    const initials = given.split(' ').map(name => name.charAt(0)).join('');
    return `${family}, ${initials}`;
  };

  // 生成APSA格式引用
  const generateAPSACitation = (data) => {
    const authors = formatAPSAAuthors(data.authors);
    const year = data.year;
    const title = data.title;
    const journal = data.journal;
    const volume = data.volume;
    const issue = data.issue;
    const pages = data.pages;
    const doi = data.doi;
    
    let citation = `${authors}. "${title}." ${journal}`;
    
    if (volume) {
      citation += ` ${volume}`;
      if (issue) {
        citation += `, no. ${issue}`;
      }
    }
    
    if (year) {
      citation += ` (${year})`;
    }
    
    if (pages) {
      citation += `: ${pages}`;
    }
    
    citation += `. doi:${doi}`;
    
    return citation;
  };

  // 格式化APSA作者
  const formatAPSAAuthors = (authors) => {
    if (!authors || authors.length === 0) return 'Unknown Author';
    
    if (authors.length === 1) {
      return formatSingleAuthorAPSA(authors[0]);
    } else if (authors.length <= 3) {
      const formattedAuthors = authors.map(author => formatSingleAuthorAPSA(author));
      const lastAuthor = formattedAuthors.pop();
      return formattedAuthors.join(', ') + ', and ' + lastAuthor;
    } else {
      const firstAuthor = formatSingleAuthorAPSA(authors[0]);
      return firstAuthor + ' et al.';
    }
  };

  const formatSingleAuthorAPSA = (author) => {
    const family = author.family || '';
    const given = author.given || '';
    return `${family}, ${given}`;
  };

  // 处理DOI查询
  const handleFetchCitation = async () => {
    if (!doi.trim()) {
      setError('Please enter a DOI');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setPaperData(null);
      
      const cleanDOI = cleanDOIFormat(doi.trim());
      const data = await fetchPaperData(cleanDOI);
      setPaperData(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // 复制引用
  const copyCitation = async () => {
    if (!paperData) return;
    
    let citation = '';
    switch (activeFormat) {
      case 'apa':
        citation = generateAPACitation(paperData);
        break;
      case 'ama':
        citation = generateAMACitation(paperData);
        break;
      case 'acs':
        citation = generateACSCitation(paperData);
        break;
      case 'apsa':
        citation = generateAPSACitation(paperData);
        break;
      default:
        citation = generateAPACitation(paperData);
    }
    
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy citation:', error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Citation Generator</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Generate academic citations in multiple formats (APA, MLA, Chicago, Harvard, IEEE) from DOI.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <label htmlFor="doi-input" className="block text-sm font-semibold text-neutral-700 mb-3">
              DOI (Digital Object Identifier)
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                id="doi-input"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g., 10.1038/nature12373"
                className="flex-1 px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleFetchCitation()}
              />
              <button
                onClick={handleFetchCitation}
                disabled={loading}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Fetching...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Get Citation
                  </>
                )}
              </button>
            </div>
            <p className="text-sm text-neutral-500 mt-2">
              Supports full DOI links or DOI numbers only
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-red-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-600">Fetching paper information...</p>
            </div>
          )}

          {paperData && (
            <div className="space-y-6">
              {/* 文献信息 */}
              <div className="bg-neutral-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Paper Information</h3>
                <div className="grid gap-3 text-sm">
                  <div className="flex">
                    <span className="font-medium text-neutral-600 w-20">Title:</span>
                    <span className="text-neutral-800 flex-1">{paperData.title}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-neutral-600 w-20">Authors:</span>
                    <span className="text-neutral-800 flex-1">{formatAuthors(paperData.authors)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-neutral-600 w-20">Journal:</span>
                    <span className="text-neutral-800 flex-1">{paperData.journal}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium text-neutral-600 w-20">Year:</span>
                    <span className="text-neutral-800 flex-1">{paperData.year}</span>
                  </div>
                  {paperData.volume && (
                    <div className="flex">
                      <span className="font-medium text-neutral-600 w-20">Volume:</span>
                      <span className="text-neutral-800 flex-1">{paperData.volume}</span>
                    </div>
                  )}
                  {paperData.issue && (
                    <div className="flex">
                      <span className="font-medium text-neutral-600 w-20">Issue:</span>
                      <span className="text-neutral-800 flex-1">{paperData.issue}</span>
                    </div>
                  )}
                  {paperData.pages && (
                    <div className="flex">
                      <span className="font-medium text-neutral-600 w-20">Pages:</span>
                      <span className="text-neutral-800 flex-1">{paperData.pages}</span>
                    </div>
                  )}
                  <div className="flex">
                    <span className="font-medium text-neutral-600 w-20">DOI:</span>
                    <a href={paperData.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 flex-1">
                      {paperData.doi}
                    </a>
                  </div>
                </div>
              </div>

              {/* 引用格式 */}
              <div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Citation Formats</h3>
                
                {/* 格式标签 */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {citationFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setActiveFormat(format)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                        activeFormat === format
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                      }`}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* 引用内容 */}
                <div className="bg-neutral-50 rounded-xl p-6 mb-4">
                  <div className="font-mono text-sm leading-relaxed text-neutral-800">
                    {activeFormat === 'apa' && generateAPACitation(paperData)}
                    {activeFormat === 'ama' && generateAMACitation(paperData)}
                    {activeFormat === 'acs' && generateACSCitation(paperData)}
                    {activeFormat === 'apsa' && generateAPSACitation(paperData)}
                    {activeFormat === 'mla' && generateAPACitation(paperData)}
                    {activeFormat === 'chicago' && generateAPACitation(paperData)}
                    {activeFormat === 'harvard' && generateAPACitation(paperData)}
                    {activeFormat === 'ieee' && generateAPACitation(paperData)}
                  </div>
                </div>

                {/* 复制按钮 */}
                <button
                  onClick={copyCitation}
                  className={`px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2 ${
                    copied
                      ? 'bg-green-600 text-white'
                      : 'bg-primary-600 hover:bg-primary-700 text-white'
                  }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Citation
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="text-center">
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
          <p className="text-neutral-600 text-sm">
            Uses <a href="https://www.crossref.org/" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700">Crossref API</a> to fetch paper metadata
          </p>
        </div>
      </div>
    </main>
  );
}

function UnitConverter() {
  const [selectedCategory, setSelectedCategory] = useState('length');
  const [inputValue, setInputValue] = useState('');
  const [fromUnit, setFromUnit] = useState('');
  const [toUnit, setToUnit] = useState('');
  const [result, setResult] = useState('');
  const [showResult, setShowResult] = useState(false);

  // Unit definitions
  const units = {
    length: {
      name: 'Length',
      icon: '📏',
      units: [
        { name: 'Meter (m)', value: 'm', factor: 1 },
        { name: 'Centimeter (cm)', value: 'cm', factor: 0.01 },
        { name: 'Millimeter (mm)', value: 'mm', factor: 0.001 },
        { name: 'Kilometer (km)', value: 'km', factor: 1000 },
        { name: 'Inch (in)', value: 'in', factor: 0.0254 },
        { name: 'Foot (ft)', value: 'ft', factor: 0.3048 },
        { name: 'Yard (yd)', value: 'yd', factor: 0.9144 },
        { name: 'Mile (mi)', value: 'mi', factor: 1609.34 },
        { name: 'Micrometer (μm)', value: 'um', factor: 0.000001 },
        { name: 'Nanometer (nm)', value: 'nm', factor: 0.000000001 }
      ]
    },
    weight: {
      name: 'Weight',
      icon: '⚖️',
      units: [
        { name: 'Kilogram (kg)', value: 'kg', factor: 1 },
        { name: 'Gram (g)', value: 'g', factor: 0.001 },
        { name: 'Milligram (mg)', value: 'mg', factor: 0.000001 },
        { name: 'Microgram (μg)', value: 'ug', factor: 0.000000001 },
        { name: 'Pound (lb)', value: 'lb', factor: 0.453592 },
        { name: 'Ounce (oz)', value: 'oz', factor: 0.0283495 },
        { name: 'Ton (t)', value: 't', factor: 1000 },
        { name: 'Atomic Mass Unit (u)', value: 'u', factor: 1.66054e-27 }
      ]
    },
    temperature: {
      name: 'Temperature',
      icon: '🌡️',
      units: [
        { name: 'Celsius (°C)', value: 'c', factor: 1, offset: 0 },
        { name: 'Fahrenheit (°F)', value: 'f', factor: 5/9, offset: -32 },
        { name: 'Kelvin (K)', value: 'k', factor: 1, offset: -273.15 }
      ]
    },
    concentration: {
      name: 'Concentration',
      icon: '🧪',
      units: [
        { name: 'Molar (M)', value: 'M', factor: 1 },
        { name: 'Millimolar (mM)', value: 'mM', factor: 0.001 },
        { name: 'Micromolar (μM)', value: 'uM', factor: 0.000001 },
        { name: 'Nanomolar (nM)', value: 'nM', factor: 0.000000001 },
        { name: 'Picomolar (pM)', value: 'pM', factor: 0.000000000001 },
        { name: 'mg/L', value: 'mgL', factor: 0.001 },
        { name: 'μg/mL', value: 'ugmL', factor: 0.001 },
        { name: 'ng/mL', value: 'ngmL', factor: 0.000001 },
        { name: 'Percentage (%)', value: '%', factor: 10 },
        { name: 'Parts per Million (ppm)', value: 'ppm', factor: 0.001 }
      ]
    },
    volume: {
      name: 'Volume',
      icon: '🧴',
      units: [
        { name: 'Liter (L)', value: 'L', factor: 1 },
        { name: 'Milliliter (mL)', value: 'mL', factor: 0.001 },
        { name: 'Microliter (μL)', value: 'uL', factor: 0.000001 },
        { name: 'Cubic Meter (m³)', value: 'm3', factor: 1000 },
        { name: 'Cubic Centimeter (cm³)', value: 'cm3', factor: 0.001 },
        { name: 'Gallon (gal)', value: 'gal', factor: 3.78541 },
        { name: 'Quart (qt)', value: 'qt', factor: 0.946353 },
        { name: 'Pint (pt)', value: 'pt', factor: 0.473176 },
        { name: 'Fluid Ounce (fl oz)', value: 'floz', factor: 0.0295735 }
      ]
    },
    area: {
      name: 'Area',
      icon: '📐',
      units: [
        { name: 'Square Meter (m²)', value: 'm2', factor: 1 },
        { name: 'Square Centimeter (cm²)', value: 'cm2', factor: 0.0001 },
        { name: 'Square Millimeter (mm²)', value: 'mm2', factor: 0.000001 },
        { name: 'Square Kilometer (km²)', value: 'km2', factor: 1000000 },
        { name: 'Square Inch (in²)', value: 'in2', factor: 0.00064516 },
        { name: 'Square Foot (ft²)', value: 'ft2', factor: 0.092903 },
        { name: 'Acre (ac)', value: 'ac', factor: 4046.86 },
        { name: 'Hectare (ha)', value: 'ha', factor: 10000 }
      ]
    }
  };

  // Temperature conversion special handling
  const convertTemperature = (value, fromUnit, toUnit) => {
    const tempUnits = units.temperature.units;
    const fromTemp = tempUnits.find(u => u.value === fromUnit);
    const toTemp = tempUnits.find(u => u.value === toUnit);

    // First convert to Celsius
    let celsius;
    if (fromUnit === 'c') {
      celsius = value;
    } else if (fromUnit === 'f') {
      celsius = (value - 32) * 5/9;
    } else if (fromUnit === 'k') {
      celsius = value - 273.15;
    }

    // Convert from Celsius to target unit
    let result;
    if (toUnit === 'c') {
      result = celsius;
    } else if (toUnit === 'f') {
      result = celsius * 9/5 + 32;
    } else if (toUnit === 'k') {
      result = celsius + 273.15;
    }

    return result;
  };

  // Unit conversion function
  const convertUnits = (value, fromUnit, toUnit, category) => {
    if (category === 'temperature') {
      return convertTemperature(value, fromUnit, toUnit);
    }

    const categoryUnits = units[category].units;
    const fromUnitData = categoryUnits.find(u => u.value === fromUnit);
    const toUnitData = categoryUnits.find(u => u.value === toUnit);

    if (!fromUnitData || !toUnitData) return 0;

    // Convert to base unit, then to target unit
    const baseValue = value * fromUnitData.factor;
    const result = baseValue / toUnitData.factor;

    return result;
  };

  // Handle conversion
  const handleConvert = () => {
    if (!inputValue || !fromUnit || !toUnit) {
      setResult('Please fill in all fields');
      setShowResult(true);
      return;
    }

    const numValue = parseFloat(inputValue);
    if (isNaN(numValue)) {
      setResult('Please enter a valid number');
      setShowResult(true);
      return;
    }

    if (fromUnit === toUnit) {
      setResult(inputValue);
      setShowResult(true);
      return;
    }

    const convertedValue = convertUnits(numValue, fromUnit, toUnit, selectedCategory);
    setResult(convertedValue.toFixed(6).replace(/\.?0+$/, ''));
    setShowResult(true);
  };

  // Reset conversion
  const handleReset = () => {
    setInputValue('');
    setFromUnit('');
    setToUnit('');
    setResult('');
    setShowResult(false);
  };

  // Swap units
  const handleSwap = () => {
    if (fromUnit && toUnit) {
      const temp = fromUnit;
      setFromUnit(toUnit);
      setToUnit(temp);
      if (result && inputValue) {
        setInputValue(result);
        setResult(inputValue);
      }
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Unit Converter</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Convert between different scientific units including length, weight, temperature, concentration, volume, and area.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <div className="max-w-4xl mx-auto">
          {/* Unit category selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Select Unit Category</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(units).map(([key, category]) => (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedCategory(key);
                    handleReset();
                  }}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedCategory === key
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{category.icon}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Converter main body */}
          <div className="bg-neutral-50 rounded-xl p-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Input area */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  From
                </label>
                <div className="space-y-3">
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter value"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select unit</option>
                    {units[selectedCategory].units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Output area */}
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  To
                </label>
                <div className="space-y-3">
                  <div className="w-full px-4 py-3 bg-white border border-neutral-300 rounded-xl text-neutral-600">
                    {showResult ? result : 'Result will appear here'}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select unit</option>
                    {units[selectedCategory].units.map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              <button
                onClick={handleConvert}
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Convert
              </button>
              
              <button
                onClick={handleSwap}
                className="bg-neutral-600 hover:bg-neutral-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Swap
              </button>
              
              <button
                onClick={handleReset}
                className="bg-neutral-400 hover:bg-neutral-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Usage instructions */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">How to Use</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-neutral-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">1</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Select Category</div>
              <div>Choose the type of units you want to convert (length, weight, temperature, etc.)</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">2</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Enter Values</div>
              <div>Input the number and select the source and target units</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">3</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Get Result</div>
              <div>Click Convert to see the result instantly</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function FileCompressor() {
  const [selectedType] = useState('image');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [compressionSettings, setCompressionSettings] = useState({
    quality: 80,
    maxWidth: 800,
    maxHeight: 600,
    format: 'original'
  });
  const [compressedFiles, setCompressedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Supported file types
  const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Handle file selection
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      return supportedImageTypes.includes(file.type);
    });
    
    if (validFiles.length !== fileArray.length) {
      alert('Some files are not supported. Only JPEG, PNG, WebP files are allowed.');
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Remove file
  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Clear all files
  const clearAllFiles = () => {
    setSelectedFiles([]);
    setCompressedFiles([]);
  };

  // Compress images
  const compressImage = (file, settings) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = settings.maxWidth;
        const maxHeight = settings.maxHeight;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        const quality = settings.quality / 100;
        const outputFormat = settings.format === 'original' ? file.type : `image/${settings.format}`;
        
        canvas.toBlob((blob) => {
          const compressedFile = new File([blob], file.name, { type: outputFormat });
          resolve({
            original: file,
            compressed: compressedFile,
            originalSize: file.size,
            compressedSize: blob.size,
            compressionRatio: ((file.size - blob.size) / file.size * 100).toFixed(1)
          });
        }, outputFormat, quality);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };


  // Process all files
  const processFiles = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to compress');
      return;
    }

    setIsProcessing(true);
    const results = [];

    try {
      for (const file of selectedFiles) {
        const result = await compressImage(file, compressionSettings);
        results.push(result);
      }
      
      setCompressedFiles(results);
    } catch (error) {
      alert('Error processing files: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download compressed file
  const downloadFile = (compressedFile, originalName) => {
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compressed_${originalName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download all compressed files as ZIP (simplified)
  const downloadAll = () => {
    compressedFiles.forEach((result, index) => {
      setTimeout(() => {
        downloadFile(result.compressed, result.original.name);
      }, index * 500);
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2zm-2 0h12m-4 8h4m-4 4h4m-8-8h4m-4 4h4" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Image Compressor</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Compress your image files to reduce file size while maintaining quality. Perfect for optimizing images for web, email, and storage. PDF compression is not supported - convert PDFs to images first for best results.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <div className="max-w-6xl mx-auto">

          {/* File upload area */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload Files</h3>
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
                dragActive
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-neutral-300 hover:border-primary-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-neutral-700 mb-2">
                Drag and drop files here, or click to select
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Supports JPEG, PNG, WebP files up to 50MB
              </p>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.webp"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
                id="file-input"
              />
              <label
                htmlFor="file-input"
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 cursor-pointer inline-block"
              >
                Choose Files
              </label>
            </div>
          </div>

          {/* Selected files */}
          {selectedFiles.length > 0 && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Selected Files ({selectedFiles.length})</h3>
                <button
                  onClick={clearAllFiles}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-neutral-50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-neutral-900">{file.name}</p>
                        <p className="text-sm text-neutral-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Compression settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Compression Settings</h3>
            <div className="bg-neutral-50 rounded-xl p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Quality</label>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={compressionSettings.quality}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, quality: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                  <p className="text-sm text-neutral-500 mt-1">{compressionSettings.quality}%</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Max Width</label>
                  <select
                    value={compressionSettings.maxWidth}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, maxWidth: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={320}>320px (Small)</option>
                    <option value={480}>480px (Medium Small)</option>
                    <option value={640}>640px (Medium)</option>
                    <option value={800}>800px (Large)</option>
                    <option value={1024}>1024px (X-Large)</option>
                    <option value={1200}>1200px (XX-Large)</option>
                    <option value={1920}>1920px (Full HD)</option>
                    <option value={2560}>2560px (2K)</option>
                    <option value={3840}>3840px (4K)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Max Height</label>
                  <select
                    value={compressionSettings.maxHeight}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, maxHeight: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value={240}>240px (Small)</option>
                    <option value={360}>360px (Medium Small)</option>
                    <option value={480}>480px (Medium)</option>
                    <option value={600}>600px (Large)</option>
                    <option value={768}>768px (X-Large)</option>
                    <option value={800}>800px (XX-Large)</option>
                    <option value={1080}>1080px (Full HD)</option>
                    <option value={1440}>1440px (2K)</option>
                    <option value={2160}>2160px (4K)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-neutral-700 mb-2">Output Format</label>
                  <select
                    value={compressionSettings.format}
                    onChange={(e) => setCompressionSettings(prev => ({ ...prev, format: e.target.value }))}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="original">Keep Original</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Process button */}
          <div className="text-center mb-8">
            <button
              onClick={processFiles}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-8 py-4 rounded-xl font-semibold transition-colors duration-200 flex items-center gap-3 mx-auto"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2zm-2 0h12m-4 8h4m-4 4h4m-8-8h4m-4 4h4" />
                  </svg>
                  Compress Files
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {compressedFiles.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Compressed Files ({compressedFiles.length})</h3>
                <button
                  onClick={downloadAll}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download All
                </button>
              </div>
              <div className="space-y-4">
                {compressedFiles.map((result, index) => (
                  <div key={index} className="bg-neutral-50 rounded-xl p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Original</h4>
                        <p className="text-sm text-neutral-600 mb-1">{result.original.name}</p>
                        <p className="text-sm text-neutral-500">{formatFileSize(result.originalSize)}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-900 mb-2">Compressed</h4>
                        <p className="text-sm text-neutral-600 mb-1">compressed_{result.original.name}</p>
                        <p className="text-sm text-neutral-500">{formatFileSize(result.compressedSize)}</p>
                      </div>
                      <div className="flex flex-col justify-center">
                        <div className="text-center mb-3">
                          <span className="text-2xl font-bold text-green-600">{result.compressionRatio}%</span>
                          <p className="text-sm text-neutral-600">Size Reduced</p>
                        </div>
                        <button
                          onClick={() => downloadFile(result.compressed, result.original.name)}
                          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Usage instructions */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">How to Use</h3>
        <div className="grid md:grid-cols-4 gap-6 text-sm text-neutral-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">1</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Select Type</div>
              <div>Choose between Image or PDF compression</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">2</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Upload Files</div>
              <div>Drag and drop or click to select files</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">3</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Adjust Settings</div>
              <div>Customize compression quality and options</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">4</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Download</div>
              <div>Get your compressed files instantly</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = window.location.pathname;
  
  return (
    <div className="min-h-screen bg-neutral-50">
        <ScrollToTop />
        {/* 现代化导航栏 */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/50 shadow-soft">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo区域 */}
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors">ReseachBub</h1>
                    <p className="text-xs text-neutral-500">Scientific Research Platform</p>
                  </div>
                </Link>
              </div>

              {/* 导航菜单 */}
              <nav className="hidden md:flex items-center space-x-1">
                <button
                  className={`nav-button ${location === '/blog' ? 'active' : ''}`}
                  onClick={() => navigate('/blog')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                  Blog
                </button>
                <button
                  className={`nav-button ${location === '/iconbub' ? 'active' : ''}`}
                  onClick={() => navigate('/iconbub')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  IconBub
                </button>
                <button
                  className={`nav-button ${location === '/toolbub' ? 'active' : ''}`}
                  onClick={() => navigate('/toolbub')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ToolBub
                </button>
                <button
                  className={`nav-button ${location === '/softbub' ? 'active' : ''}`}
                  onClick={() => navigate('/softbub')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  SoftBub
                </button>
                <button
                  className={`nav-button ${location === '/about' ? 'active' : ''}`}
                  onClick={() => navigate('/about')}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About
                </button>
              </nav>


              {/* 移动端菜单按钮 */}
              <div className="md:hidden">
                <button className="btn-ghost p-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/iconbub" element={<IconBub />} />
          <Route path="/toolbub" element={<ToolBub />} />
          <Route path="/citation-tool" element={<CitationTool />} />
          <Route path="/unit-converter" element={<UnitConverter />} />
          <Route path="/file-compressor" element={<FileCompressor />} />
          <Route path="/watermark-tool" element={<WatermarkTool />} />
          <Route path="/pdf-tool" element={<PDFTool />} />
          <Route path="/word-counter" element={<WordCounter />} />
          <Route path="/image-converter" element={<ImageConverter />} />
          <Route path="/text-diff" element={<TextDiff />} />
          <Route path="/timer-tool" element={<TimerTool />} />
          <Route path="/softbub" element={<SoftBub />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/license" element={<License />} />
        </Routes>
      </div>
  );
} 