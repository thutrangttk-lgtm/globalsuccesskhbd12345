import { supabase } from '../lib/supabase';

export interface MatchedVideoResult {
  title: string;
  url: string;
  source: 'teacher' | 'external';
}

/**
 * Searches YouTube resources for a genuinely relevant video for the lesson.
 * Priority 1: Teacher's saved YouTube channel (profiles.youtube_channel_url).
 * Priority 2: External educational YouTube resources (ONLY IF allowExternalYoutube === true).
 * Returns exact video metadata if found, or null if no relevant video exists.
 */
export async function findTeacherChannelVideo(params: {
  teacherId?: string;
  youtubeChannelUrl?: string;
  allowExternalYoutube?: boolean;
  gradeLevel: number;
  unitNumber?: number;
  unitTitle?: string;
  topic?: string;
  lessonTitle?: string;
  vocabulary?: string[];
}): Promise<MatchedVideoResult | null> {
  const channelUrl = (params.youtubeChannelUrl || '').trim();
  const hasValidChannel = channelUrl.startsWith('http://') || channelUrl.startsWith('https://');

  if (!supabase) return null;

  try {
    const { data: resources } = await supabase
      .from('teaching_resources')
      .select('*')
      .or(`resource_type.eq.video,resource_type.eq.youtube,resource_type.eq.channel_video,resource_type.eq.external_youtube`);

    if (resources && resources.length > 0) {
      const searchTerms = [
        `grade ${params.gradeLevel}`,
        params.unitTitle,
        params.topic,
        ...(params.vocabulary || [])
      ].filter(Boolean).map(t => String(t).toLowerCase());

      // Priority 1: Teacher's own channel resources
      if (hasValidChannel) {
        const teacherResources = resources.filter(r => {
          if (params.teacherId && r.uploaded_by === params.teacherId) return true;
          if (r.description && r.description.includes(channelUrl)) return true;
          if (r.file_path && r.file_path.includes(channelUrl)) return true;
          return false;
        });

        const teacherMatched = teacherResources.find(res => {
          const text = `${res.title} ${res.description || ''}`.toLowerCase();
          return searchTerms.some(term => term.length > 3 && text.includes(term));
        });

        if (teacherMatched && teacherMatched.title) {
          return {
            title: teacherMatched.title,
            url: teacherMatched.file_path || channelUrl,
            source: 'teacher'
          };
        }
      }

      // Priority 2: External educational YouTube resources (ONLY IF allowExternalYoutube === true)
      if (params.allowExternalYoutube) {
        const externalResources = resources.filter(r => {
          return r.resource_type === 'external_youtube' || (r.description && r.description.includes('External'));
        });

        const externalMatched = externalResources.find(res => {
          const text = `${res.title} ${res.description || ''}`.toLowerCase();
          return searchTerms.some(term => term.length > 3 && text.includes(term));
        });

        if (externalMatched && externalMatched.title) {
          return {
            title: externalMatched.title,
            url: externalMatched.file_path || 'https://www.youtube.com/c/SuperSimpleSongs',
            source: 'external'
          };
        }
      }
    }
  } catch (err) {
    console.warn('Error querying video resources:', err);
  }

  return null;
}
