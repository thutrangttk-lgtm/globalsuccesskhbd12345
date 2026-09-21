import React, { useState, useEffect, useRef } from 'react';
import { Database, FileText, CheckCircle2, Sparkles, RefreshCw, ShieldCheck, Plus, Trash2, Edit3 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { analyzeSourceFile, type ExtractedDocumentData, type ExtractedUnit, type ExtractedLesson, type ExtractedIntegration, registerSourceInDatabase } from '../utils/sourceDocumentExtractor';
import { SkeletonLoader } from '../components/SkeletonLoader';

export const CurriculumSources: React.FC = () => {
  const [storageFiles, setStorageFiles] = useState<{ name: string; size: number; mime: string }[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedDocumentData | null>(null);
  
  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const previewSectionRef = useRef<HTMLDivElement>(null);

  const fetchStorageFiles = React.useCallback(async () => {
    setLoadingFiles(true);
    if (!supabase || !isSupabaseConfigured) {
      setLoadingFiles(false);
      return;
    }

    try {
      const { data, error } = await supabase.storage.from('curriculum-sources').list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' }
      });

      if (error) {
        console.error('Error fetching storage files:', error);
      } else if (data) {
        const formatted = data.map(file => ({
          name: file.name,
          size: file.metadata?.size || 0,
          mime: file.metadata?.mimetype || 'application/pdf'
        }));
        setStorageFiles(formatted);

        // Register files into curriculum_sources table
        formatted.forEach(f => {
          registerSourceInDatabase(f.name, `curriculum-sources/${f.name}`, 'PDF Document');
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    fetchStorageFiles();
  }, [fetchStorageFiles]);

  const handleAnalyzeFile = async (fileName: string) => {
    setSelectedFile(fileName);
    setAnalyzing(true);
    setExtractedData(null);
    setSaveSuccessMsg(null);

    try {
      const data = await analyzeSourceFile(fileName);
      setExtractedData(data);

      setTimeout(() => {
        previewSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      console.error('Error analyzing file:', err);
      alert('Analysis failed: ' + (err as Error)?.message);
    } finally {
      setAnalyzing(false);
    }
  };

  // Editable preview handlers
  const handleUpdateUnit = (unitIdx: number, field: keyof ExtractedUnit, value: any) => {
    if (!extractedData) return;
    const updatedUnits = [...extractedData.units];
    updatedUnits[unitIdx] = { ...updatedUnits[unitIdx], [field]: value };
    setExtractedData({ ...extractedData, units: updatedUnits });
  };

  const handleUpdateLesson = (unitIdx: number, lessonIdx: number, field: keyof ExtractedLesson, value: any) => {
    if (!extractedData) return;
    const updatedUnits = [...extractedData.units];
    const updatedLessons = [...updatedUnits[unitIdx].lessons];
    updatedLessons[lessonIdx] = { ...updatedLessons[lessonIdx], [field]: value };
    updatedUnits[unitIdx] = { ...updatedUnits[unitIdx], lessons: updatedLessons };
    setExtractedData({ ...extractedData, units: updatedUnits });
  };

  const handleAddUnit = () => {
    if (!extractedData) return;
    const nextNum = extractedData.units.length + 1;
    const newUnit: ExtractedUnit = {
      unitNumber: nextNum,
      title: `Unit ${nextNum} Title`,
      topic: 'General Topic',
      lessons: [
        {
          lessonNumber: 1,
          title: 'Lesson 1',
          durationMinutes: 35,
          vocabulary: ['hello'],
          sentencePatterns: ['How are you?'],
          skills: ['Listening', 'Speaking'],
          learningOutcomes: 'Pupils practice key skills.'
        }
      ]
    };
    setExtractedData({ ...extractedData, units: [...extractedData.units, newUnit] });
  };

  const handleRemoveUnit = (unitIdx: number) => {
    if (!extractedData) return;
    const updatedUnits = extractedData.units.filter((_, idx) => idx !== unitIdx);
    setExtractedData({ ...extractedData, units: updatedUnits });
  };

  const handleAddLesson = (unitIdx: number) => {
    if (!extractedData) return;
    const updatedUnits = [...extractedData.units];
    const unit = updatedUnits[unitIdx];
    const nextLessonNum = unit.lessons.length + 1;
    const newLesson: ExtractedLesson = {
      lessonNumber: nextLessonNum,
      title: `Lesson ${nextLessonNum}`,
      durationMinutes: 35,
      vocabulary: ['word'],
      sentencePatterns: ['Pattern example'],
      skills: ['Listening', 'Speaking'],
      learningOutcomes: 'Pupils master lesson content.'
    };
    unit.lessons.push(newLesson);
    setExtractedData({ ...extractedData, units: updatedUnits });
  };

  const handleRemoveLesson = (unitIdx: number, lessonIdx: number) => {
    if (!extractedData) return;
    const updatedUnits = [...extractedData.units];
    updatedUnits[unitIdx].lessons = updatedUnits[unitIdx].lessons.filter((_, idx) => idx !== lessonIdx);
    setExtractedData({ ...extractedData, units: updatedUnits });
  };

  const handleUpdateIntegration = (idx: number, field: keyof ExtractedIntegration, value: any) => {
    if (!extractedData) return;
    const updatedIntegrations = [...extractedData.integrations];
    updatedIntegrations[idx] = { ...updatedIntegrations[idx], [field]: value };
    setExtractedData({ ...extractedData, integrations: updatedIntegrations });
  };

  const handleAddIntegration = () => {
    if (!extractedData) return;
    const newReq: ExtractedIntegration = {
      type: 'NLS',
      officialCode: `NLS_${extractedData.gradeLevel}.${extractedData.integrations.length + 1}.1`,
      officialWording: 'Sử dụng tài nguyên học tập số Tiếng Anh.',
      domain: 'Miền học tập số',
      componentCompetence: 'Sử dụng ứng dụng số'
    };
    setExtractedData({ ...extractedData, integrations: [...extractedData.integrations, newReq] });
  };

  const handleRemoveIntegration = (idx: number) => {
    if (!extractedData) return;
    const updatedIntegrations = extractedData.integrations.filter((_, i) => i !== idx);
    setExtractedData({ ...extractedData, integrations: updatedIntegrations });
  };

  const handleConfirmAndSave = async () => {
    if (!extractedData || !supabase || !isSupabaseConfigured) return;

    setSaving(true);
    setSaveSuccessMsg(null);

    try {
      // 1. Get teaching program record from Supabase
      let { data: program } = await supabase
        .from('teaching_programs')
        .select('id')
        .eq('code', extractedData.teachingProgramCode)
        .maybeSingle();

      let programId = program?.id;

      if (!programId) {
        // Fallback: Query GLOBAL_SUCCESS or first available program record
        const { data: fallbackProgram } = await supabase
          .from('teaching_programs')
          .select('id')
          .eq('code', 'GLOBAL_SUCCESS')
          .maybeSingle();

        programId = fallbackProgram?.id;
      }

      if (!programId) {
        const { data: anyProgram } = await supabase
          .from('teaching_programs')
          .select('id')
          .limit(1)
          .maybeSingle();

        programId = anyProgram?.id;
      }

      if (!programId) {
        alert('Teaching program ID could not be loaded. Please ensure teaching_programs records exist in database.');
        setSaving(false);
        return;
      }

      // 2. Insert Units & Lessons
      for (const unit of extractedData.units) {
        const { data: unitRecord, error: unitErr } = await supabase
          .from('curriculum_units')
          .upsert([
            {
              teaching_program_id: programId,
              grade_level: extractedData.gradeLevel,
              unit_number: unit.unitNumber,
              title: unit.title,
              topic: unit.topic || null
            }
          ], { onConflict: 'teaching_program_id,grade_level,unit_number' })
          .select('id')
          .single();

        if (unitErr) {
          console.error('Error inserting unit:', unitErr);
          continue;
        }

        const unitId = unitRecord?.id;
        if (!unitId) continue;

        for (const lesson of unit.lessons) {
          const { data: lessonRecord, error: lessonErr } = await supabase
            .from('lessons')
            .upsert([
              {
                unit_id: unitId,
                lesson_number: lesson.lessonNumber,
                title: lesson.title,
                duration_minutes: lesson.durationMinutes
              }
            ], { onConflict: 'unit_id,lesson_number' })
            .select('id')
            .single();

          if (lessonErr) {
            console.error('Error inserting lesson:', lessonErr);
            continue;
          }

          const lessonId = lessonRecord?.id;
          if (!lessonId) continue;

          // Insert lesson content
          await supabase.from('lesson_content').upsert([
            {
              lesson_id: lessonId,
              vocabulary: lesson.vocabulary,
              sentence_patterns: lesson.sentencePatterns,
              skills: lesson.skills,
              learning_outcomes: lesson.learningOutcomes
            }
          ], { onConflict: 'lesson_id' });
        }
      }

      // 3. Insert Integration Requirements
      for (const req of extractedData.integrations) {
        await supabase.from('integration_requirements').insert([
          {
            teaching_program_id: programId,
            grade_level: extractedData.gradeLevel,
            integration_type: req.type,
            official_code: req.officialCode,
            official_wording: req.officialWording,
            domain: req.domain || null,
            component_competence: req.componentCompetence || null,
            level: req.level || null,
            indicator: req.indicator || null,
            source_document: extractedData.sourceFileName,
            verification_status: 'VERIFIED'
          }
        ]);
      }

      // 4. Update status in curriculum_sources
      await supabase.from('curriculum_sources').update({
        verification_status: 'VERIFIED',
        extracted_units_count: extractedData.units.length,
        extracted_standards_count: extractedData.integrations.length
      }).eq('file_path', `curriculum-sources/${extractedData.sourceFileName}`);

      setSaveSuccessMsg(`Successfully imported and saved ${extractedData.units.length} Units and ${extractedData.integrations.length} Integration Standards to Supabase!`);
    } catch (err: any) {
      console.error('Error confirming structured data:', err);
      alert('Failed to save verified data: ' + err?.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full text-slate-100 py-2 sm:py-4">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        
        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 border border-indigo-500/30 rounded-3xl p-4 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shrink-0">
              <Database className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2.5 py-0.5 rounded-full text-[11px] font-semibold mb-1">
                <span>Official Storage Bucket • Document Analyzer</span>
              </div>
              <h1 className="text-2xl font-black text-white tracking-wide">CURRICULUM SOURCES & STORAGE MANAGER</h1>
              <p className="text-xs text-slate-300 max-w-md">
                Official textbook PDFs, KHDH guidelines, Thông tư 02 NLS standards, and Quyết định 2422 AI documents.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 shrink-0">
            <div className="hidden sm:block w-40 h-24 relative rounded-2xl overflow-hidden shadow-md border border-slate-700/60">
              <img
                src="/images/lesson_plan_header.jpg"
                alt="Lesson plan header illustration"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={fetchStorageFiles}
              className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Storage</span>
            </button>
          </div>
        </div>

        {/* Source Storage Files List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-white mb-1 flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <span>Official Storage Bucket (`curriculum-sources`)</span>
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Listed below are the official textbook PDF files, KHDH guidelines, Thông tư 02 NLS standards, and Quyết định 2422 AI documents stored in Supabase Storage. Click <strong>Analyze & Extract</strong> to open the review workflow.
          </p>

          {loadingFiles ? (
            <SkeletonLoader count={4} />
          ) : storageFiles.length === 0 ? (
            <div className="text-center p-8 bg-slate-800/40 rounded-2xl text-slate-400 text-sm">
              No files found in `curriculum-sources` bucket.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {storageFiles.map((file) => {
                const isSelected = selectedFile === file.name;
                return (
                  <div
                    key={file.name}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-lg'
                        : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="text-xs font-semibold text-slate-200 line-clamp-2 leading-snug" title={file.name}>
                          {file.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.mime.replace('application/', '')}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-300">
                        {file.name.includes('KHDH') ? 'KHDH' : file.name.includes('TT02') ? 'Thông tư 02' : file.name.includes('2422') ? 'QĐ 2422' : 'Textbook'}
                      </span>

                      <button
                        onClick={() => handleAnalyzeFile(file.name)}
                        className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        <span>Analyze & Extract</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Analyzing Spinner */}
        {analyzing && (
          <div className="bg-indigo-950/60 border border-indigo-500/50 rounded-3xl p-8 text-center animate-pulse shadow-xl">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-3 animate-spin" />
            <h3 className="text-base font-bold text-indigo-200">Reading Source File & Extracting Content...</h3>
            <p className="text-xs text-slate-300 mt-1">
              Downloading <code className="text-yellow-300">{selectedFile}</code> from Supabase <code className="text-indigo-300">curriculum-sources</code> bucket...
            </p>
          </div>
        )}

        {/* Extracted Data Preview & Review Panel */}
        {extractedData && (
          <div ref={previewSectionRef} className="bg-slate-900 border border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {extractedData.teachingProgramCode} • Grade {extractedData.gradeLevel}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {extractedData.documentType}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Edit3 className="w-5 h-5 text-emerald-400" />
                  <span>STRUCTURED CURRICULUM EXTRACTION REVIEW (EDITABLE PREVIEW)</span>
                </h2>
                <p className="text-xs text-slate-400 flex items-center space-x-1 mt-1">
                  <span>Source File Reference:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{extractedData.sourceFileName}</span>
                </p>
              </div>

              <button
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-7 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-600/30 flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{saving ? 'Importing Data...' : 'CONFIRM & IMPORT'}</span>
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-4 rounded-2xl text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* General Settings Metadata Controls */}
            <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Teaching Program Code</label>
                <select
                  value={extractedData.teachingProgramCode}
                  onChange={(e) => setExtractedData({ ...extractedData, teachingProgramCode: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value="GLOBAL_SUCCESS">GLOBAL_SUCCESS</option>
                  <option value="MOVE_UP">MOVE_UP</option>
                  <option value="ENHANCED">ENHANCED</option>
                  <option value="CUSTOM">CUSTOM</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Grade Level</label>
                <select
                  value={extractedData.gradeLevel}
                  onChange={(e) => setExtractedData({ ...extractedData, gradeLevel: parseInt(e.target.value, 10) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-indigo-500"
                >
                  <option value={1}>Grade 1 (Lớp 1)</option>
                  <option value={2}>Grade 2 (Lớp 2)</option>
                  <option value={3}>Grade 3 (Lớp 3)</option>
                  <option value={4}>Grade 4 (Lớp 4)</option>
                  <option value={5}>Grade 5 (Lớp 5)</option>
                </select>
              </div>
            </div>

            {/* Extracted Units & Lessons Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span>Extracted Curriculum Units & Lessons ({extractedData.units.length} Units)</span>
                </h3>
                <button
                  onClick={handleAddUnit}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Unit</span>
                </button>
              </div>

              <div className="space-y-4">
                {extractedData.units.map((unit, uIdx) => (
                  <div key={uIdx} className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-indigo-400 shrink-0">Unit {unit.unitNumber}:</span>
                        <input
                          type="text"
                          value={unit.title}
                          onChange={(e) => handleUpdateUnit(uIdx, 'title', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white font-bold w-full sm:w-64 focus:outline-none focus:border-indigo-500"
                        />
                      </div>

                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                        <input
                          type="text"
                          value={unit.topic || ''}
                          placeholder="Unit Topic"
                          onChange={(e) => handleUpdateUnit(uIdx, 'topic', e.target.value)}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 w-44 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => handleRemoveUnit(uIdx)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
                          title="Remove Unit"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                        <span>Lessons ({unit.lessons.length})</span>
                        <button
                          onClick={() => handleAddLesson(uIdx)}
                          className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Lesson</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {unit.lessons.map((lesson, lIdx) => (
                          <div key={lIdx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700/80 text-xs space-y-2.5 relative group">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-emerald-400 text-xs">Lesson {lesson.lessonNumber}</span>
                              <button
                                onClick={() => handleRemoveLesson(uIdx, lIdx)}
                                className="text-slate-500 hover:text-red-400 p-0.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Lesson Title</label>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => handleUpdateLesson(uIdx, lIdx, 'title', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-200 font-semibold focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Vocabulary (comma separated)</label>
                              <input
                                type="text"
                                value={lesson.vocabulary.join(', ')}
                                onChange={(e) => handleUpdateLesson(uIdx, lIdx, 'vocabulary', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Sentence Patterns (semicolon separated)</label>
                              <input
                                type="text"
                                value={lesson.sentencePatterns.join('; ')}
                                onChange={(e) => handleUpdateLesson(uIdx, lIdx, 'sentencePatterns', e.target.value.split(';').map(s => s.trim()))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] text-slate-500 font-semibold mb-0.5">Skills</label>
                              <input
                                type="text"
                                value={lesson.skills.join(', ')}
                                onChange={(e) => handleUpdateLesson(uIdx, lIdx, 'skills', e.target.value.split(',').map(s => s.trim()))}
                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Extracted Integration Requirements */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                  <span>Extracted Integration Standards & Official Codes ({extractedData.integrations.length})</span>
                </h3>
                <button
                  onClick={handleAddIntegration}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Standard</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {extractedData.integrations.map((item, idx) => (
                  <div key={idx} className="bg-slate-800/80 border border-slate-700 p-3.5 rounded-2xl text-xs space-y-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateIntegration(idx, 'type', e.target.value as any)}
                          className="bg-slate-900 border border-slate-700 text-indigo-300 font-bold px-2 py-1 rounded text-xs focus:outline-none"
                        >
                          <option value="NLS">NLS (Năng lực số)</option>
                          <option value="AI">AI (Trí tuệ nhân tạo)</option>
                          <option value="CDS">CDS (Chuyển đổi số)</option>
                          <option value="ETHICS">ETHICS (Đạo đức)</option>
                          <option value="STEM">STEM</option>
                        </select>

                        <input
                          type="text"
                          value={item.officialCode}
                          onChange={(e) => handleUpdateIntegration(idx, 'officialCode', e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-emerald-400 font-mono font-bold px-2 py-1 rounded text-xs w-32 focus:outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleRemoveIntegration(idx)}
                        className="text-slate-500 hover:text-red-400 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={2}
                      value={item.officialWording}
                      onChange={(e) => handleUpdateIntegration(idx, 'officialWording', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                    />

                    {item.domain && (
                      <div className="text-[11px] text-slate-400 font-medium">
                        Domain: {item.domain}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Source File Traceability: <code className="text-slate-200 font-mono">{extractedData.sourceFileName}</code></span>
              </div>

              <button
                onClick={handleConfirmAndSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black px-8 py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30 flex items-center space-x-2 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{saving ? 'Importing...' : 'CONFIRM & IMPORT'}</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
