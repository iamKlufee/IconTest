import { useState, useRef } from 'react';

function TextDiff() {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diffResult, setDiffResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showWhitespace, setShowWhitespace] = useState(true);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const textarea1Ref = useRef(null);
  const textarea2Ref = useRef(null);

  // Simple diff algorithm implementation
  const computeDiff = (text1, text2) => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    
    const diff = [];
    let i = 0, j = 0;
    
    while (i < lines1.length || j < lines2.length) {
      if (i >= lines1.length) {
        // Only text2 has content
        diff.push({ type: 'added', line: lines2[j], lineNumber: j + 1 });
        j++;
      } else if (j >= lines2.length) {
        // Only text1 has content
        diff.push({ type: 'removed', line: lines1[i], lineNumber: i + 1 });
        i++;
      } else if (lines1[i] === lines2[j]) {
        // Lines are identical
        diff.push({ type: 'unchanged', line: lines1[i], lineNumber: i + 1 });
        i++;
        j++;
      } else {
        // Lines are different - find the best match
        let found = false;
        for (let k = j + 1; k < Math.min(j + 10, lines2.length); k++) {
          if (lines1[i] === lines2[k]) {
            // Found a match later in text2
            for (let l = j; l < k; l++) {
              diff.push({ type: 'added', line: lines2[l], lineNumber: l + 1 });
            }
            diff.push({ type: 'unchanged', line: lines1[i], lineNumber: i + 1 });
            j = k + 1;
            i++;
            found = true;
            break;
          }
        }
        
        if (!found) {
          // Check if there's a match for text2[j] in text1
          let found2 = false;
          for (let k = i + 1; k < Math.min(i + 10, lines1.length); k++) {
            if (lines2[j] === lines1[k]) {
              // Found a match later in text1
              for (let l = i; l < k; l++) {
                diff.push({ type: 'removed', line: lines1[l], lineNumber: l + 1 });
              }
              diff.push({ type: 'unchanged', line: lines2[j], lineNumber: j + 1 });
              i = k + 1;
              j++;
              found2 = true;
              break;
            }
          }
          
          if (!found2) {
            // No match found, mark both as different
            diff.push({ type: 'removed', line: lines1[i], lineNumber: i + 1 });
            diff.push({ type: 'added', line: lines2[j], lineNumber: j + 1 });
            i++;
            j++;
          }
        }
      }
    }
    
    return diff;
  };

  // Character-level diff for highlighting within lines
  const computeCharDiff = (line1, line2) => {
    if (line1 === line2) return [{ type: 'unchanged', text: line1 }];
    
    const result = [];
    let i = 0, j = 0;
    
    while (i < line1.length || j < line2.length) {
      if (i >= line1.length) {
        result.push({ type: 'added', text: line2.substring(j) });
        break;
      } else if (j >= line2.length) {
        result.push({ type: 'removed', text: line1.substring(i) });
        break;
      } else if (line1[i] === line2[j]) {
        let unchanged = '';
        while (i < line1.length && j < line2.length && line1[i] === line2[j]) {
          unchanged += line1[i];
          i++;
          j++;
        }
        if (unchanged) {
          result.push({ type: 'unchanged', text: unchanged });
        }
      } else {
        // Find the next match
        let found = false;
        for (let k = j + 1; k < Math.min(j + 20, line2.length); k++) {
          if (line1[i] === line2[k]) {
            result.push({ type: 'added', text: line2.substring(j, k) });
            j = k;
            found = true;
            break;
          }
        }
        
        if (!found) {
          let found2 = false;
          for (let k = i + 1; k < Math.min(i + 20, line1.length); k++) {
            if (line2[j] === line1[k]) {
              result.push({ type: 'removed', text: line1.substring(i, k) });
              i = k;
              found2 = true;
              break;
            }
          }
          
          if (!found2) {
            result.push({ type: 'removed', text: line1[i] });
            result.push({ type: 'added', text: line2[j] });
            i++;
            j++;
          }
        }
      }
    }
    
    return result;
  };

  // Process text for comparison
  const processText = (text) => {
    if (!caseSensitive) {
      text = text.toLowerCase();
    }
    if (!showWhitespace) {
      text = text.replace(/\s+/g, ' ').trim();
    }
    return text;
  };

  // Compare texts
  const handleCompare = () => {
    if (!text1.trim() && !text2.trim()) {
      alert('Please enter text in at least one of the text areas');
      return;
    }

    setIsProcessing(true);
    
    try {
      const processedText1 = processText(text1);
      const processedText2 = processText(text2);
      
      const diff = computeDiff(processedText1, processedText2);
      
      // Add character-level diff for each line
      const enhancedDiff = diff.map(item => {
        if (item.type === 'unchanged') {
          return item;
        }
        
        const originalLine1 = text1.split('\n')[item.lineNumber - 1] || '';
        const originalLine2 = text2.split('\n')[item.lineNumber - 1] || '';
        
        if (item.type === 'removed') {
          return {
            ...item,
            charDiff: computeCharDiff(originalLine1, '')
          };
        } else if (item.type === 'added') {
          return {
            ...item,
            charDiff: computeCharDiff('', originalLine2)
          };
        }
        
        return item;
      });
      
      setDiffResult(enhancedDiff);
    } catch (error) {
      console.error('Comparison failed:', error);
      alert('Comparison failed: ' + error.message);
    }
    
    setIsProcessing(false);
  };

  // Clear all text
  const clearAll = () => {
    setText1('');
    setText2('');
    setDiffResult(null);
    if (textarea1Ref.current) textarea1Ref.current.focus();
  };

  // Copy text to clipboard
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Text copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text to clipboard');
    }
  };

  // Swap texts
  const swapTexts = () => {
    const temp = text1;
    setText1(text2);
    setText2(temp);
    setDiffResult(null);
  };

  // Get statistics
  const getStats = () => {
    if (!diffResult) return null;
    
    const added = diffResult.filter(item => item.type === 'added').length;
    const removed = diffResult.filter(item => item.type === 'removed').length;
    const unchanged = diffResult.filter(item => item.type === 'unchanged').length;
    
    return { added, removed, unchanged, total: diffResult.length };
  };

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Text Diff Tool</h1>
        <p className="text-gray-600">Compare two texts and highlight differences with detailed line-by-line and character-level analysis</p>
      </div>

      {/* Settings */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-700 mb-3">Comparison Settings</h3>
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => setCaseSensitive(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Case sensitive</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showWhitespace}
              onChange={(e) => setShowWhitespace(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show whitespace</span>
          </label>
        </div>
      </div>

      {/* Text Input Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-lg font-medium text-gray-700">Text 1</label>
            <button
              onClick={() => copyText(text1)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Copy
            </button>
          </div>
          <textarea
            ref={textarea1Ref}
            value={text1}
            onChange={(e) => setText1(e.target.value)}
            placeholder="Enter first text here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-lg font-medium text-gray-700">Text 2</label>
            <button
              onClick={() => copyText(text2)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Copy
            </button>
          </div>
          <textarea
            ref={textarea2Ref}
            value={text2}
            onChange={(e) => setText2(e.target.value)}
            placeholder="Enter second text here..."
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleCompare}
          disabled={isProcessing}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isProcessing ? 'Comparing...' : 'Compare Texts'}
        </button>
        <button
          onClick={swapTexts}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Swap Texts
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-3">Comparison Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.added}</div>
              <div className="text-sm text-green-700">Lines Added</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
              <div className="text-sm text-red-700">Lines Removed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.unchanged}</div>
              <div className="text-sm text-gray-700">Lines Unchanged</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-blue-700">Total Lines</div>
            </div>
          </div>
        </div>
      )}

      {/* Diff Results */}
      {diffResult && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Comparison Results</h3>
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
            <div className="font-mono text-sm">
              {diffResult.map((item, index) => (
                <div key={index} className="flex">
                  <div className="w-12 text-gray-400 text-right pr-2 select-none">
                    {item.lineNumber}
                  </div>
                  <div className="flex-1">
                    {item.type === 'unchanged' ? (
                      <span className="text-gray-300">{item.line}</span>
                    ) : item.type === 'removed' ? (
                      <span className="bg-red-900 text-red-200 px-1">
                        - {item.line}
                      </span>
                    ) : (
                      <span className="bg-green-900 text-green-200 px-1">
                        + {item.line}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Usage Instructions</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Text Comparison:</strong> Enter two texts in the text areas and click "Compare Texts" to see detailed differences.</p>
          <p><strong>Settings:</strong> Toggle case sensitivity and whitespace handling to customize the comparison behavior.</p>
          <p><strong>Line-by-Line Analysis:</strong> The tool shows added lines in green, removed lines in red, and unchanged lines in gray.</p>
          <p><strong>Statistics:</strong> View comprehensive statistics including the number of added, removed, and unchanged lines.</p>
          <p><strong>Privacy:</strong> All text processing happens locally in your browser. No data is sent to any server.</p>
        </div>
      </div>
    </div>
  );
}

export default TextDiff;
