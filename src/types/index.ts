export type Role = 'teacher' | 'admin';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  school_name: string;
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

export interface ProcedureRow {
  id: string;
  stageName: string; // Warm-up, Presentation, Practice, Production, Consolidation, Wrap-up
  teacherActivities: string[];
  pupilActivities: string[];
  expectedOutcome: string;
  evidence: string;
  integrationCode?: string;
  integrationLabel?: string;
  postLessonAdjustments: string; // BLANK when generating new
}

export interface IntegrationItem {
  id: string;
  type: 'NLS' | 'AI' | 'CDS' | 'ETHICS' | 'ATGT' | 'GDDP' | 'STEM' | 'ANQP' | 'HUMAN_RIGHTS' | 'CHILDREN_RIGHTS' | 'ENVIRONMENT' | 'WATER_PROTECTION';
  code?: string;
  wording: string;
  domain?: string;
  componentCompetence?: string;
  level?: string;
  indicator?: string;
  stage?: string;
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
  duration_minutes: number;
  publisher?: string;
  vocabulary: string[];
  sentence_patterns: string[];
  skills: string[]; // Listening, Speaking, Reading, Writing
  competences_qualities_text: string;
  integrations: IntegrationItem[];
  teaching_aids: string[];
  procedures: ProcedureRow[];
  post_reflection: string;
  teacher_instructions?: string;
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
