import { generateImage } from "./_core/imageGeneration";

export type ImageTheme = 
  | 'school_building'
  | 'female_students'
  | 'female_teachers'
  | 'classroom'
  | 'laboratory'
  | 'library'
  | 'activities'
  | 'success'
  | 'collaboration';

/**
 * Generate culturally appropriate prompts for Qatari educational context
 */
function getQatariPrompt(theme: ImageTheme): string {
  const baseStyle = "professional, high quality, educational setting, respectful, culturally appropriate for Qatar";
  
  const prompts: Record<ImageTheme, string> = {
    school_building: `Modern Qatari school building exterior with Islamic architectural elements, clean lines, white and beige colors, palm trees, blue sky, ${baseStyle}`,
    
    female_students: `Qatari female students in traditional school uniform (white hijab and modest dress), sitting in classroom, engaged in learning, smiling, books and tablets, ${baseStyle}`,
    
    female_teachers: `Qatari female teacher in professional modest attire with hijab, standing in front of whiteboard, teaching students, warm and encouraging expression, ${baseStyle}`,
    
    classroom: `Modern Qatari classroom interior, rows of desks, whiteboard, educational posters in Arabic, bright and clean, natural lighting, ${baseStyle}`,
    
    laboratory: `Modern science laboratory in Qatari school, lab equipment, microscopes, safety equipment, clean and organized, students conducting experiments, ${baseStyle}`,
    
    library: `Modern school library in Qatar, bookshelves with Arabic and English books, reading areas, students studying quietly, natural light, ${baseStyle}`,
    
    activities: `Qatari students participating in educational activities, group work, presentations, collaborative learning, respectful interaction, ${baseStyle}`,
    
    success: `Celebration of academic success in Qatari school, students receiving certificates, proud expressions, educational achievement, ${baseStyle}`,
    
    collaboration: `Qatari students working together on project, teamwork, discussion, problem-solving, respectful collaboration, ${baseStyle}`,
  };
  
  return prompts[theme];
}

/**
 * Generate image with Qatari cultural context
 */
export async function generateQatariEducationalImage(theme: ImageTheme): Promise<string | undefined> {
  try {
    const prompt = getQatariPrompt(theme);
    
    const result = await generateImage({
      prompt,
    });
    
    return result.url;
  } catch (error) {
    console.error(`Error generating image for theme ${theme}:`, error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate multiple images for presentation
 */
export async function generatePresentationImages(): Promise<Record<string, string>> {
  try {
    // Generate key images for presentation
    const themes: ImageTheme[] = [
      'school_building',
      'female_students',
      'classroom',
      'success',
    ];
    
    const images: Record<string, string> = {};
    
    for (const theme of themes) {
      try {
        const url = await generateQatariEducationalImage(theme);
        if (url) {
          images[theme] = url;
        }
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.warn(`Failed to generate image for ${theme}, skipping...`);
        // Continue with other images even if one fails
      }
    }
    
    return images;
  } catch (error) {
    console.error('Error generating presentation images:', error);
    // Return empty object if all fail - presentation can still work without images
    return {};
  }
}

/**
 * Get appropriate image theme based on survey content
 */
export function selectImageThemeForQuestion(questionText: string): ImageTheme {
  const text = questionText.toLowerCase();
  
  if (text.includes('مختبر') || text.includes('تجارب') || text.includes('علوم')) {
    return 'laboratory';
  }
  
  if (text.includes('مكتبة') || text.includes('قراءة') || text.includes('كتب')) {
    return 'library';
  }
  
  if (text.includes('معلم') || text.includes('تدريس') || text.includes('شرح')) {
    return 'female_teachers';
  }
  
  if (text.includes('تعاون') || text.includes('مجموعة') || text.includes('فريق')) {
    return 'collaboration';
  }
  
  if (text.includes('نجاح') || text.includes('تفوق') || text.includes('إنجاز')) {
    return 'success';
  }
  
  if (text.includes('نشاط') || text.includes('فعالية')) {
    return 'activities';
  }
  
  if (text.includes('فصل') || text.includes('حصة') || text.includes('درس')) {
    return 'classroom';
  }
  
  // Default
  return 'female_students';
}
