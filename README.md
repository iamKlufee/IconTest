# IconBub - Scientific Icons and Resources

A comprehensive platform providing high-quality scientific icons, software recommendations, and research tools for academics and researchers.

## Features

### 🎯 IconBub
- **Extensive Icon Library**: Over 100+ scientific and laboratory icons in SVG format
- **Easy Download**: One-click download for all icons
- **Category Organization**: Icons organized by scientific disciplines
- **Search Functionality**: Find icons quickly by name or category
- **Responsive Design**: Works seamlessly on all devices

### 💻 SoftBub
- **Software Collection**: Curated list of essential research software
- **Open Source Focus**: Emphasis on free and open-source tools
- **Platform Support**: Windows, macOS, and Linux compatibility
- **Detailed Information**: Download links, descriptions, and licensing details

### 📝 Blog
- **Research Tips**: Practical tutorials and guides for researchers
- **Tool Reviews**: In-depth analysis of scientific software and tools
- **Best Practices**: Industry insights and workflow optimization tips
- **Regular Updates**: New content added regularly

### 🏠 Home
- **Featured Icons**: Highlighted icons from the collection
- **Quick Access**: Direct links to all platform sections
- **Overview**: Platform introduction and navigation

## Recent Blog Posts

### How to Use Zotero Plugin to Insert References in Word
A comprehensive guide on using Zotero plugin to automatically insert and format citations in Microsoft Word documents for academic writing. Learn step-by-step installation, configuration, and advanced features to streamline your research writing process.

**Topics Covered:**
- Installation and setup
- Word plugin configuration
- Reference management
- Citation insertion
- Bibliography generation
- Advanced features and troubleshooting

## Getting Started

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd IconBub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## Technology Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Custom SVG icons optimized for scientific use
- **Deployment**: Cloudflare Pages ready

## Project Structure

```
IconBub/
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.css        # Global styles and Tailwind config
│   └── main.jsx         # Application entry point
├── public/
│   └── icons/           # SVG icon files
├── docs/                # Built files for deployment
├── tailwind.config.js   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## Available Routes

- `/` - Home page with featured content
- `/iconbub` - Icon browsing and download
- `/softbub` - Software recommendations
- `/blog` - Research blog and tutorials
- `/about` - Platform information and licensing

## Icon Categories

- **Laboratory Equipment**: Microscopes, centrifuges, pipettes
- **Glassware**: Beakers, flasks, test tubes
- **Safety Equipment**: Lab coats, gloves, safety cabinets
- **Measurement Tools**: Scales, pH meters, thermometers
- **Research Tools**: Cell counters, flow cytometers, spectrometers

## Contributing

We welcome contributions to improve the platform:

1. **Icon Submissions**: Submit new scientific icons
2. **Software Recommendations**: Suggest useful research tools
3. **Blog Content**: Contribute tutorials and guides
4. **Bug Reports**: Report issues or suggest improvements

## License

### Icons
- **Non-commercial use**: Free for academic and educational purposes
- **Commercial use**: Requires explicit permission
- **Redistribution**: Not allowed without permission

### Software
- Links to external software with their respective licenses
- No software distribution on this platform

## Contact

For questions, suggestions, or licensing inquiries:
- **Email**: support@reseachbub.org
- **Website**: [reseachbub.org](https://reseachbub.org)

## Development

### Building for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Linting
```bash
npm run lint
```

## Deployment

The project is configured for Cloudflare Pages deployment with automatic builds from the main branch.

---

**Built with ❤️ for the scientific community**
