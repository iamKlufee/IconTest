import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { loadAllBlogPosts, loadBlogPost } from './utils/markdownParser.jsx';

function IconBub() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 30;

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
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-scientific-dark">IconBub</h1>
        <p className="text-gray-600 mt-1">Browse scientific icons. 30 per page.</p>
      </div>

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
        {paginatedIcons.map(icon => (
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

      {/* Pagination Controls */}
      {searchedIcons.length > 0 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <span className="text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}

function Home() {
  const [icons, setIcons] = useState([]);
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
      })
      .catch(() => setIcons([]));
  }, [base]);

  const featuredIcons = icons.slice(0, 10);

  const recommendedSoftware = [
    { name: 'ImageJ', desc: 'Open-source image analysis', link: '/softbub' },
    { name: 'R', desc: 'Statistical computing', link: '/softbub' },
    { name: 'Python', desc: 'Scientific computing', link: '/softbub' },
    { name: 'Blender', desc: '3D visualization', link: '/softbub' },
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero */}
      <section className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-scientific-dark mb-4">ResearchBub</h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          A curated hub for scientific resources: icons, software, and tools to accelerate your research.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/iconbub" className="px-5 py-2 bg-scientific-blue text-white rounded-lg hover:bg-blue-600">Explore Icons</Link>
          <Link to="/softbub" className="px-5 py-2 bg-gray-100 text-scientific-dark rounded-lg hover:bg-gray-200">Explore Software</Link>
        </div>
      </section>

      {/* Featured Icons */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-semibold text-scientific-dark">Featured Icons</h2>
          <Link to="/iconbub" className="text-scientific-blue hover:underline">View all</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {featuredIcons.map(icon => (
            <div key={icon.id} className="p-4 bg-white rounded shadow-sm">
              <img src={icon.imageUrl} alt={icon.name} className="w-full h-20 object-contain" />
              <p className="mt-2 text-sm text-center text-gray-700 truncate">{icon.name}</p>
            </div>
          ))}
          {featuredIcons.length === 0 && (
            <p className="text-gray-600">No icons to show yet.</p>
          )}
        </div>
      </section>

      {/* Recommended Software */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-semibold text-scientific-dark">Recommended Software</h2>
          <Link to="/softbub" className="text-scientific-blue hover:underline">View more</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedSoftware.map(item => (
            <Link key={item.name} to={item.link} className="block bg-white rounded-lg p-4 border hover:shadow">
              <h3 className="font-semibold text-scientific-dark">{item.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
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
        <h3 className="text-2xl font-bold mb-4 text-scientific-dark">Software and Licensing</h3>
        <p className="mb-4 text-gray-700">This website offers a curated collection of links to open-source and free software that we believe are valuable to researchers. We do not host or distribute these software packages ourselves. All software, icons, and trademarks are the property of their respective owners.</p>
        <p className="mb-4 text-gray-700">The software we list includes a mix of open-source and proprietary tools that are free for academic use. Before using any of the software listed on this site, you must visit its official website to review and comply with the specific license agreement.</p>
        <p className="mb-4 text-gray-700">If you believe any software listed here infringes upon a copyright or license, please contact me immediately, and I will remove it without delay.</p>
      </div>

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
        Explore essential software for researchers and educators. This collection includes both powerful open-source tools and proprietary software that's free for academic or personal use.
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
          className="mb-6 flex items-center text-scientific-blue hover:text-blue-700 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </button>
        
        {/* Article Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-scientific-dark mb-4">{selectedPost.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600 mb-6">
            <span>By {selectedPost.author}</span>
            <span>•</span>
            <span>{selectedPost.date}</span>
            <span>•</span>
            <span>{selectedPost.readTime}</span>
            <span>•</span>
            <span className="px-3 py-1 bg-scientific-blue text-white text-sm rounded-full">
              {selectedPost.category}
            </span>
          </div>
        </div>

        {/* Featured Image */}
        {selectedPost.image && (
          <div className="mb-8">
            <img 
              src={selectedPost.image} 
              alt={selectedPost.title}
              className="w-full h-64 object-cover rounded-lg shadow-md" 
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
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-scientific-dark mb-4">Research Blog</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Practical tutorials and guides for researchers and educators. Learn about useful tools 
          and techniques to enhance your research workflow.
        </p>
      </div>

      {/* Featured Post */}
      {blogPosts.filter(post => post.featured === 'true' || post.featured === true).map(post => (
        <div key={post.filename} className="mb-12">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/3">
                <img 
                  src={post.image || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"} 
                  alt={post.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-2/3 p-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-scientific-blue text-white text-sm rounded-full">
                    {post.category}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>
                <h2 className="text-2xl font-bold text-scientific-dark mb-4">{post.title}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>By {post.author}</span>
                    <span>•</span>
                    <span>{post.date}</span>
                  </div>
                  <button
                    onClick={() => handlePostClick(post)}
                    className="px-6 py-2 bg-scientific-blue text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* All Posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogPosts.map(post => (
          <div key={post.filename} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <img 
              src={post.image || "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"} 
              alt={post.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  {post.category}
                </span>
                <span className="text-xs text-gray-500">{post.readTime}</span>
              </div>
              <h3 className="text-lg font-semibold text-scientific-dark mb-3 line-clamp-2">{post.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {post.date} • {post.author}
                </div>
                <button
                  onClick={() => handlePostClick(post)}
                  className="text-scientific-blue hover:text-blue-700 text-sm font-medium transition-colors"
                >
                  Read More →
                </button>
              </div>
            </div>
          </div>
        ))}
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
              <Link to="/" className="text-3xl font-bold text-scientific-dark hover:text-scientific-blue transition-colors">
                ReseachBub
              </Link>
              <p className="text-gray-600 mt-1">Scientific Resources for Research & Education</p>
            </div>
            <div className="flex space-x-3">
              <button
                className="px-4 py-2 bg-gray-100 text-scientific-dark rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
                onClick={() => navigate('/blog')}
              >
                Blog
              </button>
              <button
                className="px-4 py-2 bg-gray-100 text-scientific-dark rounded-lg hover:bg-gray-200 transition-colors font-medium shadow-sm"
                onClick={() => navigate('/iconbub')}
              >
                IconBub
              </button>
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
        <Route path="/blog" element={<Blog />} />
        <Route path="/iconbub" element={<IconBub />} />
        <Route path="/softbub" element={<SoftBub />} />
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
              High-quality scientific resources for research and educational purposes
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
} 