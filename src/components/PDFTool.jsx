import { useState, useRef, useEffect } from 'react';
import { GlobalWorkerOptions, getDocument, version as pdfjsVersion } from 'pdfjs-dist';
// Use Vite worker plugin to load PDF.js worker
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&url';
import { PDFDocument } from 'pdf-lib';

// Configure PDF.js worker (Vite-friendly)
GlobalWorkerOptions.workerSrc = pdfjsWorker;

function PDFTool() {
  const [activeTab, setActiveTab] = useState('split');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const [splitPages, setSplitPages] = useState([]);
  const [pdfInfo, setPdfInfo] = useState({});
  const fileInputRef = useRef(null);

  // 处理文件选择
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Please select PDF files only');
      return;
    }
    
    setSelectedFiles(pdfFiles);
    setProcessedFiles([]);
    
    // 获取PDF信息
    loadPdfInfo(pdfFiles);
  };

  // 拖拽处理
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== files.length) {
      alert('Please select PDF files only');
      return;
    }
    
    setSelectedFiles(pdfFiles);
    setProcessedFiles([]);
    
    // 获取PDF信息
    loadPdfInfo(pdfFiles);
  };

  // 加载PDF信息
  const loadPdfInfo = async (files) => {
    const info = {};
    for (const file of files) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await getDocument({ data: arrayBuffer }).promise;
        
        info[file.name] = {
          pageCount: pdf.numPages,
          title: pdf.info?.Title || 'Unknown',
          author: pdf.info?.Author || 'Unknown'
        };
      } catch (error) {
        console.error(`Failed to load PDF info for ${file.name}:`, error);
        info[file.name] = { pageCount: 0, title: 'Error', author: 'Error' };
      }
    }
    setPdfInfo(info);
  };


  // PDF Split Function
  const handleSplit = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select PDF files first');
      return;
    }

    if (splitPages.length === 0) {
      alert('Please set split page numbers');
      return;
    }

    setIsProcessing(true);
    const results = [];

    for (const file of selectedFiles) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const totalPages = pdfDoc.getPageCount();

        // Validate split page numbers
        const validPages = splitPages
          .map(page => parseInt(page))
          .filter(page => page > 0 && page <= totalPages)
          .sort((a, b) => a - b);

        if (validPages.length === 0) {
          alert(`File ${file.name} has no valid split page numbers`);
          continue;
        }

        // Create separate PDF for each split point
        for (let i = 0; i < validPages.length; i++) {
          const splitDoc = await PDFDocument.create();
          const startPage = i === 0 ? 0 : validPages[i - 1];
          const endPage = validPages[i];
          
          // Copy page range
          const pageIndices = Array.from({ length: endPage - startPage }, (_, idx) => startPage + idx);
          const copiedPages = await splitDoc.copyPages(pdfDoc, pageIndices);
          
          // Add pages to split document
          copiedPages.forEach(page => splitDoc.addPage(page));
          
          const pdfBytes = await splitDoc.save();
          const splitFile = new File([pdfBytes], `split_${i + 1}_${file.name}`, { type: 'application/pdf' });

          results.push({
            originalFile: file,
            processedFile: splitFile,
            originalSize: file.size,
            processedSize: splitFile.size,
            splitRange: `${startPage + 1}-${endPage}`,
            splitIndex: i + 1
          });
        }
      } catch (error) {
        console.error('Split failed:', error);
        alert(`Failed to split file ${file.name}: ${error.message}`);
      }
    }

    setProcessedFiles(results);
    setIsProcessing(false);
  };

  // PDF Merge Function
  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      alert('Merge requires at least 2 PDF files');
      return;
    }

    setIsProcessing(true);
    const results = [];

    try {
      const mergedPdf = await PDFDocument.create();
      let totalOriginalSize = 0;

      for (const file of selectedFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        totalOriginalSize += file.size;

        // Get all page indices
        const pageIndices = Array.from({ length: pdfDoc.getPageCount() }, (_, i) => i);
        const copiedPages = await mergedPdf.copyPages(pdfDoc, pageIndices);
        
        // Add pages to merged document
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const mergedFile = new File([pdfBytes], 'merged_document.pdf', { type: 'application/pdf' });

      results.push({
        originalFiles: selectedFiles,
        processedFile: mergedFile,
        originalSize: totalOriginalSize,
        processedSize: mergedFile.size,
        mergedCount: selectedFiles.length
      });
    } catch (error) {
      console.error('Merge failed:', error);
      alert(`Merge failed: ${error.message}`);
    }

    setProcessedFiles(results);
    setIsProcessing(false);
  };

  // Download processed file
  const handleDownload = (processedFile) => {
    const url = URL.createObjectURL(processedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = processedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Clear files
  const clearFiles = () => {
    setSelectedFiles([]);
    setProcessedFiles([]);
    setSplitPages([]);
    setPdfInfo({});
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">PDF Tool</h1>
        <p className="text-gray-600">PDF processing tool based on PDF.js and pdf-lib, supporting split and merge functionality</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'split', label: 'Split' },
          { id: 'merge', label: 'Merge' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* File Upload Area */}
      <div className="mb-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Click or drag PDF files here
          </p>
          <p className="text-sm text-gray-500">
            Supports multiple file upload, PDF format only
          </p>
        </div>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Selected Files:</h3>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-red-500">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)}
                        {pdfInfo[file.name] && (
                          <span className="ml-2 text-blue-600">
                            ({pdfInfo[file.name].pageCount} pages)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newFiles = selectedFiles.filter((_, i) => i !== index);
                      setSelectedFiles(newFiles);
                      const newInfo = { ...pdfInfo };
                      delete newInfo[file.name];
                      setPdfInfo(newInfo);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-4 flex space-x-3">
              <button
                onClick={clearFiles}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear Files
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Function Settings Area */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          {activeTab === 'split' && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Split Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Split Page Numbers (comma separated, e.g., 5,10,15)
                  </label>
                  <input
                    type="text"
                    value={splitPages.join(',')}
                    onChange={(e) => setSplitPages(e.target.value.split(',').map(p => p.trim()))}
                    placeholder="5,10,15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter page numbers where you want to split the PDF. Each split point will generate a separate PDF file.
                  </p>
                </div>
                <button
                  onClick={handleSplit}
                  disabled={isProcessing}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  {isProcessing ? 'Splitting...' : 'Start Split'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'merge' && (
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Merge Settings</h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  PDF files will be merged in the order they were selected.
                </p>
                <button
                  onClick={handleMerge}
                  disabled={isProcessing}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  {isProcessing ? 'Merging...' : 'Start Merge'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Processing Results */}
      {processedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Processing Results</h3>
          <div className="space-y-4">
            {processedFiles.map((result, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                {activeTab === 'split' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-green-500">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">{result.processedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          Page Range: {result.splitRange}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(result.processedFile)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                )}

                {activeTab === 'merge' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-green-500">
                        <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">merged_document.pdf</p>
                        <p className="text-sm text-gray-500">
                          Merged {result.mergedCount} files
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDownload(result.processedFile)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Download
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Usage Instructions</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Split Function:</strong> Split PDF at specified page numbers into multiple separate files. Each split point generates a separate PDF file.</p>
          <p><strong>Merge Function:</strong> Merge multiple PDF files into one document in the order they were selected, maintaining all formats and styles.</p>
          <p><strong>Technical Advantages:</strong> Combines PDF.js and pdf-lib technologies to provide powerful PDF processing capabilities with page count information display.</p>
          <p><strong>Privacy & Security:</strong> All processing is done locally in your browser. Files are never uploaded to any server, ensuring complete privacy.</p>
        </div>
      </div>
    </div>
  );
}

export default PDFTool;