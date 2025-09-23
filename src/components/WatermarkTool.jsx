import { useState, useRef } from 'react';

function WatermarkTool() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('© ReseachBub');
  const [watermarkPositions, setWatermarkPositions] = useState(['bottom-right']);
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.7);
  const [watermarkSize, setWatermarkSize] = useState(24);
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkSpacing, setWatermarkSpacing] = useState(50);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setProcessedImage(null);
    } else {
      alert('Please select a valid image file (JPEG, PNG, GIF, etc.)');
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setProcessedImage(null);
      } else {
        alert('Please select a valid image file (JPEG, PNG, GIF, etc.)');
      }
    }
  };

  const togglePosition = (position) => {
    setWatermarkPositions(prev => {
      if (prev.includes(position)) {
        return prev.filter(p => p !== position);
      } else {
        return [...prev, position];
      }
    });
  };

  const addMultipleWatermarks = (ctx, canvas, positions) => {
    ctx.font = `${watermarkSize}px Arial, sans-serif`;
    ctx.fillStyle = watermarkColor;
    ctx.globalAlpha = watermarkOpacity;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    const textMetrics = ctx.measureText(watermarkText);
    const textWidth = textMetrics.width;
    const textHeight = watermarkSize;
    const padding = 20;

    positions.forEach((position, index) => {
      let x, y;
      
      // Calculate offset for multiple watermarks
      const offsetX = Math.floor(index / 2) * watermarkSpacing;
      const offsetY = (index % 2) * watermarkSpacing;

      switch (position) {
        case 'top-left':
          x = padding + offsetX;
          y = textHeight + padding + offsetY;
          break;
        case 'top-right':
          x = canvas.width - textWidth - padding - offsetX;
          y = textHeight + padding + offsetY;
          break;
        case 'bottom-left':
          x = padding + offsetX;
          y = canvas.height - padding - offsetY;
          break;
        case 'bottom-right':
          x = canvas.width - textWidth - padding - offsetX;
          y = canvas.height - padding - offsetY;
          break;
        case 'center':
          x = (canvas.width - textWidth) / 2 + offsetX;
          y = (canvas.height + textHeight) / 2 + offsetY;
          break;
        case 'top-center':
          x = (canvas.width - textWidth) / 2 + offsetX;
          y = textHeight + padding + offsetY;
          break;
        case 'bottom-center':
          x = (canvas.width - textWidth) / 2 + offsetX;
          y = canvas.height - padding - offsetY;
          break;
        case 'middle-left':
          x = padding + offsetX;
          y = (canvas.height + textHeight) / 2 + offsetY;
          break;
        case 'middle-right':
          x = canvas.width - textWidth - padding - offsetX;
          y = (canvas.height + textHeight) / 2 + offsetY;
          break;
        default:
          x = canvas.width - textWidth - padding - offsetX;
          y = canvas.height - padding - offsetY;
      }

      // Ensure watermark stays within canvas bounds
      x = Math.max(padding, Math.min(x, canvas.width - textWidth - padding));
      y = Math.max(textHeight + padding, Math.min(y, canvas.height - padding));

      ctx.fillText(watermarkText, x, y);
    });
  };

  const addWatermark = async () => {
    if (!selectedFile || !watermarkText.trim()) {
      alert('Please select an image and enter watermark text');
      return;
    }

    console.log('Starting watermark process...');
    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error('Canvas not found');
        setIsProcessing(false);
        alert('Canvas not found. Please refresh the page.');
        return;
      }
      
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Handle image load error to avoid stuck state
      img.onerror = (error) => {
        console.error('Image load error:', error);
        setIsProcessing(false);
        alert('Failed to load the image. Please try another file.');
      };

      img.onload = () => {
        console.log('Image loaded, processing...');
        try {
          // Set canvas size to image size
          canvas.width = img.width;
          canvas.height = img.height;

          // Draw the original image
          ctx.drawImage(img, 0, 0);

          // Add multiple watermarks (ensure at least one position)
          const positionsToUse = (watermarkPositions && watermarkPositions.length > 0)
            ? watermarkPositions
            : ['bottom-right'];
          
          console.log('Adding watermarks to positions:', positionsToUse);
          addMultipleWatermarks(ctx, canvas, positionsToUse);

          // Convert canvas to blob
          console.log('Converting to blob...');
          canvas.toBlob((blob) => {
            console.log('Blob created:', blob);
            if (!blob) {
              console.error('Failed to create blob');
              setIsProcessing(false);
              alert('Failed to generate the watermarked image. Please try again.');
              return;
            }
            
            const processedFile = new File([blob], `watermarked_${selectedFile.name.replace(/\.[^.]+$/, '')}.png`, {
              type: 'image/png'
            });
            
            setProcessedImage({
              url: URL.createObjectURL(blob),
              file: processedFile
            });
            console.log('Watermark process completed');
            setIsProcessing(false);
          }, 'image/png', 0.9);
          
        } catch (error) {
          console.error('Error in img.onload:', error);
          setIsProcessing(false);
          alert('Error processing image. Please try again.');
        }
      };

      console.log('Setting image source...');
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      console.error('Error adding watermark:', error);
      alert('Error processing image. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage.url;
      link.download = processedImage.file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetTool = () => {
    setSelectedFile(null);
    setProcessedImage(null);
    setWatermarkText('© ReseachBub');
    setWatermarkPositions(['bottom-right']);
    setWatermarkOpacity(0.7);
    setWatermarkSize(24);
    setWatermarkColor('#ffffff');
    setWatermarkSpacing(50);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1h2zm-2 0h12m-4 8h4m-4 4h4m-8-8h4m-4 4h4" />
          </svg>
        </div>
        <h1 className="text-5xl font-bold text-neutral-900 mb-6">Image Watermark Tool</h1>
        <p className="text-xl text-neutral-600 max-w-3xl mx-auto leading-relaxed">
          Add multiple custom watermarks to your images with precise control over positions, style, spacing, and opacity. Perfect for protecting your scientific images and presentations.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-soft border border-neutral-200/50 p-8 mb-8">
        <div className="max-w-6xl mx-auto">
          {/* File Upload */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Upload Image</h3>
            <div
              className="border-2 border-dashed border-neutral-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-neutral-700 mb-2">
                {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-neutral-500 mb-4">
                Supports JPEG, PNG, GIF, WebP files up to 10MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Watermark Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Watermark Settings</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Watermark Text</label>
                <input
                  type="text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter watermark text"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Watermark Positions</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'top-left', label: 'Top Left' },
                    { value: 'top-center', label: 'Top Center' },
                    { value: 'top-right', label: 'Top Right' },
                    { value: 'middle-left', label: 'Middle Left' },
                    { value: 'center', label: 'Center' },
                    { value: 'middle-right', label: 'Middle Right' },
                    { value: 'bottom-left', label: 'Bottom Left' },
                    { value: 'bottom-center', label: 'Bottom Center' },
                    { value: 'bottom-right', label: 'Bottom Right' }
                  ].map((pos) => (
                    <button
                      key={pos.value}
                      onClick={() => togglePosition(pos.value)}
                      className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
                        watermarkPositions.includes(pos.value)
                          ? 'bg-primary-600 text-white border-primary-600'
                          : 'bg-white text-neutral-700 border-neutral-300 hover:border-primary-400'
                      }`}
                    >
                      {pos.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Selected: {watermarkPositions.length} position{watermarkPositions.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Font Size: {watermarkSize}px</label>
                <input
                  type="range"
                  min="12"
                  max="72"
                  value={watermarkSize}
                  onChange={(e) => setWatermarkSize(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Opacity: {Math.round(watermarkOpacity * 100)}%</label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Text Color</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-10 h-10 border border-neutral-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Spacing: {watermarkSpacing}px</label>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={watermarkSpacing}
                  onChange={(e) => setWatermarkSpacing(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-neutral-500 mt-1">Distance between multiple watermarks</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button
              onClick={addWatermark}
              disabled={!selectedFile || isProcessing}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-400 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Watermark
                </>
              )}
            </button>
            
            {processedImage && (
              <button
                onClick={downloadImage}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
            )}
            
            <button
              onClick={resetTool}
              className="bg-neutral-600 hover:bg-neutral-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
          </div>

          {/* Preview */}
          {processedImage && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Watermarked Image Preview</h3>
              <div className="text-center">
                <img
                  src={processedImage.url}
                  alt="Watermarked preview"
                  className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Usage Instructions */}
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">How to Use</h3>
        <div className="grid md:grid-cols-4 gap-6 text-sm text-neutral-600">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">1</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Upload Image</div>
              <div>Select or drag and drop your image file</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">2</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Customize Watermark</div>
              <div>Set text, multiple positions, size, color, opacity, and spacing</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">3</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Add Watermark</div>
              <div>Click to process and preview the result</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-primary-600 font-semibold text-xs">4</span>
            </div>
            <div>
              <div className="font-semibold text-neutral-700 mb-1">Download</div>
              <div>Save your watermarked image</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default WatermarkTool;
