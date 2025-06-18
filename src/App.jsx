import { useEffect, useState } from 'react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all unique categories
  const categories = ['All', ...new Set(icons.map(icon => icon.category))];

  // Filter icons
  const filteredIcons =
    activeCategory === 'All'
      ? icons
      : icons.filter(icon => icon.category === activeCategory);

  useEffect(() => {
    // Load icon data from public/icons/metadata.json
    fetch('/IconBub/icons/metadata.json')
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
          imageUrl: `/IconBub/icons/${item.filename}`,
        }));
        setIcons(fullData);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

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
    <div className="min-h-screen bg-scientific-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-scientific-dark">SciIcon Repository</h1>
              <p className="text-gray-600 mt-1">Scientific Icon Resources for Research & Education</p>
            </div>
            <button className="px-6 py-3 bg-scientific-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm">
              Upload Icon
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
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

        {/* Icons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredIcons.map(icon => (
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

        {filteredIcons.length === 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-gray-600 text-lg">No icons found in this category.</p>
            <p className="text-gray-500 text-sm mt-2">Try selecting a different category or upload new icons.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              © 2025 SciIcon Repository. All rights reserved.
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