import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  AlignmentType, 
  Table, 
  TableRow, 
  TableCell, 
  BorderStyle, 
  WidthType,
  ISectionOptions
} from 'docx';
import { Resume } from '../types';

function cleanMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/#{1,6}\s+(.*)/g, "$1")
    .replace(/^[*-]\s+/gm, "• ")
    .trim();
}

/**
 * Redesigned generateDocx to be template-aware and follow alignment rules
 */
export async function generateDocx(resume: Resume) {
  const { personalInfo, sections, styling, templateId } = resume;
  const primaryColor = styling?.primaryColor || '#4f46e5';
  
  const children: any[] = [];

  // 1. Header Logic
  if (templateId === 'professional') {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.fullName.toUpperCase(),
            bold: true,
            size: 32,
            color: primaryColor,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`,
            size: 20,
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          bottom: { color: primaryColor, space: 1, size: 12, style: BorderStyle.SINGLE },
        },
        spacing: { after: 400 },
      })
    );
  } else if (templateId === 'creative') {
    // Creative layout usually has name big on top
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.fullName,
            bold: true,
            size: 36,
            color: primaryColor,
          }),
        ],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${personalInfo.email} • ${personalInfo.phone} • ${personalInfo.location}`,
            size: 18,
            color: "666666",
          }),
        ],
        spacing: { after: 400 },
      })
    );
  } else {
    // Modern template default
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: personalInfo.fullName.toUpperCase(),
            bold: true,
            size: 32,
          }),
        ],
        spacing: { after: 120 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${personalInfo.email} | ${personalInfo.phone} | ${personalInfo.location}`,
            size: 20,
            bold: true,
            color: "666666",
          }),
        ],
        border: {
          bottom: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
        spacing: { after: 400 },
      })
    );
  }

  // 2. Summary
  if (sections.summary) {
    children.push(
      new Paragraph({
        text: "PROFESSIONAL SUMMARY",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      }),
      new Paragraph({
        text: cleanMarkdown(sections.summary),
        spacing: { after: 300 },
      })
    );
  }

  // 3. Experience
  if (sections.experience.length > 0) {
    children.push(
      new Paragraph({
        text: "EXPERIENCE",
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 120 },
      })
    );

    sections.experience.forEach(exp => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: exp.position, bold: true, size: 24 }),
          ],
          spacing: { before: 200 },
        }),
        new Paragraph({
          children: [
            new TextRun({ text: exp.company, bold: true, italics: true }),
            new TextRun({ text: ` | ${exp.location}`, italics: true }),
            new TextRun({ text: `\t${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`, bold: true }),
          ],
          tabStops: [
            {
              type: "right",
              position: 9000,
            },
          ],
        }),
        new Paragraph({
          text: cleanMarkdown(exp.description),
          spacing: { after: 200 },
        })
      );
    });
  }

  // 4. Education & Skills (Grid-like in Modern, so we simulate with a Table)
  const eduContent = sections.education.map(edu => 
    new Paragraph({
      children: [
        new TextRun({ text: edu.degree, bold: true }),
        new TextRun({ text: `\n${edu.school}` }),
        new TextRun({ text: `\n${edu.startDate} - ${edu.endDate}`, size: 18, color: "666666" }),
      ],
      spacing: { after: 200 }
    })
  );

  const skillContent = [
    new Paragraph({
      text: sections.skills.join(", "),
      spacing: { after: 200 }
    })
  ];

  children.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left: { style: BorderStyle.NONE },
        right: { style: BorderStyle.NONE },
        insideHorizontal: { style: BorderStyle.NONE },
        insideVertical: { style: BorderStyle.NONE },
      },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({ text: "EDUCATION", heading: HeadingLevel.HEADING_2 }),
                ...eduContent
              ],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({ text: "SKILLS", heading: HeadingLevel.HEADING_2 }),
                ...skillContent
              ],
              borders: {
                top: { style: BorderStyle.NONE },
                bottom: { style: BorderStyle.NONE },
                left: { style: BorderStyle.NONE },
                right: { style: BorderStyle.NONE },
              },
              width: { size: 50, type: WidthType.PERCENTAGE },
            }),
          ]
        })
      ]
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${personalInfo.fullName.replace(/\s+/g, '_')}_Resume.docx`;
  link.click();
}
