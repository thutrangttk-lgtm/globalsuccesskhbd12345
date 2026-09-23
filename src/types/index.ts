export type Role = 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  school_name: string;
  youtube_channel_url?: string;
  allow_external_youtube?: boolean;
  created_at?: string;
}

export type TeachingProgramCode = 'GLOBAL_SUCCESS' | 'MOVE_UP' | 'ENHANCED' | 'CUSTOM';

export interface TeachingProgram {
  id: string;
  code: TeachingProgramCode;
  name: string;
  description?: string;
  publisher?: string;
  is_active: boolean;
}

export interface Grade {
  id: string;
  level: number;
  name: string;
}

export interface CurriculumUnit {
  id: string;
  teaching_program_id?: string;
  grade_level: number;
  unit_number: number;
  title: string;
  topic?: string;
}

export interface Lesson {
  id: string;
  unit_id: string;
  lesson_number: number;
  title: string;
  duration_minutes: number;
}

export interface CurriculumLessonMaster {
  id: string;
  created_at?: string;
  grade: number;
  sequence_no: number;
  weeks?: string | null;
  semester?: number | null;
  official_periods?: string | null;
  period_count?: number | null;
  item_type: 'UNIT' | 'STARTER' | 'FUN_TIME' | 'REVIEW' | 'REVISION' | 'INTRO' | 'TEST' | 'EXTENSION';
  unit_number: number | null;
  unit_title: string | null;
  lesson_number: number | null;
  title: string | null;
  part: string | null;
  display_title: string;
  phonics: string | null;
  vocabulary: string | null;
  sentence_patterns: string | null;
  integration_name_exact: string | null;
  integration_code_exact: string | null;
  integration_detail_exact: string | null;
  sgk_source?: string | null;
  khdh_source?: string | null;
  ppct_source?: string | null;
  validation_note?: string | null;
  khdh_title_exact?: string | null;
  khdh_week_month?: string | null;
  khdh_topic?: string | null;
  integration_verified?: string | null;
  verification_source?: string | null;
}


export interface ProcedureRow {
  id: string;
  stageName: string; // Warm-up, Presentation, Practice, Production, Consolidation, Wrap-up
  teacherActivities: string[];
  pupilActivities: string[];
  expectedOutcome: string;
  evidence: string;
  integrationCode?: string;
  integrationLabel?: string;
  videoMetadata?: {
    title: string;
    url: string;
    source: 'teacher' | 'external';
  };
  postLessonAdjustments: string; // BLANK when generating new
}

export interface IntegrationItem {
  id: string;
  type: 'NLS' | 'AI' | 'CDS' | 'ETHICS' | 'ATGT' | 'GDDP' | 'STEM' | 'ANQP' | 'HUMAN_RIGHTS' | 'CHILDREN_RIGHTS' | 'ENVIRONMENT' | 'WATER_PROTECTION' | 'CUSTOM';
  code?: string;
  wording: string;
  official_code?: string;
  official_wording?: string;
  custom_teacher_content?: string;
  isCustomLabel?: boolean;
  customLabelText?: string;
  domain?: string;
  componentCompetence?: string;
  level?: string;
  indicator?: string;
  stage?: string;
}

export interface MoveUpLessonMaster {
  id: number;
  grade: number;
  week: number;
  lesson_plan: string;
  source_periods: string;
  unit: string;
  lesson_title: string;
  pages: string;
  vocabulary: string | null;
  sentence_patterns: string | null;
  phonics: string | null;
  activities: string | null;
  learning_outcomes: string | null;
  integration_enabled: boolean;
  integration_mode: string;
  created_at?: string;
  updated_at?: string;
}

export interface LessonPlan {
  id?: string;
  teacher_id?: string;
  teaching_program_code: TeachingProgramCode;
  grade_level: number;
  unit_id?: string;
  lesson_id?: string;
  title: string;
  unit_title?: string;
  lesson_title?: string;
  week_number?: number;
  lesson_plan_label?: string;
  source_periods?: string;
  pages?: string;
  duration_minutes: number;
  publisher?: string;
  vocabulary: string[];
  sentence_patterns: string[];
  phonics?: string | null;
  vocabulary_text?: string | null;
  sentence_patterns_text?: string | null;
  learning_outcomes_text?: string | null;
  activities_text?: string | null;
  skills: string[]; // Listening, Speaking, Reading, Writing
  vocab_objective?: string;
  pattern_objective?: string;
  skills_objective?: string;
  competences_qualities_text: string;
  integrations: IntegrationItem[];
  teaching_aids: string[];
  procedures: ProcedureRow[];
  post_reflection: string;
  teacher_instructions?: string;
  videoMetadata?: {
    title: string;
    url: string;
    source: 'teacher' | 'external';
  };
  status?: 'DRAFT' | 'COMPLETED' | 'ARCHIVED';
  created_at?: string;
  updated_at?: string;
}

export interface ExtractedLessonInfo {
  gradeLevel?: number;
  programCode?: TeachingProgramCode;
  topic?: string;
  unitTitle?: string;
  lessonTitle?: string;
  durationMinutes?: number;
  vocabulary: string[];
  sentencePatterns: string[];
  skills: string[];
  activities: string[];
  otherInfo?: string;
}
