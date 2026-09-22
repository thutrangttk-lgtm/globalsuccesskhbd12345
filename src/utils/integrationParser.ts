import { translateVietnameseIntegrationToEnglish, isVietnameseText } from './integrationTranslator';

export interface ParsedIntegrationItem {
  id: string;
  type: 'NLS' | 'AI' | 'CDS' | 'ETHICS' | 'ATGT' | 'GDDP' | 'STEM' | 'ANQP' | 'HUMAN_RIGHTS' | 'CHILDREN_RIGHTS' | 'ENVIRONMENT' | 'WATER_PROTECTION' | 'CUSTOM';
  label: string;
  code?: string;
  wording: string;
  activity: string;
  outcome: string;
  fullTitle: string;
}

export function parseAndStandardizeIntegrations(
  _nameExact?: string | null,
  codeExact?: string | null,
  detailExact?: string | null,
  vocabulary?: string[]
): ParsedIntegrationItem[] {
  if (!detailExact || detailExact.trim() === '') {
    return [];
  }

  // Split multi-integration strings by looking ahead for integration keywords or delimiters (||, \n, or Heading:)
  const rawBlocks = detailExact
    .split(/(?:\|\||\n|;(?=\s*(?:Đạo đức|AI|NLS|CĐS|CDS|ATGT|BVMT|GDĐP|STEM|ANQP|Quyền|Tích hợp AI)))|(?:(?<=\.)\s+(?=(?:Đạo đức|AI|NLS|CĐS|CDS|ATGT|BVMT|GDĐP|STEM|ANQP|Quyền|Tích hợp AI)(?:\s+[A-Z0-9\.\/]+)?:))/gi)
    .map(b => b.trim())
    .filter(Boolean);

  const fineBlocks: string[] = [];
  for (const block of rawBlocks) {
    const subMatches = block.split(/(?=(?:Đạo đức|AI\s+\d|NLS\s+\d|CĐS|CDS|ATGT|BVMT|GDĐP|STEM|ANQP|Quyền con người|Quyền trẻ em|Tích hợp AI):)/gi);
    subMatches.forEach(sm => {
      if (sm.trim()) fineBlocks.push(sm.trim());
    });
  }

  const resultItems: ParsedIntegrationItem[] = [];
  const seenWordings = new Set<string>();

  fineBlocks.forEach((block, idx) => {
    let type: ParsedIntegrationItem['type'] = 'CUSTOM';
    let label = '';

    if (/Đạo đức/i.test(block)) {
      type = 'ETHICS';
      label = 'Moral Education';
    } else if (/AI/i.test(block)) {
      type = 'AI';
      label = 'AI Education';
    } else if (/NLS/i.test(block)) {
      type = 'NLS';
      label = 'Digital Competence (NLS)';
    } else if (/CĐS|CDS/i.test(block)) {
      type = 'CDS';
      label = 'Digital Transformation';
    } else if (/ATGT|giao thông/i.test(block)) {
      type = 'ATGT';
      label = 'Traffic Safety Education';
    } else if (/BVMT|môi trường/i.test(block)) {
      type = 'ENVIRONMENT';
      label = 'Environmental Protection';
    } else if (/nguồn nước/i.test(block)) {
      type = 'WATER_PROTECTION';
      label = 'Water Resource Protection';
    } else if (/GDĐP|địa phương/i.test(block)) {
      type = 'GDDP';
      label = 'Local Education';
    } else if (/STEM/i.test(block)) {
      type = 'STEM';
      label = 'STEM Education';
    } else if (/ANQP/i.test(block)) {
      type = 'ANQP';
      label = 'National Defence and Security Education';
    } else if (/Quyền con người/i.test(block)) {
      type = 'HUMAN_RIGHTS';
      label = 'Human Rights Education';
    } else if (/Quyền trẻ em/i.test(block)) {
      type = 'CHILDREN_RIGHTS';
      label = "Children's Rights Education";
    } else {
      type = 'CUSTOM';
      label = 'Educational Integration';
    }

    // Code is ONLY attached if the block actually owns the code (AI or NLS)
    let code: string | undefined = undefined;
    if (type === 'AI' || type === 'NLS') {
      const codeMatch = block.match(/(AI\s+[\w\.\/]+|NLS\s+[\w\.\/]+)/i) || (codeExact ? [codeExact, codeExact] : null);
      if (codeMatch) {
        code = codeMatch[1].trim();
      }
    }

    // Extract target words inside quotes e.g. "pasta"
    const quoteMatches = block.match(/[“"']([^”"']+)[”"']/g);
    let targetWords = quoteMatches
      ? quoteMatches.map(q => q.replace(/^[“"'`\s]+|[”"'`\s]+$/g, '').trim()).filter(Boolean).join(', ')
      : (vocabulary && vocabulary.length > 0 ? vocabulary.slice(0, 3).join(', ') : '');

    let wording = '';
    let activity = '';
    let outcome = '';

    // If block contains specific Vietnamese sentence details after colon
    const detailPart = block.includes(':') ? block.split(':').slice(1).join(':').trim() : block;

    if (isVietnameseText(detailPart) && type === 'CUSTOM') {
      wording = translateVietnameseIntegrationToEnglish(detailPart, { vocabulary });
      activity = `Participate in integrated classroom activity: ${wording}`;
      outcome = wording;
    } else if (type === 'ETHICS') {
      if (isVietnameseText(detailPart) && detailPart.length > 8) {
        wording = translateVietnameseIntegrationToEnglish(detailPart, { vocabulary });
      } else {
        wording = 'Practise politeness, self-discipline, and respect for others.';
      }
      activity = 'Practise polite and respectful interaction with classmates.';
      outcome = 'Show politeness and respect when interacting with classmates.';
    } else if (type === 'AI') {
      const wordStr = targetWords ? `“${targetWords}”` : 'target vocabulary';
      if (/nhận diện hình ảnh/i.test(block)) {
        wording = `Use an AI tool to recognize visual objects related to ${wordStr}.`;
        activity = `Use an AI image recognition tool for ${wordStr}.`;
        outcome = `Recognize visual objects related to ${wordStr} using AI feedback.`;
      } else if (/chatbot/i.test(block)) {
        wording = 'Use an AI chatbot to practise listening and repeating sentence patterns.';
        activity = 'Practise speaking with an AI chatbot tool.';
        outcome = 'Repeat target sentence patterns accurately with AI chatbot practice.';
      } else {
        wording = `Use an AI tool to practise listening to and pronouncing ${wordStr}.`;
        activity = `Practise the pronunciation of ${wordStr} with AI-supported feedback.`;
        outcome = `Pronounce ${wordStr} more accurately with AI-supported feedback.`;
      }
    } else if (type === 'NLS') {
      if (/định danh|bảo vệ bản thân|thông tin cá nhân/i.test(block)) {
        wording = 'Practise protecting personal information in a guided digital activity.';
        activity = 'Practise protecting personal information in a guided digital activity.';
        outcome = 'Identify a simple way to protect personal information.';
      } else if (/tạo và chỉnh sửa/i.test(block)) {
        wording = 'Create and edit simple digital content using guided educational software.';
        activity = 'Create simple digital content in a guided learning activity.';
        outcome = 'Create and edit simple digital learning content.';
      } else {
        wording = 'Select and use teacher-approved digital resources during lesson practice.';
        activity = 'Select and use teacher-approved digital resources during lesson practice.';
        outcome = 'Select and use simple digital learning resources effectively.';
      }
    } else if (type === 'CDS') {
      wording = 'Use basic smartphone functions to record pronunciation and submit assignments.';
      activity = 'Use smartphone voice recording functions for speaking practice.';
      outcome = 'Record and submit speaking assignments using digital tools.';
    } else if (type === 'ATGT') {
      if (isVietnameseText(detailPart) && detailPart.length > 8) {
        wording = translateVietnameseIntegrationToEnglish(detailPart, { vocabulary });
      } else {
        wording = 'Identify safe traffic behaviors and road safety practices during daily commute.';
      }
      activity = 'Discuss safe traffic behaviors and road safety practices.';
      outcome = 'Demonstrate awareness of basic traffic safety rules.';
    } else if (type === 'ENVIRONMENT') {
      if (isVietnameseText(detailPart) && detailPart.length > 8) {
        wording = translateVietnameseIntegrationToEnglish(detailPart, { vocabulary });
      } else {
        wording = 'Demonstrate environmental awareness and habits for keeping surroundings clean.';
      }
      activity = 'Discuss eco-friendly habits and environmental protection actions.';
      outcome = 'Demonstrate environmental awareness during daily school activities.';
    } else if (type === 'WATER_PROTECTION') {
      if (isVietnameseText(detailPart) && detailPart.length > 8) {
        wording = translateVietnameseIntegrationToEnglish(detailPart, { vocabulary });
      } else {
        wording = 'Discuss clean water conservation habits in daily school life.';
      }
      activity = 'Discuss clean water conservation habits.';
      outcome = 'Identify practical ways to save clean water at school.';
    } else if (type === 'GDDP') {
      wording = 'Relate target vocabulary to local community contexts and familiar surroundings.';
      activity = 'Relate target vocabulary to local community contexts.';
      outcome = 'Identify local community contexts related to target vocabulary.';
    } else if (type === 'STEM') {
      wording = 'Organize, observe, and classify target vocabulary cards using structured visual tools.';
      activity = 'Classify target vocabulary items using visual graphic organizers.';
      outcome = 'Classify target language items accurately using STEM graphic tools.';
    } else if (type === 'ANQP') {
      wording = 'Demonstrate discipline, teamwork, and solidarity during group activities.';
      activity = 'Participate in group tasks with discipline and active teamwork.';
      outcome = 'Demonstrate discipline and cooperative spirit in group work.';
    } else if (type === 'HUMAN_RIGHTS' || type === 'CHILDREN_RIGHTS') {
      wording = "Recognize children's rights to participate, learn, and play in a safe environment.";
      activity = "Discuss children's right to participate and learn.";
      outcome = "Express awareness of children's rights to learn and play safely.";
    } else {
      wording = isVietnameseText(detailPart) ? translateVietnameseIntegrationToEnglish(detailPart, { vocabulary }) : 'Apply target language in integrated learning activities.';
      activity = 'Complete integrated learning activity with peers.';
      outcome = 'Demonstrate target integration competency effectively.';
    }

    const fullTitle = `${label}${code ? ` [${code}]` : ''}`;
    const dedupeKey = `${type}:${wording.toLowerCase().trim()}`;

    if (!seenWordings.has(dedupeKey)) {
      seenWordings.add(dedupeKey);
      resultItems.push({
        id: `int_master_${idx + 1}`,
        type,
        label,
        code,
        wording,
        activity,
        outcome,
        fullTitle
      });
    }
  });

  return resultItems;
}
