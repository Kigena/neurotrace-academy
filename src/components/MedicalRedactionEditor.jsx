import React, { useState, useRef, useEffect } from 'react';

/**
 * Medical-Grade Redaction Editor
 * Allows users to redact PHI from images and PDFs before uploading
 * Features: Black boxes, blur, pixelate, text overlay, crop
 */
const MedicalRedactionEditor = ({ file, onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [ctx, setCtx] = useState(null);
    const [originalImage, setOriginalImage] = useState(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [tool, setTool] = useState('rectangle'); // rectangle, blur, pixelate, text, crop
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [redactions, setRedactions] = useState([]);
    const [currentRedaction, setCurrentRedaction] = useState(null);
    const [scale, setScale] = useState(1);
    const [textInput, setTextInput] = useState('');
    const [showTextModal, setShowTextModal] = useState(false);
    const [textPosition, setTextPosition] = useState({ x: 0, y: 0 });
    const [cropArea, setCropArea] = useState(null);
    const [isCropped, setIsCropped] = useState(false);

    // Load image or PDF
    useEffect(() => {
        if (!file) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        setCtx(context);

        if (file.type.startsWith('image/')) {
            loadImage(file, canvas, context);
        } else if (file.type === 'application/pdf') {
            loadPDF(file, canvas, context);
        }
    }, [file]);

    const loadImage = (file, canvas, context) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // Scale canvas to fit viewport while maintaining aspect ratio
                const maxWidth = 1200;
                const maxHeight = 800;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                if (height > maxHeight) {
                    width = (width * maxHeight) / height;
                    height = maxHeight;
                }

                canvas.width = width;
                canvas.height = height;
                context.drawImage(img, 0, 0, width, height);
                setOriginalImage(img);
                setScale(width / img.width);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    const loadPDF = async (file, canvas, context) => {
        try {
            // Import PDF.js dynamically
            const pdfjsLib = await import('pdfjs-dist/webpack');
            
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1); // Load first page

            const viewport = page.getViewport({ scale: 1.5 });
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // Store rendered canvas as image for redaction
            const img = new Image();
            img.src = canvas.toDataURL();
            setOriginalImage(img);
        } catch (error) {
            console.error('PDF loading error:', error);
            alert('Failed to load PDF. Please try again or use an image format.');
        }
    };

    const getMousePos = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const handleMouseDown = (e) => {
        const pos = getMousePos(e);
        setStartPos(pos);
        setIsDrawing(true);

        if (tool === 'text') {
            setTextPosition(pos);
            setShowTextModal(true);
        } else if (tool === 'crop') {
            setCropArea({
                startX: pos.x,
                startY: pos.y,
                endX: pos.x,
                endY: pos.y
            });
        } else {
            setCurrentRedaction({
                type: tool,
                startX: pos.x,
                startY: pos.y,
                endX: pos.x,
                endY: pos.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDrawing || tool === 'text') return;

        const pos = getMousePos(e);
        
        if (tool === 'crop') {
            setCropArea(prev => ({
                ...prev,
                endX: pos.x,
                endY: pos.y
            }));
            redrawCanvas();
            drawCropPreview();
        } else {
            setCurrentRedaction(prev => ({
                ...prev,
                endX: pos.x,
                endY: pos.y
            }));
            redrawCanvas();
            drawCurrentRedaction(pos);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;
        
        if (tool === 'crop' && cropArea) {
            // Confirm and apply crop
            const shouldCrop = window.confirm(
                '✂️ Crop Image?\n\n' +
                'This will permanently crop the image to the selected area, removing everything outside.\n\n' +
                'This is useful for removing headers/footers with PHI.\n\n' +
                'Click OK to crop, or Cancel to continue drawing.'
            );
            
            if (shouldCrop) {
                applyCrop();
            } else {
                setCropArea(null);
                redrawCanvas();
            }
        } else if (currentRedaction && tool !== 'text') {
            setRedactions([...redactions, currentRedaction]);
        }
        
        setIsDrawing(false);
        setCurrentRedaction(null);
        redrawCanvas();
    };

    const drawCurrentRedaction = (pos) => {
        if (!currentRedaction || !ctx) return;

        const { startX, startY } = currentRedaction;
        const width = pos.x - startX;
        const height = pos.y - startY;

        if (tool === 'rectangle') {
            ctx.fillStyle = 'rgba(0, 0, 0, 1)';
            ctx.fillRect(startX, startY, width, height);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        } else if (tool === 'blur') {
            ctx.filter = 'blur(20px)';
            ctx.drawImage(originalImage, startX / scale, startY / scale, width / scale, height / scale, startX, startY, width, height);
            ctx.filter = 'none';
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        } else if (tool === 'pixelate') {
            pixelateArea(startX, startY, width, height);
            ctx.strokeStyle = '#8b5cf6';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, startY, width, height);
        }
    };

    const pixelateArea = (x, y, width, height) => {
        const pixelSize = 20;
        const imageData = ctx.getImageData(x, y, width, height);
        
        for (let py = 0; py < height; py += pixelSize) {
            for (let px = 0; px < width; px += pixelSize) {
                const i = (py * width + px) * 4;
                const r = imageData.data[i];
                const g = imageData.data[i + 1];
                const b = imageData.data[i + 2];
                
                for (let dy = 0; dy < pixelSize && py + dy < height; dy++) {
                    for (let dx = 0; dx < pixelSize && px + dx < width; dx++) {
                        const j = ((py + dy) * width + (px + dx)) * 4;
                        imageData.data[j] = r;
                        imageData.data[j + 1] = g;
                        imageData.data[j + 2] = b;
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, x, y);
    };

    const drawCropPreview = () => {
        if (!cropArea || !ctx) return;

        const canvas = canvasRef.current;
        
        // Darken everything outside crop area
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Clear the crop area to show what will remain
        const x = Math.min(cropArea.startX, cropArea.endX);
        const y = Math.min(cropArea.startY, cropArea.endY);
        const width = Math.abs(cropArea.endX - cropArea.startX);
        const height = Math.abs(cropArea.endY - cropArea.startY);
        
        ctx.clearRect(x, y, width, height);
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        
        // Draw crop border
        ctx.strokeStyle = '#10b981'; // Green
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(x, y, width, height);
        ctx.setLineDash([]);
        
        // Draw corner handles
        const handleSize = 10;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x - handleSize/2, y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(x + width - handleSize/2, y - handleSize/2, handleSize, handleSize);
        ctx.fillRect(x - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
        ctx.fillRect(x + width - handleSize/2, y + height - handleSize/2, handleSize, handleSize);
        
        // Add "KEEP THIS AREA" text
        ctx.fillStyle = '#10b981';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('KEEP THIS AREA', x + width/2, y + height/2);
    };

    const applyCrop = () => {
        if (!cropArea || !ctx || !originalImage) return;

        const canvas = canvasRef.current;
        const x = Math.min(cropArea.startX, cropArea.endX);
        const y = Math.min(cropArea.startY, cropArea.endY);
        const width = Math.abs(cropArea.endX - cropArea.startX);
        const height = Math.abs(cropArea.endY - cropArea.startY);

        // Create new canvas with cropped dimensions
        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        const croppedCtx = croppedCanvas.getContext('2d');

        // Draw cropped area
        croppedCtx.drawImage(
            canvas,
            x, y, width, height,
            0, 0, width, height
        );

        // Update main canvas
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(croppedCanvas, 0, 0);

        // Update original image for future redrawing
        const img = new Image();
        img.onload = () => {
            setOriginalImage(img);
            setIsCropped(true);
            setCropArea(null);
            setRedactions([]); // Clear previous redactions as they're now invalid
            setTool('rectangle'); // Switch back to rectangle tool
        };
        img.src = croppedCanvas.toDataURL();
    };

    const addTextRedaction = () => {
        if (!textInput.trim()) return;

        const textRedaction = {
            type: 'text',
            text: textInput,
            x: textPosition.x,
            y: textPosition.y
        };

        setRedactions([...redactions, textRedaction]);
        setTextInput('');
        setShowTextModal(false);
        redrawCanvas();
    };

    const redrawCanvas = () => {
        if (!ctx || !originalImage) return;

        const canvas = canvasRef.current;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);

        // Apply all redactions
        redactions.forEach(redaction => {
            if (redaction.type === 'rectangle') {
                ctx.fillStyle = 'rgba(0, 0, 0, 1)';
                ctx.fillRect(
                    redaction.startX,
                    redaction.startY,
                    redaction.endX - redaction.startX,
                    redaction.endY - redaction.startY
                );
            } else if (redaction.type === 'blur') {
                ctx.filter = 'blur(20px)';
                ctx.drawImage(
                    originalImage,
                    redaction.startX / scale,
                    redaction.startY / scale,
                    (redaction.endX - redaction.startX) / scale,
                    (redaction.endY - redaction.startY) / scale,
                    redaction.startX,
                    redaction.startY,
                    redaction.endX - redaction.startX,
                    redaction.endY - redaction.startY
                );
                ctx.filter = 'none';
            } else if (redaction.type === 'pixelate') {
                pixelateArea(
                    redaction.startX,
                    redaction.startY,
                    redaction.endX - redaction.startX,
                    redaction.endY - redaction.startY
                );
            } else if (redaction.type === 'text') {
                ctx.font = 'bold 24px Arial';
                ctx.fillStyle = '#000000';
                ctx.fillText(redaction.text, redaction.x, redaction.y);
            }
        });
    };

    const handleUndo = () => {
        if (redactions.length === 0) return;
        setRedactions(redactions.slice(0, -1));
        setTimeout(redrawCanvas, 0);
    };

    const handleReset = () => {
        if (isCropped) {
            alert('Cannot reset after cropping. Crop is permanent. Cancel and start over if needed.');
            return;
        }
        setRedactions([]);
        if (ctx && originalImage) {
            const canvas = canvasRef.current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
        }
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        canvas.toBlob((blob) => {
            const editedFile = new File([blob], file.name, { type: 'image/png' });
            onSave(editedFile);
        }, 'image/png');
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full h-[95vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-4 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                        <h2 className="text-xl font-bold">Medical Redaction Editor</h2>
                        <button
                            onClick={onCancel}
                            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-red-100 text-xs">
                        Remove PHI (names, dates, MRNs) before uploading. Scroll down to access entire image.
                    </p>
                </div>

                {/* Toolbar */}
                <div className="bg-slate-100 p-4 border-b border-slate-200 flex-shrink-0">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-700">Tools:</span>
                            <button
                                onClick={() => setTool('crop')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    tool === 'crop'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Crop to remove headers/footers"
                                disabled={isCropped}
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                                </svg>
                                Crop
                            </button>
                            <button
                                onClick={() => setTool('rectangle')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    tool === 'rectangle'
                                        ? 'bg-black text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Black Box (complete redaction)"
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <rect x="4" y="4" width="16" height="16" />
                                </svg>
                                Black Box
                            </button>
                            <button
                                onClick={() => setTool('blur')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    tool === 'blur'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Blur area"
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Blur
                            </button>
                            <button
                                onClick={() => setTool('pixelate')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    tool === 'pixelate'
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Pixelate area"
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
                                </svg>
                                Pixelate
                            </button>
                            <button
                                onClick={() => setTool('text')}
                                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                    tool === 'text'
                                        ? 'bg-green-600 text-white shadow-md'
                                        : 'bg-white text-slate-700 hover:bg-slate-200'
                                }`}
                                title="Add text overlay"
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                                </svg>
                                Text
                            </button>
                        </div>

                        <div className="h-8 w-px bg-slate-300"></div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleUndo}
                                disabled={redactions.length === 0 || isCropped}
                                className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Undo last redaction"
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                Undo
                            </button>
                            <button
                                onClick={handleReset}
                                disabled={redactions.length === 0 || isCropped}
                                className="px-4 py-2 bg-white text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Reset all redactions"
                            >
                                <svg className="w-5 h-5 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Reset
                            </button>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            {isCropped && (
                                <span className="text-xs px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Cropped
                                </span>
                            )}
                            <span className="text-sm text-slate-600">
                                {redactions.length} redaction{redactions.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 overflow-auto bg-slate-200 p-8">
                    <div className="min-h-full flex items-start justify-center pt-8">
                        <div className="bg-white shadow-2xl rounded-lg overflow-hidden mb-8">
                            <canvas
                                ref={canvasRef}
                                onMouseDown={handleMouseDown}
                                onMouseMove={handleMouseMove}
                                onMouseUp={handleMouseUp}
                                onMouseLeave={handleMouseUp}
                                className="cursor-crosshair block"
                                style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between flex-shrink-0">
                    <div className="text-xs text-slate-600">
                        <p className="font-semibold mb-1">💡 <strong>{tool === 'crop' ? 'Draw box around waveforms to keep' : 'Scroll to see entire image'}</strong></p>
                        <p>• <strong>Crop</strong> to remove headers/footers • <strong>Black Box</strong> for specific PHI • Drag to {tool === 'crop' ? 'crop' : 'redact'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-sm"
                        >
                            Save & Use Redacted Image
                        </button>
                    </div>
                </div>

                {/* Text Input Modal */}
                {showTextModal && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                        <div className="bg-white rounded-xl p-6 shadow-2xl max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-slate-900 mb-4">Add Text Overlay</h3>
                            <input
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTextRedaction()}
                                placeholder="Enter text (e.g., REDACTED)"
                                className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:border-green-500 focus:outline-none mb-4"
                                autoFocus
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowTextModal(false);
                                        setTextInput('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={addTextRedaction}
                                    disabled={!textInput.trim()}
                                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Text
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MedicalRedactionEditor;
