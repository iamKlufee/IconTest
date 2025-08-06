import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';

function Home() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

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
      
      // Clean up the blob URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to original method
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

      {/* Search Box */}
      <div className="mb-8 flex justify-end">
        <input
          type="text"
          placeholder="Search icon names or categories..."
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
              <button
                onClick={() => handleDownload(icon)}
                className="download-button w-full"
              >
                Download SVG
              </button>
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
          <p className="text-gray-600 text-lg">No icons found matching your criteria.</p>
          <p className="text-gray-500 text-sm mt-2">Try selecting a different category or modifying your search terms.</p>
        </div>
      )}
    </main>
  );
}

function About() {
  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-4 text-scientific-dark">About ReseachBub</h2>
      <p className="mb-4 text-gray-700">Hello, I'm GlauNee, the creator of this website.</p>
      <p className="mb-4 text-gray-700">As a postdoctoral researcher in Biotechnology filed with over 12 years of lab experience, I know firsthand how much time and effort goes into preparing compelling figures for slides and papers. The process can be a huge time sink, pulling focus away from the actual research. That's why I created this website—to make it easier for fellow researchers to create powerful scientific presentations, seminars, and publications.</p>
      <p className="mb-4 text-gray-700">A Note on the Name...</p>
      <p className="mb-4 text-gray-700">You might have noticed the unusual spelling of our domain name. I originally intended to register "ResearchBub" but accidentally missed the 'R' and ended up with ReseachBub. Due to a limited budget, I decided to embrace the typo and stick with this quirky name. My hope is that despite the small spelling error, this site can still be a valuable hub for your research needs.</p>
      <p className="mb-4 text-gray-700">The icons you'll find here are ones I created for my own work over the years. I hope they prove helpful to you and save you a little time on your journey.</p>
      
      <div className="mt-12 pt-8 border-t border-gray-200">
        <h3 className="text-2xl font-bold mb-4 text-scientific-dark">Icon License</h3>
        <p className="mb-4 text-gray-700">All icons on this website are copyrighted by the site owner unless otherwise specified.</p>
        
        <h4 className="text-lg font-semibold mb-2 text-scientific-dark">Permitted Use (Free for Non-Commercial Purposes):</h4>
        <p className="mb-4 text-gray-700">You are welcome to use these icons for any academic and educational projects, including:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
          <li>Academic research and papers</li>
          <li>Educational materials and presentations</li>
          <li>University seminars and talks</li>
          <li>Student projects and theses</li>
        </ul>
        
        <h4 className="text-lg font-semibold mb-2 text-scientific-dark">Prohibited Use (Strictly Not Allowed):</h4>
        <p className="mb-4 text-gray-700">The use of these icons is strictly prohibited in any commercial context. This includes, but is not limited to:</p>
        <ul className="list-disc list-inside mb-4 text-gray-700 space-y-1">
          <li>Business websites and social media</li>
          <li>Advertisements and marketing materials</li>
          <li>Product packaging and branding</li>
          <li>Corporate projects and apps</li>
        </ul>
        
        <h4 className="text-lg font-semibold mb-2 text-scientific-dark">Additional Terms:</h4>
        <p className="mb-4 text-gray-700">Redistribution, resale, or inclusion of these icons in any download platform or package without explicit permission is strictly prohibited.</p>
        <p className="mb-4 text-gray-700">For commercial licensing or special use cases, please contact me at: [support@reseachbub.org].</p>
        <p className="text-gray-700">The website owner reserves the right to interpret these terms of use.</p>
      </div>
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