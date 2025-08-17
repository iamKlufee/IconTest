import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';

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
      <p className="mb-4 text-gray-700">As a postdoctoral researcher in Biotechnology filed with over 20 years of lab experience, I know firsthand how much time and effort goes into preparing compelling figures for slides and papers. The process can be a huge time sink, pulling focus away from the actual research. That's why I created this website—to make it easier for fellow researchers to create powerful scientific presentations, seminars, and publications.</p>
      <p className="mb-4 text-gray-700">This website is more than just a resource; it's a Research Bubble. A shared space where we can find high-quality scientific icons and more. Beyond just icons, I'm committed to curating other useful open-source resources for the scientific community, from software and templates to tools that can make your work more efficient. My goal is to gather these valuable assets into one convenient bubble, so you can spend less time searching and more time advancing your research.</p>
      <p className="mb-4 text-gray-700">Hope this helps everyone!</p>
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

function SoftBub() {
  const [softwareList, setSoftwareList] = useState([
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
    }
  ]);

  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-scientific-dark mb-4">SoftBub</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Curated collection of open-source scientific software, providing researchers with the most suitable tools
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-scientific-dark mb-4">Software Categories</h2>
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
          placeholder="Search software names, descriptions, or categories..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-scientific-blue"
          style={{ minWidth: 280 }}
        />
      </div>

      {/* Software Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {searchedSoftware.map(software => (
          <div key={software.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            {/* Software Icon and Title */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-3">{software.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold text-scientific-dark">{software.name}</h3>
                  <span className="inline-block px-2 py-1 bg-scientific-blue text-white text-xs rounded-full">
                    {software.category}
                  </span>
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{software.description}</p>
            </div>

            {/* Software Information */}
            <div className="p-6 bg-gray-50">
              {/* Platform Support */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Supported Platforms</h4>
                <div className="flex flex-wrap gap-2">
                  {software.platforms.map(platform => (
                    <span key={platform} className="px-2 py-1 bg-white text-xs text-gray-600 rounded border">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>

              {/* License */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">License</h4>
                <span className="text-sm text-gray-600">{software.license}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <a
                  href={software.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-scientific-blue text-white text-center py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 font-medium"
                >
                  Download
                </a>
                <a
                  href={software.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gray-100 text-scientific-dark text-center py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Website
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {searchedSoftware.length === 0 && (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">No software found matching your criteria</p>
          <p className="text-gray-500 text-sm mt-2">Try selecting a different category or modifying your search terms</p>
        </div>
      )}
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
              <Link to="/" className="text-3xl font-bold text-scientific-dark hover:text-scientific-blue transition-colors">
                ReseachBub
              </Link>
              <p className="text-gray-600 mt-1">Scientific Icon Resources for Research & Education</p>
            </div>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-scientific-dark rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
                onClick={() => navigate('/softbub')}
              >
                SoftBub
              </button>
              <button
                className="px-4 py-2 bg-gray-100 text-scientific-dark rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
                onClick={() => navigate('/about')}
              >
                About
              </button>
            </div>
          </div>
        </div>
      </header>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/softbub" element={<SoftBub />} />
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