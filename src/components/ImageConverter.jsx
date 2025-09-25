import { useState, useRef } from 'react';

function ImageConverter() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [targetFormat, setTargetFormat] = useState('jpeg');
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedFiles, setProcessedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // Supported formats
  const supportedFormats = [
    { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', extension: 'jpg' },
    { value: 'png', label: 'PNG', mimeType: 'image/png', extension: 'png' },
    { value: 'webp', label: 'WebP', mimeType: 'image/webp', extension: 'webp' },
    { value: 'bmp', label: 'BMP', mimeType: 'image/bmp', extension: 'bmp' },
    { value: 'gif', label: 'GIF', mimeType: 'image/gif', extension: 'gif' }
  ];

  // Handle file selection
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Please select image files only');
      return;
    }
    
    setSelectedFiles(imageFiles);
    setProcessedFiles([]);
  };

  // Drag and drop handlers
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Please select image files only');
      return;
    }
    
    setSelectedFiles(imageFiles);
    setProcessedFiles([]);
  };

  // Convert image to target format
  const convertImage = (file, targetFormat) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw image on canvas
        ctx.drawImage(img, 0, 0);
        
        // Convert to target format
        const targetMimeType = supportedFormats.find(f => f.value === targetFormat).mimeType;
        const targetExtension = supportedFormats.find(f => f.value === targetFormat).extension;
        
        canvas.toBlob((blob) => {
          if (blob) {
            const fileName = file.name.replace(/\.[^/.]+$/, '') + '.' + targetExtension;
            const convertedFile = new File([blob], fileName, { type: targetMimeType });
            resolve(convertedFile);
          } else {
            reject(new Error('Failed to convert image'));
          }
        }, targetMimeType, targetFormat === 'jpeg' ? quality / 100 : undefined);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  // Process all selected files
  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select image files first');
      return;
    }

    setIsProcessing(true);
    const results = [];

    try {
      for (const file of selectedFiles) {
        try {
          const convertedFile = await convertImage(file, targetFormat);
          
          results.push({
            originalFile: file,
            processedFile: convertedFile,
            originalSize: file.size,
            processedSize: convertedFile.size,
            originalFormat: file.type.split('/')[1].toUpperCase(),
            targetFormat: targetFormat.toUpperCase()
          });
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          alert(`Failed to convert ${file.name}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('Conversion failed:', error);
      alert(`Conversion failed: ${error.message}`);
    }

    setProcessedFiles(results);
    setIsProcessing(false);
  };

  // Download converted file
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get file format from MIME type
  const getFileFormat = (file) => {
    const mimeType = file.type.split('/')[1];
    return mimeType ? mimeType.toUpperCase() : 'Unknown';
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Image Format Converter</h1>
        <p className="text-gray-600">Convert images between different formats (JPEG, PNG, WebP, BMP, GIF) with quality control</p>
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
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-700 mb-2">
            Click or drag image files here
          </p>
          <p className="text-sm text-gray-500">
            Supports multiple file upload, all image formats
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
                    <div className="text-blue-500">
                      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {getFileFormat(file)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const newFiles = selectedFiles.filter((_, i) => i !== index);
                      setSelectedFiles(newFiles);
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

      {/* Conversion Settings */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Conversion Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {supportedFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
            
            {targetFormat === 'jpeg' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Higher quality = larger file size
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className="w-full mt-4 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {isProcessing ? 'Converting...' : 'Start Conversion'}
          </button>
        </div>
      )}

      {/* Processing Results */}
      {processedFiles.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Conversion Results</h3>
          <div className="space-y-4">
            {processedFiles.map((result, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
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
                        {result.originalFormat} → {result.targetFormat}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(result.originalSize)} → {formatFileSize(result.processedSize)}
                        {result.processedSize < result.originalSize && (
                          <span className="text-green-600 ml-2">
                            ({(100 - (result.processedSize / result.originalSize) * 100).toFixed(1)}% smaller)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(result.processedFile)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Usage Instructions */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-medium text-blue-800 mb-3">Usage Instructions</h3>
        <div className="text-sm text-blue-700 space-y-2">
          <p><strong>Supported Formats:</strong> JPEG, PNG, WebP, BMP, GIF - convert between any of these formats.</p>
          <p><strong>Quality Control:</strong> For JPEG output, adjust quality from 10% to 100% to balance file size and image quality.</p>
          <p><strong>Batch Processing:</strong> Upload multiple images and convert them all at once to the same target format.</p>
          <p><strong>Privacy & Security:</strong> All conversion happens locally in your browser. No images are uploaded to any server.</p>
          <p><strong>File Size Optimization:</strong> The tool shows size reduction percentages when converting to more efficient formats like WebP.</p>
        </div>
      </div>
    </div>
  );
}

export default ImageConverter;
