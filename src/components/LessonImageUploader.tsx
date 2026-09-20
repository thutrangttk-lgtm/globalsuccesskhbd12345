import React, { useState, useEffect } from 'react';
import { ImagePlus, Upload, X, Eye } from 'lucide-react';
import { parseUploadedImage } from '../utils/sourceParser';
import type { ExtractedLessonInfo } from '../types';

interface LessonImageUploaderProps {
  onImagesExtracted: (info: ExtractedLessonInfo) => void;
}

export const LessonImageUploader: React.FC<LessonImageUploaderProps> = ({ onImagesExtracted }) => {
  const [images, setImages] = useState<{ id: string; file?: File; previewUrl: string; name: string }[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            addImage(file, `pasted_image_${Date.now()}.png`);
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [images]);

  const addImage = (file: File, customName?: string) => {
    const url = URL.createObjectURL(file);
    const newImg = {
      id: `img_${Date.now()}_${Math.random()}`,
      file,
      previewUrl: url,
      name: customName || file.name
    };
    setImages((prev) => [...prev, newImg]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach((file) => addImage(file));
    }
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleAnalyzeImages = async () => {
    if (images.length === 0) return;
    setAnalyzing(true);

    try {
      let mergedVocab: string[] = [];
      let mergedPatterns: string[] = [];
      let mergedActivities: string[] = [];

      for (const img of images) {
        if (img.file) {
          const info = await parseUploadedImage(img.file);
          mergedVocab = Array.from(new Set([...mergedVocab, ...(info.vocabulary || [])]));
          mergedPatterns = Array.from(new Set([...mergedPatterns, ...(info.sentencePatterns || [])]));
          mergedActivities = Array.from(new Set([...mergedActivities, ...(info.activities || [])]));
        }
      }

      onImagesExtracted({
        gradeLevel: 3,
        unitTitle: 'Unit (Extracted from Images)',
        lessonTitle: 'Lesson 1 - Look, listen and repeat',
        vocabulary: mergedVocab,
        sentencePatterns: mergedPatterns,
        skills: ['Listening', 'Speaking'],
        activities: mergedActivities
      });
    } catch (err) {
      console.error('Error analyzing images:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-2">
        <ImagePlus className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-bold text-white">Dán Hình / Tải Hình Bài Học (Paste / Upload Lesson Images)</h3>
      </div>
      <p className="text-xs text-slate-400 mb-4">
        Paste textbook screenshots directly from clipboard (<kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700">Ctrl+V</kbd>) or upload image files (JPG, PNG, WEBP). Supports multi-page textbook screenshots.
      </p>

      <div className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-800/40 relative">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
        <Upload className="w-8 h-8 text-blue-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-200">
          Click or drag & drop textbook images here, or press Ctrl+V to paste from clipboard
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Supports JPG, JPEG, PNG, WEBP
        </p>
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            Uploaded Lesson Images ({images.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img) => (
              <div key={img.id} className="relative group bg-slate-800 border border-slate-700 rounded-xl overflow-hidden aspect-video flex items-center justify-center">
                <img src={img.previewUrl} alt={img.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleRemove(img.id)}
                  className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-md"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAnalyzeImages}
              disabled={analyzing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-2 rounded-xl text-sm transition-all shadow-md inline-flex items-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>{analyzing ? 'Extracting Image Data...' : 'Analyze & Extract Image Content'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
