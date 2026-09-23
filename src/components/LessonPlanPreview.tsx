import React from 'react';
import type { LessonPlan } from '../types';
import { exportToWord, getExportFileName } from '../utils/wordExport';
import { FileDown, Printer, ArrowLeft } from 'lucide-react';
import { sanitizeLessonPlanLanguage } from '../utils/integrationTranslator';
import { getVocabObjective, getPatternObjective, getSkillsObjective, getCompetencesQualitiesObjective } from '../utils/objectiveGenerator';
import { hasValidPhonics } from '../utils/lessonGenerator';

interface LessonPlanPreviewProps {
  plan: LessonPlan;
  onBack?: () => void;
}

export const LessonPlanPreview: React.FC<LessonPlanPreviewProps> = ({ plan: rawPlan, onBack }) => {
  const plan = sanitizeLessonPlanLanguage(rawPlan);
  const isGlobalSuccess = plan.teaching_program_code === 'GLOBAL_SUCCESS';

  const vocabOutcome = plan.vocab_objective || getVocabObjective(plan.vocabulary, plan.grade_level);
  const patternOutcome = plan.pattern_objective || getPatternObjective(plan.sentence_patterns, plan.grade_level);
  const skillsOutcome = plan.skills_objective || getSkillsObjective(plan.skills, plan.vocabulary, plan.sentence_patterns);
  const competencesOutcome = getCompetencesQualitiesObjective(plan.competences_qualities_text);

  const handlePrint = () => {
    const origTitle = document.title;
    const baseName = getExportFileName(plan, 'pdf').replace(/\.pdf$/, '');
    document.title = baseName;
    window.print();
    setTimeout(() => {
      document.title = origTitle;
    }, 1000);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-6">
      
      {/* Top Bar (Hidden when printing) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 no-print">
        {onBack && (
          <button
            onClick={onBack}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-4 py-2 rounded-xl text-sm transition-colors flex items-center space-x-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Editor</span>
          </button>
        )}

        <div className="flex items-center space-x-3">
          <button
            onClick={() => exportToWord(plan)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>XUẤT WORD</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-purple-600 hover:bg-purple-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT / SAVE PDF</span>
          </button>
        </div>
      </div>

      {/* A4 Paper Document Container */}
      <div className="max-w-4xl mx-auto bg-white text-black p-10 sm:p-14 shadow-2xl rounded-sm font-serif text-[13pt] leading-normal border border-slate-300">
        
        {/* Fixed Institutional Header (English) */}
        <div className="font-bold text-left mb-6 text-black space-y-0.5">
          <p>HIEP PHUOC COMMUNE PEOPLE'S COMMITTEE</p>
          <p>TRANG TAN KHUONG PRIMARY SCHOOL</p>
          <p>TEACHER: TRAN THI THU TRANG</p>
        </div>

        {/* Main Title & Header */}
        <div className="text-center my-4 space-y-1 border-b border-black/20 pb-4">
          <h1 className="text-[16pt] font-bold text-[#1F4E78] uppercase">
            LESSON PLAN GRADE {plan.grade_level} - {plan.teaching_program_code === 'GLOBAL_SUCCESS' ? 'GLOBAL SUCCESS' : plan.teaching_program_code.replace('_', ' ')}
          </h1>
          {(isGlobalSuccess || plan.publisher) && (
            <p className="text-[13pt] font-bold text-black uppercase">
              {plan.publisher || 'VIETNAM EDUCATION PUBLISHING HOUSE'}
            </p>
          )}

          {plan.teaching_program_code === 'MOVE_UP' ? (
            <>
              <p className="text-[14pt] font-bold text-[#1F4E78] uppercase">
                {`WEEK ${plan.week_number || 1} - ${(plan.lesson_plan_label || 'LESSON PLAN ' + (plan.week_number || 1)).toUpperCase()}`}
              </p>
              <p className="text-[14pt] font-bold text-[#1F4E78] uppercase">
                {(plan.unit_title || 'STARTER UNIT').replace(/ -> /g, ' → ').toUpperCase()}
              </p>
              <p className="text-[14pt] text-[#1F4E78]">
                <span className="font-bold uppercase">
                  {(plan.lesson_title || '').toUpperCase()}
                </span>
                <span className="font-normal text-black capitalize ml-1.5">(Duration: {plan.duration_minutes || 70} minutes)</span>
              </p>
            </>
          ) : (
            <>
              <p className="text-[14pt] font-bold text-[#1F4E78] uppercase">
                {plan.unit_title ? (plan.unit_title.toUpperCase().startsWith('UNIT') ? plan.unit_title.toUpperCase() : `UNIT: ${plan.unit_title.toUpperCase()}`) : 'UNIT 1'}
              </p>
              <p className="text-[14pt] text-[#1F4E78]">
                <span className="font-bold uppercase">
                  {plan.lesson_title ? (
                    plan.lesson_title.toUpperCase().startsWith('LESSON') 
                      ? (plan.lesson_title.match(/LESSON\s*\d+/i)?.[0].toUpperCase() || plan.lesson_title.toUpperCase())
                      : `LESSON ${plan.lesson_title.match(/\d+/)?.[0] || '1'}`
                  ) : 'LESSON 1'}
                </span>
                <span className="font-normal text-black capitalize ml-1.5">(Duration: {plan.duration_minutes || 35} minutes)</span>
              </p>
            </>
          )}
        </div>

        {/* I. OBJECTIVES */}
        <div className="mb-6">
          <h2 className="text-[14pt] font-bold text-[#1F4E78] uppercase mb-1">I. OBJECTIVES</h2>
          <p className="italic mb-2">By the end of the lesson, pupils will be able to:</p>

          <div className="ml-4 space-y-3">
            <div>
              <h3 className="font-bold text-[#548235] text-[13pt]">1. Language Knowledge & Skills</h3>
              <p className="mt-1"><strong className="font-bold">Vocabulary:</strong> {plan.teaching_program_code === 'MOVE_UP' ? (plan.vocabulary_text || vocabOutcome) : vocabOutcome}</p>
              <p className="mt-1"><strong className="font-bold">Sentence Patterns:</strong> {plan.teaching_program_code === 'MOVE_UP' ? (plan.sentence_patterns_text || patternOutcome) : patternOutcome}</p>
              {plan.teaching_program_code === 'MOVE_UP' && hasValidPhonics(plan.phonics) && (
                <p className="mt-1"><strong className="font-bold">Phonics / Sounds & Letters:</strong> {plan.phonics}</p>
              )}
              <p className="mt-1"><strong className="font-bold">{plan.teaching_program_code === 'MOVE_UP' ? "Learning Outcomes:" : "Skills:"}</strong> {plan.teaching_program_code === 'MOVE_UP' ? (plan.learning_outcomes_text || skillsOutcome) : skillsOutcome}</p>
            </div>

            <div>
              <h3 className="font-bold text-[#548235] text-[13pt]">2. Core / General Competences and Qualities</h3>
              <p className="mt-1">
                {competencesOutcome}
              </p>
            </div>

            {((plan.integrations && plan.integrations.length > 0) || plan.teaching_program_code !== 'MOVE_UP') && (
              <div>
                <h3 className="font-bold text-[#548235] text-[13pt]">3. Integration</h3>
                {plan.integrations && plan.integrations.length > 0 ? (
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {plan.integrations.map((item, i) => (
                      <li key={i}>
                        <strong>{item.type}{item.code ? ` [${item.code}]` : ''}:</strong> {item.wording}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1">No specific integration identified for this lesson.</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* II. TEACHING AIDS AND LEARNING MATERIALS */}
        <div className="mb-6">
          <h2 className="text-[14pt] font-bold text-[#1F4E78] uppercase mb-2">II. TEACHING AIDS AND LEARNING MATERIALS</h2>
          <ul className="list-disc list-inside ml-4 space-y-1">
            {(plan.teaching_aids || []).map((aid, idx) => (
              <li key={idx}>{aid}</li>
            ))}
          </ul>
        </div>

        {/* III. TEACHING PROCEDURES */}
        <div className="mb-6">
          <h2 className="text-[14pt] font-bold text-[#1F4E78] uppercase mb-3">III. TEACHING PROCEDURES</h2>

          <table className="w-full border-collapse border border-black text-[13pt]">
            <thead>
              <tr className="bg-slate-100 font-bold text-center border-b border-black">
                <th className="p-3 border-r border-black w-[43%]">Learning Activities</th>
                <th className="p-3 border-r border-black w-[37%]">Expected Outcomes & Evidence</th>
                <th className="p-3 w-[20%]">Post-Lesson Adjustments</th>
              </tr>
            </thead>
            <tbody>
              {(plan.procedures || []).map((proc, i) => (
                <tr key={i} className="border-b border-black align-top">
                  
                  {/* Col 1 */}
                  <td className="p-3 border-r border-black space-y-2">
                    <p className="font-bold text-[#1F4E78]">* {proc.stageName}</p>
                    <p className="font-bold">Teacher's activities:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {(proc.teacherActivities || []).map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                    <p className="font-bold pt-1">Pupils' activities:</p>
                    <ul className="list-disc list-inside space-y-1 pl-1">
                      {(proc.pupilActivities || []).map((act, aIdx) => (
                        <li key={aIdx}>{act}</li>
                      ))}
                    </ul>
                  </td>

                  {/* Col 2 */}
                  <td className="p-3 border-r border-black space-y-2">
                    <p className="font-bold">Expected Outcome:</p>
                    <p>{proc.expectedOutcome}</p>
                    <p className="font-bold pt-1">Evidence:</p>
                    <p>{proc.evidence}</p>

                    {(proc.integrationCode || proc.integrationLabel) && (
                      <p className="pt-2 font-bold text-[#548235]">
                        Integration: {proc.integrationLabel || 'NLS'} [{proc.integrationCode}]
                      </p>
                    )}
                  </td>

                  {/* Col 3 */}
                  <td className="p-3">
                    {proc.postLessonAdjustments || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* POST-REFLECTION */}
        <div className="mb-8">
          <h2 className="text-[14pt] font-bold text-[#1F4E78] uppercase mb-2">POST-REFLECTION</h2>
          <p>{plan.post_reflection || (plan.teaching_program_code === 'MOVE_UP' ? "Teacher's reflection after the lesson: ____________________________________________________________________________________________________" : "The lesson was delivered successfully. Pupils were engaged in learning activities and achieved target outcomes. A short review will be conducted in the next lesson.")}</p>
        </div>

        {/* SIDE-BY-SIDE SIGNATURE SECTION */}
        <div className="pt-8 grid grid-cols-2 text-center font-bold">
          <div>
            <p>BAN GIÁM HIỆU</p>
            <div className="h-24"></div>
            <p>Trương Thị Lệ Hằng</p>
          </div>
          <div>
            <p>TỔ TRƯỜNG</p>
            <div className="h-24"></div>
            <p>Nguyễn Thị Ngà</p>
          </div>
        </div>

      </div>
    </div>
  );
};
