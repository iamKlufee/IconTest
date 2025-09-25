import { useState, useRef } from 'react';

function WordCounter() {
  const [text, setText] = useState('');
  const [stats, setStats] = useState({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    readingTime: 0
  });
  const textareaRef = useRef(null);

  // Calculate text statistics
  const calculateStats = (inputText) => {
    if (!inputText.trim()) {
      setStats({
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        readingTime: 0
      });
      return;
    }

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    const words = inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    const paragraphs = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    
    // Average reading speed: 200 words per minute
    const readingTime = Math.ceil(words / 200);

    setStats({
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      readingTime
    });
  };

  // Handle text input
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    calculateStats(newText);
  };

  // Clear text
  const clearText = () => {
    setText('');
    setStats({
      characters: 0,
      charactersNoSpaces: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTime: 0
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Copy text to clipboard
  const copyText = async () => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard');
    }
  };

  // Download text as file
  const downloadText = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'text-content.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Word Counter</h1>
        <p className="text-gray-600">Count words, characters, sentences, and paragraphs in your text with detailed statistics</p>
      </div>

      {/* Text Input Area */}
      <div className="mb-6">
        <div className="mb-4">
          <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your text below:
          </label>
          <textarea
            ref={textareaRef}
            id="text-input"
            value={text}
            onChange={handleTextChange}
            placeholder="Type or paste your text here to start counting words, characters, and more..."
            className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <button
            onClick={clearText}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Clear Text
          </button>
          <button
            onClick={copyText}
            disabled={!text.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
          >
            Copy Text
          </button>
          <button
            onClick={downloadText}
            disabled={!text.trim()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors"
          >
            Download as TXT
          </button>
        </div>
      </div>

      {/* Statistics Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-blue-500 mr-3">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{stats.characters}</p>
              <p className="text-sm text-blue-700">Characters</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-green-500 mr-3">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.charactersNoSpaces}</p>
              <p className="text-sm text-green-700">Characters (no spaces)</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-purple-500 mr-3">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{stats.words}</p>
              <p className="text-sm text-purple-700">Words</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-orange-500 mr-3">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.sentences}</p>
              <p className="text-sm text-orange-700">Sentences</p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-red-500 mr-3">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{stats.paragraphs}</p>
              <p className="text-sm text-red-700">Paragraphs</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg">
          <div className="flex items-center">
            <div className="text-indigo-500 mr-3">
              <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">{stats.readingTime}</p>
              <p className="text-sm text-indigo-700">Minutes to read</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-3">Text Analysis Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Character Count:</strong> Total number of characters including spaces, punctuation, and special characters.</p>
            <p><strong>Character Count (no spaces):</strong> Total number of characters excluding spaces.</p>
            <p><strong>Word Count:</strong> Number of words separated by whitespace.</p>
          </div>
          <div>
            <p><strong>Sentence Count:</strong> Number of sentences ending with periods, exclamation marks, or question marks.</p>
            <p><strong>Paragraph Count:</strong> Number of paragraphs separated by double line breaks.</p>
            <p><strong>Reading Time:</strong> Estimated time to read the text at 200 words per minute.</p>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Usage Instructions</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Real-time Analysis:</strong> Statistics update automatically as you type or paste text.</p>
          <p><strong>Copy & Download:</strong> Use the buttons to copy text to clipboard or download as a text file.</p>
          <p><strong>Multiple Formats:</strong> Works with any text format including plain text, markdown, and code.</p>
          <p><strong>Privacy:</strong> All text processing happens locally in your browser. No data is sent to any server.</p>
        </div>
      </div>
    </div>
  );
}

export default WordCounter;
