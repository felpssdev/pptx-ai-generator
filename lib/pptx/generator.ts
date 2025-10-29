import PptxGenJS from 'pptxgenjs';
import { PPTXGenerationOptions, PPTXGenerationResult } from './types';

/**
 * Generate a PPTX presentation file
 */
export async function generatePPTX(
  options: PPTXGenerationOptions
): Promise<PPTXGenerationResult> {
  try {
    const { slides, brandKit, template, presentationTitle, presentationSubtitle } =
      options;

    // Create presentation
    const prs = new PptxGenJS();

    // Set presentation properties
    prs.defineLayout({ name: 'LAYOUT1', width: 16, height: 9 });
    prs.defineLayout({ name: 'TITLE_SLIDE', width: 16, height: 9 });

    // Set default layout
    prs.layout = 'LAYOUT1';

    // Add slide master with logo and branding
    prs.defineLayout({
      name: 'MASTER',
      width: 16,
      height: 9,
    });

    // Metadata
    prs.author = 'pptx-ai-generator';
    prs.title = presentationTitle || 'AI Generated Presentation';
    prs.subject = presentationSubtitle || 'Generated with AI';

    // Title slide
    if (slides.length > 0) {
      addTitleSlide(prs, slides[0], brandKit, template);
    }

    // Content slides
    for (let i = 1; i < slides.length; i++) {
      addContentSlide(prs, slides[i], brandKit, template);
    }

    // Generate and download
    const filename = `presentation-${Date.now()}.pptx`;
    await prs.writeFile({ fileName: filename });

    return {
      success: true,
      filename,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      filename: '',
      error: errorMessage,
    };
  }
}

/**
 * Add title slide
 */
function addTitleSlide(
  prs: PptxGenJS,
  slide: any,
  brandKit: any,
  template: any
): void {
  const slideObj = prs.addSlide();

  // Background
  slideObj.background = { color: template.colors.background };

  // Add logo if exists
  if (brandKit.logo) {
    slideObj.addImage({
      data: brandKit.logo,
      x: 0.5,
      y: 0.3,
      w: 1.5,
      h: 1.5,
    });
  }

  // Title
  slideObj.addText(slide.title, {
    x: 1.5,
    y: 2.5,
    w: 13,
    h: 2,
    fontSize: 54,
    bold: true,
    color: template.colors.title,
    fontFace: template.fonts.title,
    align: 'center',
  });

  // Subtitle (if available)
  if (slide.bullets && slide.bullets.length > 0) {
    slideObj.addText(slide.bullets[0], {
      x: 1,
      y: 5,
      w: 14,
      h: 1.5,
      fontSize: 28,
      color: template.colors.accent,
      fontFace: template.fonts.body,
      align: 'center',
    });
  }
}

/**
 * Add content slide
 */
function addContentSlide(
  prs: PptxGenJS,
  slide: any,
  brandKit: any,
  template: any
): void {
  const slideObj = prs.addSlide();

  // Background
  slideObj.background = { color: template.colors.background };

  // Add logo (small, top-right)
  if (brandKit.logo) {
    slideObj.addImage({
      data: brandKit.logo,
      x: 14.5,
      y: 0.3,
      w: 1,
      h: 1,
    });
  }

  // Title
  slideObj.addText(slide.title, {
    x: 0.5,
    y: 0.5,
    w: 13,
    h: 0.8,
    fontSize: 44,
    bold: true,
    color: template.colors.title,
    fontFace: template.fonts.title,
  });

  // Content area - image or bullets
  const contentX = 0.5;
  const contentY = 1.5;

  if (slide.imageUrl) {
    // Image layout (left side for image, right side for bullets)
    slideObj.addImage({
      path: slide.imageUrl,
      x: contentX,
      y: contentY,
      w: 7.5,
      h: 6,
      rsize: { type: 'cover' },
    });

    // Bullets on right side
    addBulletPoints(slideObj, slide.bullets, 8.2, contentY, 7, 6, template);
  } else {
    // Full-width bullets
    addBulletPoints(slideObj, slide.bullets, contentX, contentY, 15, 6, template);
  }

  // Add speaker notes
  if (slide.speakerNotes) {
    const notesText = formatSpeakerNotes(slide.speakerNotes);
    slideObj.notes = { text: notesText };
  }
}

/**
 * Add bullet points to slide
 */
function addBulletPoints(
  slide: any,
  bullets: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  template: any
): void {
  const bulletPoints = bullets.map((bullet, idx) => ({
    text: bullet,
    options: {
      fontSize: 18,
      color: template.colors.text,
      fontFace: template.fonts.body,
      bullet: true,
      level: 0,
    },
  }));

  slide.addText(bulletPoints, {
    x,
    y,
    w: width,
    h: height,
    align: 'left',
    valign: 'top',
  });
}

/**
 * Format speaker notes for presentation notes section
 */
function formatSpeakerNotes(speakerNotes: any): string {
  let notes = '';

  if (speakerNotes.script) {
    notes += `SCRIPT:\n${speakerNotes.script}\n\n`;
  }

  if (speakerNotes.duration) {
    notes += `Duration: ${speakerNotes.duration}\n\n`;
  }

  if (speakerNotes.tips && speakerNotes.tips.length > 0) {
    notes += `TIPS:\n${speakerNotes.tips.map((tip: string) => `• ${tip}`).join('\n')}\n\n`;
  }

  if (speakerNotes.keyPoints && speakerNotes.keyPoints.length > 0) {
    notes += `KEY POINTS:\n${speakerNotes.keyPoints.map((point: string) => `• ${point}`).join('\n')}\n`;
  }

  return notes;
}
