import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  TableLayoutType
} from 'docx';
import { saveAs } from 'file-saver';
import type { LessonPlan } from '../types';

export const exportToWord = async (plan: LessonPlan) => {
  const isGlobalSuccess = plan.teaching_program_code === 'GLOBAL_SUCCESS';
  const isMoveUp = plan.teaching_program_code === 'MOVE_UP';
  
  let programTitle = 'GLOBAL SUCCESS';
  if (isMoveUp) programTitle = 'MOVE UP';
  else if (plan.teaching_program_code === 'ENHANCED') programTitle = 'ENHANCED ENGLISH';
  else if (plan.teaching_program_code === 'CUSTOM') programTitle = 'CUSTOM LESSON PLAN';

  const mainTitleText = `LESSON PLAN GRADE ${plan.grade_level} - ${programTitle}`;

  // Institutional Header Paragraphs
  const headerLines = [
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "HIEP PHUOC COMMUNE PEOPLE'S COMMITTEE",
          font: "Times New Roman",
          size: 26, // 13pt
          bold: true,
          color: "000000"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "TRANG TAN KHUONG PRIMARY SCHOOL",
          font: "Times New Roman",
          size: 26, // 13pt
          bold: true,
          color: "000000"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 240 },
      children: [
        new TextRun({
          text: "TEACHER: TRAN THI THU TRANG",
          font: "Times New Roman",
          size: 26, // 13pt
          bold: true,
          color: "000000"
        })
      ]
    })
  ];

  // Main Title Paragraph
  const mainTitleParagraph = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [
      new TextRun({
        text: mainTitleText,
        font: "Times New Roman",
        size: 32, // 16pt
        bold: true,
        color: "1F4E78" // Dark Blue #1F4E78
      })
    ]
  });

  // Publisher Paragraph (only if Global Success or explicitly defined publisher)
  const publisherParagraphs: Paragraph[] = [];
  if (isGlobalSuccess || plan.publisher === 'VIETNAM EDUCATION PUBLISHING HOUSE') {
    publisherParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [
          new TextRun({
            text: "VIETNAM EDUCATION PUBLISHING HOUSE",
            font: "Times New Roman",
            size: 26, // 13pt
            bold: true,
            color: "000000"
          })
        ]
      })
    );
  }

  // Helper formatters
  const formatUnitHeader = (unitTitle?: string): string => {
    if (!unitTitle) return 'UNIT 1';
    let clean = unitTitle.trim();
    if (!clean.toUpperCase().startsWith('UNIT')) {
      clean = `UNIT: ${clean}`;
    }
    return clean.toUpperCase();
  };

  const formatLessonHeader = (lessonTitle?: string, lessonId?: string): string => {
    if (lessonTitle) {
      const match = lessonTitle.match(/Lesson\s*(\d+)/i);
      if (match) return `LESSON ${match[1]}`;
    }
    if (lessonId) {
      const match = lessonId.match(/\d+/);
      if (match) return `LESSON ${match[0]}`;
    }
    return 'LESSON 1';
  };

  // Lesson Identification (Center Aligned and Bold 4 lines header)
  const lessonIdParagraphs = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: formatUnitHeader(plan.unit_title),
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: "1F4E78"
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: formatLessonHeader(plan.lesson_title, plan.lesson_id),
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: "1F4E78"
        }),
        new TextRun({
          text: ` (Duration: ${plan.duration_minutes || 35} minutes)`,
          font: "Times New Roman",
          size: 28, // 14pt
          bold: false,
          color: "000000"
        })
      ]
    })
  ];

  // Helper function for Heading 1 (Dark Blue 14pt Bold Uppercase)
  const createHeading1 = (text: string) =>
    new Paragraph({
      spacing: { before: 240, after: 120 },
      children: [
        new TextRun({
          text,
          font: "Times New Roman",
          size: 28, // 14pt
          bold: true,
          color: "1F4E78"
        })
      ]
    });

  // Helper function for Heading 2 (Green 13pt Bold)
  const createHeading2 = (text: string) =>
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({
          text,
          font: "Times New Roman",
          size: 26, // 13pt
          bold: true,
          color: "548235" // Green #548235
        })
      ]
    });

  // Helper function for Normal Body Paragraph (Times New Roman 13pt)
  const createBodyParagraph = (text: string, boldPrefix = "", isBullet = false) =>
    new Paragraph({
      spacing: { after: 80 },
      bullet: isBullet ? { level: 0 } : undefined,
      children: [
        ...(boldPrefix ? [new TextRun({ text: boldPrefix, font: "Times New Roman", size: 26, bold: true })] : []),
        new TextRun({ text, font: "Times New Roman", size: 26 })
      ]
    });

  // I. OBJECTIVES
  const objectivesHeading = createHeading1("I. OBJECTIVES");
  const objectivesIntro = createBodyParagraph("By the end of the lesson, pupils will be able to:");

  // 1. Language Knowledge & Skills
  const langHeading = createHeading2("1. Language Knowledge & Skills");
  const vocabParagraph = createBodyParagraph(
    plan.vocabulary.length > 0 ? plan.vocabulary.join(', ') : 'N/A',
    "Vocabulary: "
  );
  const patternParagraph = createBodyParagraph(
    plan.sentence_patterns.length > 0 ? plan.sentence_patterns.join('; ') : 'N/A',
    "Sentence Patterns: "
  );
  const skillsParagraph = createBodyParagraph(
    plan.skills.length > 0 ? plan.skills.join(', ') : 'Listening, Speaking',
    "Skills: "
  );

  // 2. Core / General Competences and Qualities (EXACT SENTENCE)
  const competencesHeading = createHeading2("2. Core / General Competences and Qualities");
  const competencesBody = createBodyParagraph(
    plan.competences_qualities_text || "Thereby contributing to the development of pupils' general competences and qualities (autonomy, communication, cooperation)."
  );

  // 3. Integration
  const integrationHeading = createHeading2("3. Integration");
  const integrationParagraphs: Paragraph[] = [];
  if (plan.integrations && plan.integrations.length > 0) {
    plan.integrations.forEach(item => {
      const codeStr = item.code ? ` [${item.code}]` : '';
      integrationParagraphs.push(
        createBodyParagraph(`${item.type}${codeStr}: ${item.wording}`, undefined, true)
      );
    });
  } else {
    integrationParagraphs.push(createBodyParagraph("No specific integration identified for this lesson."));
  }

  // II. TEACHING AIDS AND LEARNING MATERIALS
  const materialsHeading = createHeading1("II. TEACHING AIDS AND LEARNING MATERIALS");
  const materialsParagraphs: Paragraph[] = [];
  if (plan.teaching_aids && plan.teaching_aids.length > 0) {
    plan.teaching_aids.forEach(aid => {
      materialsParagraphs.push(createBodyParagraph(aid, undefined, true));
    });
  } else {
    materialsParagraphs.push(createBodyParagraph("Global Success textbook, Teacher's Book, audio tracks, flashcards, interactive board.", undefined, true));
  }

  // III. TEACHING PROCEDURES
  const proceduresHeading = createHeading1("III. TEACHING PROCEDURES");

  const tableHeaderRow = new TableRow({
    tableHeader: true,
    children: [
      new TableCell({
        width: { size: 43, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Learning Activities", font: "Times New Roman", size: 26, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: 37, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Expected Outcomes & Evidence", font: "Times New Roman", size: 26, bold: true })]
          })
        ]
      }),
      new TableCell({
        width: { size: 20, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: "Post-Lesson Adjustments", font: "Times New Roman", size: 26, bold: true })]
          })
        ]
      })
    ]
  });

  const procedureRows = (plan.procedures || []).map(proc => {
    const teacherActs = proc.teacherActivities || [];
    const pupilActs = proc.pupilActivities || [];

    const col1Children: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: `* ${proc.stageName || 'Activity'}`, font: "Times New Roman", size: 26, bold: true, color: "1F4E78" })],
        spacing: { after: 60 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Teacher's activities:", font: "Times New Roman", size: 26, bold: true })],
        spacing: { after: 40 }
      }),
      ...teacherActs.map(act => new Paragraph({
        children: [new TextRun({ text: `- ${act}`, font: "Times New Roman", size: 26 })],
        spacing: { after: 40 }
      })),
      new Paragraph({
        children: [new TextRun({ text: "Pupils' activities:", font: "Times New Roman", size: 26, bold: true })],
        spacing: { before: 60, after: 40 }
      }),
      ...pupilActs.map(act => new Paragraph({
        children: [new TextRun({ text: `- ${act}`, font: "Times New Roman", size: 26 })],
        spacing: { after: 40 }
      }))
    ];

    const col2Children: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: "Expected Outcome:", font: "Times New Roman", size: 26, bold: true })],
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({ text: proc.expectedOutcome || "Pupils participate actively and master lesson content.", font: "Times New Roman", size: 26 })],
        spacing: { after: 60 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Evidence:", font: "Times New Roman", size: 26, bold: true })],
        spacing: { after: 40 }
      }),
      new Paragraph({
        children: [new TextRun({ text: proc.evidence || "Pupils perform task accurately and answer questions.", font: "Times New Roman", size: 26 })],
        spacing: { after: 60 }
      })
    ];

    if (proc.integrationCode || proc.integrationLabel) {
      col2Children.push(
        new Paragraph({
          children: [new TextRun({ text: "Integration:", font: "Times New Roman", size: 26, bold: true, color: "548235" })],
          spacing: { before: 40, after: 20 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `${proc.integrationLabel || 'NLS'} [${proc.integrationCode || ''}]`, font: "Times New Roman", size: 26, italics: true })],
          spacing: { after: 40 }
        })
      );
    }

    const col3Children: Paragraph[] = [
      new Paragraph({
        children: [new TextRun({ text: proc.postLessonAdjustments || "", font: "Times New Roman", size: 26 })]
      })
    ];

    return new TableRow({
      children: [
        new TableCell({ width: { size: 43, type: WidthType.PERCENTAGE }, children: col1Children }),
        new TableCell({ width: { size: 37, type: WidthType.PERCENTAGE }, children: col2Children }),
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: col3Children })
      ]
    });
  });

  const proceduresTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [tableHeaderRow, ...procedureRows]
  });

  // POST-REFLECTION
  const reflectionHeading = createHeading1("POST-REFLECTION");
  const reflectionBody = createBodyParagraph(
    plan.post_reflection || "Pupils participated actively in the pair-work activity and used the target sentence pattern confidently. Some pupils still had difficulty pronouncing the new words. More pronunciation practice should be provided next time."
  );

  // FINAL SIGNATURE SECTION (Side by side)
  const signatureTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "auto" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
      left: { style: BorderStyle.NONE, size: 0, color: "auto" },
      right: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 720 },
                children: [
                  new TextRun({ text: "BAN GIÁM HIỆU", font: "Times New Roman", size: 26, bold: true })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Trương Thị Lệ Hằng", font: "Times New Roman", size: 26, bold: true })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 240, after: 720 },
                children: [
                  new TextRun({ text: "TỔ TRƯỜNG", font: "Times New Roman", size: 26, bold: true })
                ]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Nguyễn Thị Ngà", font: "Times New Roman", size: 26, bold: true })
                ]
              })
            ]
          })
        ]
      })
    ]
  });

  // Assemble document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          ...headerLines,
          mainTitleParagraph,
          ...publisherParagraphs,
          ...lessonIdParagraphs,
          objectivesHeading,
          objectivesIntro,
          langHeading,
          vocabParagraph,
          patternParagraph,
          skillsParagraph,
          competencesHeading,
          competencesBody,
          integrationHeading,
          ...integrationParagraphs,
          materialsHeading,
          ...materialsParagraphs,
          proceduresHeading,
          proceduresTable,
          new Paragraph({ spacing: { after: 200 } }),
          reflectionHeading,
          reflectionBody,
          new Paragraph({ spacing: { after: 300 } }),
          signatureTable
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = getExportFileName(plan, 'docx');
  saveAs(blob, fileName);
};

export function getExportFileName(plan: LessonPlan, ext: 'docx' | 'pdf' = 'docx'): string {
  const grade = plan.grade_level || 1;

  let unitNum: number | null = null;
  if (plan.unit_title) {
    const match = plan.unit_title.match(/UNIT\s*(\d+)/i);
    if (match) unitNum = parseInt(match[1], 10);
  }
  if (unitNum === null && plan.unit_id) {
    const match = plan.unit_id.match(/(\d+)/);
    if (match) unitNum = parseInt(match[1], 10);
  }

  let lessonNum: number | null = null;
  if (plan.lesson_title) {
    const match = plan.lesson_title.match(/LESSON\s*(\d+)/i) || plan.lesson_title.match(/Lesson\s*(\d+)/i);
    if (match) lessonNum = parseInt(match[1], 10);
  }
  if (lessonNum === null && plan.lesson_id) {
    const match = plan.lesson_id.match(/(\d+)/);
    if (match) lessonNum = parseInt(match[1], 10);
  }

  if (unitNum !== null && lessonNum !== null) {
    return `KHBD_Grade${grade}_Unit${unitNum}_Lesson${lessonNum}.${ext}`;
  }

  let labelStr = '';
  if (plan.lesson_title) {
    labelStr = plan.lesson_title;
  } else if (plan.unit_title) {
    labelStr = plan.unit_title;
  } else if (plan.title) {
    labelStr = plan.title;
  } else {
    labelStr = 'Lesson';
  }

  const sanitizedLabel = labelStr.replace(/[^a-zA-Z0-9]/g, '');
  return `KHBD_Grade${grade}_${sanitizedLabel || 'Lesson'}.${ext}`;
}
