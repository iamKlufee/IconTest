import { useEffect } from 'react';

function SEOHead({ title, description, keywords, image, url, type = "website" }) {
  useEffect(() => {
    // Update document title
    document.title = title || "ReseachBub - Scientific Research Platform";
    
    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description || "ReseachBub provides 200+ free scientific icons, research tools, citation generators, unit converters, and educational resources for scientists, researchers, and academics worldwide.");
    updateMetaTag('keywords', keywords || "scientific icons, research tools, citation generator, unit converter, scientific visualization, biotechnology, laboratory equipment, academic resources, open source science, research platform");
    
    // Open Graph tags
    updateMetaTag('og:title', title || "ReseachBub - Scientific Research Platform", true);
    updateMetaTag('og:description', description || "Free scientific icons, research tools, and educational resources for scientists and researchers worldwide.", true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', url || window.location.href, true);
    updateMetaTag('og:image', image || "https://reseachbub.org/images/reseachbub-og-image.png", true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title || "ReseachBub - Scientific Research Platform");
    updateMetaTag('twitter:description', description || "Free scientific icons, research tools, and educational resources for scientists and researchers worldwide.");
    updateMetaTag('twitter:image', image || "https://reseachbub.org/images/reseachbub-og-image.png");
    
    // Canonical URL
    updateMetaTag('canonical', url || window.location.href);
    
    // Structured data for current page
    const structuredData = {
      "@context": "https://schema.org",
      "@type": type === "article" ? "Article" : "WebPage",
      "name": title || "ReseachBub - Scientific Research Platform",
      "description": description || "Free scientific icons, research tools, and educational resources for scientists and researchers worldwide.",
      "url": url || window.location.href,
      "publisher": {
        "@type": "Organization",
        "name": "ReseachBub",
        "url": "https://reseachbub.org/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://reseachbub.org/images/reseachbub-logo.png"
        }
      }
    };

    // Add author for articles
    if (type === "article") {
      structuredData.author = {
        "@type": "Person",
        "name": "Dr. GlauNee",
        "jobTitle": "Biotechnology Postdoctoral Researcher"
      };
    }

    // Remove existing structured data and add new one
    const existingScript = document.querySelector('script[data-seo="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [title, description, keywords, image, url, type]);

  return null; // This component doesn't render anything
}

export default SEOHead;
