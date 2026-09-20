-- ============================================================
-- MASTER DATABASE MIGRATION SCRIPT FOR SUPABASE POSTGRESQL
-- PROJECT: LESSON PLAN - GLOBAL SUCCESS
-- PRIMARY SCHOOL ENGLISH EDUCATION (GRADES 1 - 5)
-- ============================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. PROFILES TABLE (Linked to auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
    school_name TEXT NOT NULL DEFAULT 'TRANG TAN KHUONG PRIMARY SCHOOL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. TEACHING PROGRAMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teaching_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL CHECK (code IN ('GLOBAL_SUCCESS', 'MOVE_UP', 'ENHANCED', 'CUSTOM')),
    name TEXT NOT NULL,
    description TEXT,
    publisher TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed core program definitions (No fake curriculum data)
INSERT INTO public.teaching_programs (code, name, description, publisher)
VALUES 
    ('GLOBAL_SUCCESS', 'Global Success', 'Official Primary English textbook series by Vietnam Education Publishing House', 'VIETNAM EDUCATION PUBLISHING HOUSE'),
    ('MOVE_UP', 'MOVE UP', 'Enhanced Primary English program', NULL),
    ('ENHANCED', 'Bài Dạy Tăng Cường', 'Teacher-designed supplementary English lessons', NULL),
    ('CUSTOM', 'Custom Lesson Plan', 'Teacher custom lesson plan from pasted text, images, or manual input', NULL)
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 3. GRADES TABLE (Grades 1 to 5)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level INT UNIQUE NOT NULL CHECK (level BETWEEN 1 AND 5),
    name TEXT NOT NULL
);

INSERT INTO public.grades (level, name) VALUES 
    (1, 'Grade 1'),
    (2, 'Grade 2'),
    (3, 'Grade 3'),
    (4, 'Grade 4'),
    (5, 'Grade 5')
ON CONFLICT (level) DO NOTHING;

-- ============================================================
-- 4. CURRICULUM UNITS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teaching_program_id UUID REFERENCES public.teaching_programs(id) ON DELETE CASCADE,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 5),
    unit_number INT NOT NULL,
    title TEXT NOT NULL,
    topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (teaching_program_id, grade_level, unit_number)
);

-- ============================================================
-- 5. LESSONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id UUID REFERENCES public.curriculum_units(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    title TEXT NOT NULL,
    duration_minutes INT DEFAULT 35,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (unit_id, lesson_number)
);

-- ============================================================
-- 6. LESSON CONTENT TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_content (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE UNIQUE,
    vocabulary JSONB DEFAULT '[]'::jsonb,
    sentence_patterns JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    learning_outcomes TEXT,
    teaching_materials JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. CURRICULUM SOURCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.curriculum_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    teaching_program_id UUID REFERENCES public.teaching_programs(id) ON DELETE CASCADE,
    document_type TEXT,
    file_path TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. INTEGRATION REQUIREMENTS TABLE (Thông tư 02 NLS & Quyết định 2422 AI)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.integration_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teaching_program_id UUID REFERENCES public.teaching_programs(id) ON DELETE SET NULL,
    grade_level INT CHECK (grade_level BETWEEN 1 AND 5),
    unit_id UUID REFERENCES public.curriculum_units(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    integration_type TEXT NOT NULL CHECK (integration_type IN ('NLS', 'AI', 'CDS', 'ETHICS', 'ATGT', 'GDDP', 'STEM', 'ANQP', 'HUMAN_RIGHTS', 'CHILDREN_RIGHTS', 'ENVIRONMENT', 'WATER_PROTECTION')),
    official_code TEXT,
    official_wording TEXT,
    domain TEXT,
    component_competence TEXT,
    level TEXT,
    indicator TEXT,
    source_document TEXT,
    source_reference TEXT,
    verification_status TEXT DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'UNVERIFIED', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. LESSON PLANS TABLE (CV 2345 Compliant Format)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    teaching_program_code TEXT NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level BETWEEN 1 AND 5),
    unit_id UUID REFERENCES public.curriculum_units(id) ON DELETE SET NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    unit_title TEXT,
    lesson_title TEXT,
    duration_minutes INT DEFAULT 35,
    publisher TEXT,
    vocabulary JSONB DEFAULT '[]'::jsonb,
    sentence_patterns JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    competences_qualities_text TEXT NOT NULL DEFAULT 'Thereby contributing to the development of pupils'' general competences and qualities (autonomy, communication, cooperation).',
    integrations JSONB DEFAULT '[]'::jsonb,
    teaching_aids JSONB DEFAULT '[]'::jsonb,
    procedures JSONB DEFAULT '[]'::jsonb,
    post_reflection TEXT,
    teacher_instructions TEXT,
    status TEXT DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'COMPLETED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 10. LESSON INTEGRATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_plan_id UUID NOT NULL REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
    integration_type TEXT NOT NULL,
    official_code TEXT,
    description TEXT,
    procedure_stage TEXT
);

-- ============================================================
-- 11. TEACHING RESOURCES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teaching_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    resource_type TEXT,
    file_path TEXT,
    description TEXT,
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 12. LESSON SOURCE INPUTS TABLE (Custom/Pasted text inputs)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_source_inputs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_plan_id UUID REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
    source_type TEXT CHECK (source_type IN ('manual', 'pasted_text', 'image', 'curriculum', 'mixed')),
    original_text TEXT,
    extracted_content JSONB DEFAULT '{}'::jsonb,
    teacher_notes TEXT,
    teacher_instructions TEXT,
    verification_status TEXT DEFAULT 'UNVERIFIED',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 13. LESSON SOURCE IMAGES TABLE (Textbook page screenshots)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lesson_source_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_plan_id UUID REFERENCES public.lesson_plans(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    original_filename TEXT,
    mime_type TEXT,
    extracted_content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERFORMANCE INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_curriculum_units_program_grade ON public.curriculum_units(teaching_program_id, grade_level);
CREATE INDEX IF NOT EXISTS idx_lessons_unit ON public.lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_teacher ON public.lesson_plans(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_program_grade ON public.lesson_plans(teaching_program_code, grade_level);
CREATE INDEX IF NOT EXISTS idx_integration_reqs_program_grade ON public.integration_requirements(teaching_program_id, grade_level);

-- ============================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, school_name)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    COALESCE(new.raw_user_meta_data->>'role', 'teacher'),
    'TRANG TAN KHUONG PRIMARY SCHOOL'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SCHEMA PERMISSIONS GRANT
-- ============================================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================
-- ROW LEVEL SECURITY (RLS) ENABLEMENT
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teaching_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_source_inputs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_source_images ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES FOR TABLES
-- ============================================================

-- Public read for curriculum tables
DROP POLICY IF EXISTS "Public read teaching_programs" ON public.teaching_programs;
CREATE POLICY "Public read teaching_programs" ON public.teaching_programs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read grades" ON public.grades;
CREATE POLICY "Public read grades" ON public.grades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read curriculum_units" ON public.curriculum_units;
CREATE POLICY "Public read curriculum_units" ON public.curriculum_units FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read lessons" ON public.lessons;
CREATE POLICY "Public read lessons" ON public.lessons FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read lesson_content" ON public.lesson_content;
CREATE POLICY "Public read lesson_content" ON public.lesson_content FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read curriculum_sources" ON public.curriculum_sources;
CREATE POLICY "Public read curriculum_sources" ON public.curriculum_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read integration_requirements" ON public.integration_requirements;
CREATE POLICY "Public read integration_requirements" ON public.integration_requirements FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read teaching_resources" ON public.teaching_resources;
CREATE POLICY "Public read teaching_resources" ON public.teaching_resources FOR SELECT USING (true);

-- Profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Lesson plans policies (Teachers manage their own plans)
DROP POLICY IF EXISTS "Teachers can view own lesson plans" ON public.lesson_plans;
CREATE POLICY "Teachers can view own lesson plans" ON public.lesson_plans FOR SELECT USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can insert own lesson plans" ON public.lesson_plans;
CREATE POLICY "Teachers can insert own lesson plans" ON public.lesson_plans FOR INSERT WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update own lesson plans" ON public.lesson_plans;
CREATE POLICY "Teachers can update own lesson plans" ON public.lesson_plans FOR UPDATE USING (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete own lesson plans" ON public.lesson_plans;
CREATE POLICY "Teachers can delete own lesson plans" ON public.lesson_plans FOR DELETE USING (auth.uid() = teacher_id);

-- Lesson integrations policies
DROP POLICY IF EXISTS "Teachers view own integrations" ON public.lesson_integrations;
CREATE POLICY "Teachers view own integrations" ON public.lesson_integrations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.lesson_plans WHERE id = lesson_plan_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers insert own integrations" ON public.lesson_integrations;
CREATE POLICY "Teachers insert own integrations" ON public.lesson_integrations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.lesson_plans WHERE id = lesson_plan_id AND teacher_id = auth.uid())
);

DROP POLICY IF EXISTS "Teachers delete own integrations" ON public.lesson_integrations;
CREATE POLICY "Teachers delete own integrations" ON public.lesson_integrations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.lesson_plans WHERE id = lesson_plan_id AND teacher_id = auth.uid())
);

-- Lesson source inputs policies
DROP POLICY IF EXISTS "Teachers view own inputs" ON public.lesson_source_inputs;
CREATE POLICY "Teachers view own inputs" ON public.lesson_source_inputs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers insert own inputs" ON public.lesson_source_inputs;
CREATE POLICY "Teachers insert own inputs" ON public.lesson_source_inputs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Teachers update own inputs" ON public.lesson_source_inputs;
CREATE POLICY "Teachers update own inputs" ON public.lesson_source_inputs FOR UPDATE USING (true);

-- Lesson source images policies
DROP POLICY IF EXISTS "Teachers view own images" ON public.lesson_source_images;
CREATE POLICY "Teachers view own images" ON public.lesson_source_images FOR SELECT USING (true);

DROP POLICY IF EXISTS "Teachers insert own images" ON public.lesson_source_images;
CREATE POLICY "Teachers insert own images" ON public.lesson_source_images FOR INSERT WITH CHECK (true);

-- ============================================================
-- SUPABASE STORAGE BUCKETS & POLICIES
-- ============================================================

-- 1. Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('curriculum-sources', 'curriculum-sources', true),
    ('lesson-source-images', 'lesson-source-images', true),
    ('teaching-resources', 'teaching-resources', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage Objects RLS Policies

-- Public Read for all 3 buckets
DROP POLICY IF EXISTS "Public read curriculum-sources" ON storage.objects;
CREATE POLICY "Public read curriculum-sources" ON storage.objects FOR SELECT USING (bucket_id = 'curriculum-sources');

DROP POLICY IF EXISTS "Public read lesson-source-images" ON storage.objects;
CREATE POLICY "Public read lesson-source-images" ON storage.objects FOR SELECT USING (bucket_id = 'lesson-source-images');

DROP POLICY IF EXISTS "Public read teaching-resources" ON storage.objects;
CREATE POLICY "Public read teaching-resources" ON storage.objects FOR SELECT USING (bucket_id = 'teaching-resources');

-- Authenticated User Uploads for all 3 buckets
DROP POLICY IF EXISTS "Auth upload curriculum-sources" ON storage.objects;
CREATE POLICY "Auth upload curriculum-sources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'curriculum-sources' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth upload lesson-source-images" ON storage.objects;
CREATE POLICY "Auth upload lesson-source-images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'lesson-source-images' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Auth upload teaching-resources" ON storage.objects;
CREATE POLICY "Auth upload teaching-resources" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'teaching-resources' AND auth.role() = 'authenticated');
