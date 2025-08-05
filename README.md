# ReseachBub

A clean, minimalist website for hosting scientific icon resources with a focus on laboratory equipment and glassware. Built as a static site for easy deployment on GitHub Pages.

## Features

- 🧪 **Scientific Aesthetic**: Clean, professional design inspired by scientific research
- 📂 **Category Organization**: Icons organized by categories (Laboratory Glassware, Laboratory Equipment, Microscopy, Laboratory Tools)
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- ⬇️ **Easy Downloads**: One-click SVG downloads for all icons
- 🔍 **Search Functionality**: Search icons by name or category
- 🎨 **Modern UI**: Built with React and Tailwind CSS for a polished look
- 🚀 **Static Site**: Ready for GitHub Pages deployment

## Icon Categories

- **Laboratory Glassware**: Beakers, flasks, graduated cylinders, test tubes, volumetric flasks
- **Laboratory Equipment**: Centrifuge tubes, Petri dishes, incubators, digital scales
- **Microscopy**: Optical microscopes, SEM, electron microscopes
- **Laboratory Tools**: Pipettes, syringes, scalpels, tweezers

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/iamKlufee/ReseachBub.git
cd ReseachBub
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To build the static site for deployment:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Adding New Icons

1. Place your SVG files in the `public/icons/` directory
2. Update the `public/icons/metadata.json` file with the new icon information:

```json
{
  "id": 10,
  "name": "Your Icon Name",
  "filename": "your-icon.svg",
  "category": "Your Category",
  "description": "Description of your icon",
  "downloads": 0,
  "tags": ["tag1", "tag2", "tag3"]
}
```

3. The website will automatically load the new icons on the next build

## Deployment

### GitHub Pages

1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Set the source to "GitHub Actions"
4. The `.github/workflows/deploy.yml` file is already configured for automatic deployment

5. Your site will be available at `https://iamKlufee.github.io/ReseachBub/`

### Other Static Hosting

The built files in the `dist` directory can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- Firebase Hosting

## Project Structure

```
ReseachBub/
├── public/
│   └── icons/
│       ├── metadata.json
│       ├── beaker.svg
│       ├── flask.svg
│       └── ... (other SVG files)
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## Customization

### Styling

The website uses Tailwind CSS for styling. You can customize the appearance by modifying:
- `src/index.css` - Custom CSS classes and Tailwind imports
- `tailwind.config.js` - Tailwind configuration and custom colors

### Colors

The scientific theme uses these custom colors:
- `scientific-blue`: #1e40af
- `scientific-gray`: #f8fafc
- `scientific-dark`: #1e293b

### Adding Categories

To add new categories, simply include them in the `category` field of your icon metadata. The website will automatically generate category filters.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add your icons and update metadata
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## About

Created by GlauFee, a postdoctoral researcher in Biomedical Engineering with over 12 years of lab experience. This website aims to help fellow researchers create compelling scientific presentations and publications by providing high-quality, free scientific icons.

## Acknowledgments

- Inspired by scientific research and laboratory aesthetics
- Built with modern web technologies for optimal performance
- Designed for easy maintenance and scalability 