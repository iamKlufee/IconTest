// Markdown parser utility for blog posts
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

// Parse frontmatter from markdown content
export function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);
  
  if (!match) {
    return {
      metadata: {},
      content: content
    };
  }
  
  const frontmatterText = match[1];
  const markdownContent = match[2];
  
  // Parse YAML-like frontmatter
  const metadata = {};
  frontmatterText.split('\n').forEach(line => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.substring(0, colonIndex).trim();
      let value = line.substring(colonIndex + 1).trim();
      
      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) || 
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      
      metadata[key] = value;
    }
  });
  
  return {
    metadata,
    content: markdownContent
  };
}

// Parse markdown content to React components
export function parseMarkdown(content) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeHighlight]}
      components={{
        h1: ({node, ...props}) => <h1 className="text-4xl font-bold text-scientific-dark mb-6" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-scientific-dark mt-8 mb-4" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-scientific-dark mt-6 mb-3" {...props} />,
        h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-scientific-dark mt-4 mb-2" {...props} />,
        p: ({node, ...props}) => <p className="mb-4 leading-relaxed text-gray-700" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-2 ml-4 mb-4" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-2 ml-4 mb-4" {...props} />,
        li: ({node, ...props}) => <li className="mb-2" {...props} />,
        a: ({node, ...props}) => <a className="text-scientific-blue hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer" {...props} />,
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-scientific-blue pl-4 italic text-gray-600 my-6" {...props} />,
        code: ({node, inline, ...props}) => {
          if (inline) {
            return <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono" {...props} />;
          }
          return <code className="block bg-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto" {...props} />;
        },
        pre: ({node, ...props}) => <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto" {...props} />,
        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
        em: ({node, ...props}) => <em className="italic" {...props} />,
        hr: ({node, ...props}) => <hr className="my-8 border-gray-300" {...props} />,
        table: ({node, ...props}) => <table className="w-full border-collapse border border-gray-300 my-6" {...props} />,
        th: ({node, ...props}) => <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold" {...props} />,
        td: ({node, ...props}) => <td className="border border-gray-300 px-4 py-2" {...props} />,
        img: ({node, ...props}) => {
          // Ensure image path is correct by handling BASE_URL
          const base = import.meta.env.BASE_URL || '';
          const src = props.src.startsWith('/') ? `${base}${props.src.slice(1)}` : props.src;
          
          return (
            <img 
              className="rounded-lg shadow-md my-6 w-full" 
              loading="lazy"
              src={src}
              onError={(e) => {
                e.target.style.display = 'none';
                console.warn(`Failed to load image: ${src}`);
              }}
              {...props} 
            />
          );
        },
        center: ({node, ...props}) => <div className="text-center text-sm text-gray-600 italic my-2" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

// Load markdown file content
export async function loadMarkdownFile(filename) {
  try {
    // Get base path for proper URL construction
    const base = import.meta.env.BASE_URL || '';
    const response = await fetch(`${base}blog-posts/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}`);
    }
    const content = await response.text();
    return content;
  } catch (error) {
    console.error('Error loading markdown file:', error);
    return null;
  }
}

// Get all available blog post files
export async function getBlogPostFiles() {
  try {
      // In a real application, you might have an API endpoint that lists available files
  // For now, we'll return a hardcoded list based on what we know exists
  return [
    'Apply-fusion360.md',
    'HowToFindPI.md',
    'Reference_Management_Software_Improved.md'
  ];
  } catch (error) {
    console.error('Error getting blog post files:', error);
    return [];
  }
}

// Load and parse a blog post
export async function loadBlogPost(filename) {
  const content = await loadMarkdownFile(filename);
  if (!content) {
    return null;
  }
  
  const { metadata, content: markdownContent } = parseFrontmatter(content);
  
  return {
    filename,
    ...metadata,
    content: markdownContent,
    parsedContent: parseMarkdown(markdownContent)
  };
}

// Load all blog posts
export async function loadAllBlogPosts() {
  const files = await getBlogPostFiles();
  const posts = [];
  
  for (const file of files) {
    const post = await loadBlogPost(file);
    if (post) {
      posts.push(post);
    }
  }
  
  // Sort by date (newest first)
  return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
}
