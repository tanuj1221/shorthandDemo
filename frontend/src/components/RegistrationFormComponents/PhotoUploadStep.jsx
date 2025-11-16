

import React, { useState, useRef } from 'react';
import { Image, Check, X, Crop } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const PhotoUploadStep = ({ handleFileChange, prevStep, handleSubmit }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [crop, setCrop] = useState({
    unit: '%',
    width: 30,
    height: 30,
    aspect: 1,
    x: 0,
    y: 0
  });
  const [photoError, setPhotoError] = useState('');
  const [originalImage, setOriginalImage] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const compressImage = (file, maxSizeKB = 30) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calculate new dimensions while maintaining aspect ratio
          // Use smaller max dimension for better compression
          const maxDimension = 400; // Reduced from 800 to 400
          if (width > height && width > maxDimension) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else if (height > maxDimension) {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          // Try different quality levels to get under maxSizeKB
          let quality = 0.7; // Start with lower quality
          const tryCompress = () => {
            canvas.toBlob((blob) => {
              if (!blob) {
                reject(new Error('Compression failed'));
                return;
              }
              
              const sizeKB = blob.size / 1024;
              
              if (sizeKB <= maxSizeKB || quality <= 0.1) {
                // Success or reached minimum quality
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              } else {
                // Try again with lower quality
                quality -= 0.1;
                tryCompress();
              }
            }, 'image/jpeg', quality);
          };
          
          tryCompress();
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoError(''); // Reset previous errors

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setPhotoError('Only JPG/PNG allowed');
      return;
    }

    try {
      // Compress image if needed
      const compressedDataUrl = await compressImage(file, 30);
      
      setImagePreview(compressedDataUrl);
      setOriginalImage(compressedDataUrl);
      handleFileChange({
        target: {
          name: 'image',
          value: compressedDataUrl
        }
      });
    } catch (error) {
      console.error('Image compression error:', error);
      setPhotoError('Failed to process image. Please try another photo.');
    }
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    const size = Math.min(width, height) * 0.8; // 80% of the smaller dimension
    
    setCrop({
      unit: 'px',
      width: size,
      height: size,
      aspect: 1,
      x: (width - size) / 2,
      y: (height - size) / 2
    });
  };

  const applyCrop = () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    // Convert canvas to blob and update preview
    canvas.toBlob((blob) => {
      if (!blob) return;
      
      const croppedFile = new File([blob], 'student-photo.jpg', {
        type: 'image/jpeg',
        lastModified: Date.now()
      });

      const previewUrl = URL.createObjectURL(blob);
      setImagePreview(previewUrl);
      
      handleFileChange({
        target: {
          name: 'image',
          files: [croppedFile],
          value: previewUrl
        }
      });
    }, 'image/jpeg', 0.9);
  };

  const resetCrop = () => {
    setImagePreview(originalImage);
    setCrop({
      unit: '%',
      width: 30,
      height: 30,
      aspect: 1,
      x: 0,
      y: 0
    });
    setCompletedCrop(null);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center">Student Photo</h2>
      
      <div className="border-2 border-dashed rounded-lg p-4 text-center">
        {imagePreview ? (
          <div className="space-y-4">
            <ReactCrop 
              crop={crop}
              onChange={(c) => setCrop({ ...c, x: c.x ?? 0, y: c.y ?? 0 })}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              minWidth={100}
              minHeight={100}
              ruleOfThirds
              circularCrop={false}
            >
              <img
                ref={imgRef}
                src={imagePreview}
                alt="Preview"
                className="max-h-64 mx-auto"
                onLoad={onImageLoad}
              />
            </ReactCrop>
            
            {/* Hidden canvas for cropping */}
            <canvas
              ref={previewCanvasRef}
              style={{
                display: 'none',
                objectFit: 'contain',
              }}
            />
            
            <div className="flex justify-center gap-4">
              <button
                onClick={applyCrop}
                className="flex items-center gap-1 bg-blue-500 text-white px-4 py-1 rounded"
                disabled={!completedCrop}
              >
                <Crop size={16} /> Apply Crop
              </button>
              <button
                onClick={resetCrop}
                className="flex items-center gap-1 bg-gray-500 text-white px-4 py-1 rounded"
              >
                <X size={16} /> Reset
              </button>
              <button
                onClick={() => fileInputRef.current.click()}
                className="bg-gray-500 text-white px-4 py-1 rounded"
              >
                Change Photo
              </button>
            </div>
            <div className="text-center text-sm text-gray-500 mt-2">
              Adjust the crop area to center your face (square crop required)
            </div>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current.click()}
            className="cursor-pointer p-6"
          >
            <Image className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm">Click to upload student photo</p>
            <p className="text-xs text-gray-500">JPG/PNG (Auto-compressed to 30KB)</p>
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {photoError && <p className="text-red-500 text-sm text-center">{photoError}</p>}

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          className="bg-gray-400 text-white px-6 py-2 rounded"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!imagePreview}
          className="bg-green-600 text-white px-6 py-2 rounded disabled:bg-gray-300"
        >
          Complete Registration
        </button>
      </div>
    </div>
  );
};

export default PhotoUploadStep;