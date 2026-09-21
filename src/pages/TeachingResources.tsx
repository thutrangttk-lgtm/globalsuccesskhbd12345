import React from 'react';
import { FolderArchive, Upload, Music, Image as ImageIcon, FileText } from 'lucide-react';

export const TeachingResources: React.FC = () => {
  return (
    <div className="w-full text-slate-100 py-2 sm:py-4">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="p-2.5 sm:p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shrink-0">
            <FolderArchive className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wide">TEACHING RESOURCES</h1>
            <p className="text-[11px] sm:text-xs text-emerald-400 font-semibold uppercase tracking-wider">
              Flashcards • Audio Tracks • Worksheets • Teaching Aids
            </p>
          </div>
        </div>

        {/* Resource Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <Music className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm">Audio Tracks</h3>
            <p className="text-xs text-slate-400 mt-1">Global Success MP3 audio files</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <ImageIcon className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm">Flashcards & Pictures</h3>
            <p className="text-xs text-slate-400 mt-1">Vocabulary flashcard images</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <FileText className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-sm">Worksheets</h3>
            <p className="text-xs text-slate-400 mt-1">Printable pupil practice sheets</p>
          </div>
        </div>

        {/* Empty Repository Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <Upload className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">Teaching Resource Library</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
            Upload custom flashcard images, audio files, or supplementary worksheets to your school's shared library.
          </p>
          <button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow-md">
            + Upload Resource
          </button>
        </div>

      </div>
    </div>
  );
};
