-- ============================================================
-- PATCH MIGRATION: SEED MASTER TEACHING PROGRAMS & SET PERMISSIONS
-- PROJECT: LESSON PLAN - GLOBAL SUCCESS
-- ============================================================

-- 1. Grant table access permissions for anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- 2. Insert master teaching programs configuration
INSERT INTO public.teaching_programs (code, name, description, publisher)
VALUES 
    ('GLOBAL_SUCCESS', 'Global Success', 'Official Primary English textbook series by Vietnam Education Publishing House', 'VIETNAM EDUCATION PUBLISHING HOUSE'),
    ('MOVE_UP', 'MOVE UP', 'Enhanced Primary English program', NULL),
    ('ENHANCED', 'Bài Dạy Tăng Cường', 'Teacher-designed supplementary English lessons', NULL),
    ('CUSTOM', 'Custom Lesson Plan', 'Teacher custom lesson plan from pasted text, images, or manual input', NULL)
ON CONFLICT (code) DO UPDATE 
SET name = EXCLUDED.name, description = EXCLUDED.description, publisher = EXCLUDED.publisher;
