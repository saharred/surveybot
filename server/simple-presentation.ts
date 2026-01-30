/**
 * Simple presentation generator for Excel analysis
 */

interface PresentationData {
  surveyTitle: string;
  surveyDescription: string;
  schoolInfo?: {
    schoolName?: string;
    principalName?: string;
    academicDeputyName?: string;
    administrativeDeputyName?: string;
    academicYear?: string;
  };
  questions: Array<{
    questionText: string;
    questionType: string;
    analysis: any;
  }>;
  overallSummary: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  images: Record<string, string>;
}

export async function generateSimplePresentation(data: PresentationData): Promise<string> {
  const { surveyTitle, surveyDescription, questions, overallSummary, strengths, improvements, recommendations, images } = data;
  
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${surveyTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .presentation {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .slide {
      background: white;
      border-radius: 20px;
      padding: 60px;
      margin-bottom: 30px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      min-height: 600px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    
    .slide-title {
      font-size: 48px;
      font-weight: 700;
      color: #2d3748;
      margin-bottom: 20px;
      text-align: center;
    }
    
    .slide-subtitle {
      font-size: 24px;
      color: #718096;
      text-align: center;
      margin-bottom: 40px;
    }
    
    .slide-content {
      font-size: 20px;
      line-height: 1.8;
      color: #4a5568;
    }
    
    .vision-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      margin: 30px 0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      background: #f7fafc;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 36px;
      font-weight: 700;
      color: #667eea;
    }
    
    .stat-label {
      font-size: 16px;
      color: #718096;
      margin-top: 10px;
    }
    
    .list-item {
      background: #f7fafc;
      padding: 15px 20px;
      margin: 10px 0;
      border-radius: 10px;
      border-right: 4px solid #667eea;
    }
    
    .image-container {
      width: 100%;
      max-width: 800px;
      margin: 30px auto;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .image-container img {
      width: 100%;
      height: auto;
      display: block;
    }
    
    .chart {
      margin: 30px 0;
    }
    
    @media print {
      .slide {
        page-break-after: always;
        margin-bottom: 0;
      }
    }
  </style>
</head>
<body>
  <div class="presentation">`;
  
  // Title Slide
  html += `
    <div class="slide">
      <h1 class="slide-title">${surveyTitle}</h1>
      <p class="slide-subtitle">${surveyDescription}</p>
      <div class="vision-box">
        «متعلم ريادي لتنمية مستدامة»
      </div>
      ${images.school_building ? `
        <div class="image-container">
          <img src="${images.school_building}" alt="مدرسة قطرية">
        </div>
      ` : ''}
    </div>`;
  
  // Summary Slide
  html += `
    <div class="slide">
      <h2 class="slide-title">الملخص التنفيذي</h2>
      <div class="slide-content">
        <p style="font-size: 24px; line-height: 1.8;">${overallSummary}</p>
      </div>
      ${images.female_students ? `
        <div class="image-container">
          <img src="${images.female_students}" alt="طالبات">
        </div>
      ` : ''}
    </div>`;
  
  // Questions Analysis
  questions.forEach((q, idx) => {
    html += `
      <div class="slide">
        <h2 class="slide-title">السؤال ${idx + 1}</h2>
        <p class="slide-subtitle">${q.questionText}</p>
        <div class="slide-content">`;
    
    if (q.analysis.percentages) {
      html += `<div class="stats-grid">`;
      Object.entries(q.analysis.percentages).forEach(([option, percentage]) => {
        html += `
          <div class="stat-card">
            <div class="stat-value">${(percentage as number).toFixed(1)}%</div>
            <div class="stat-label">${option}</div>
          </div>`;
      });
      html += `</div>`;
    }
    
    if (q.analysis.interpretation) {
      html += `<div style="margin-top: 30px; padding: 20px; background: #f7fafc; border-radius: 10px;">
        <p style="white-space: pre-wrap;">${q.analysis.interpretation.interpretation || ''}</p>
      </div>`;
    }
    
    html += `</div></div>`;
  });
  
  // Strengths
  if (strengths.length > 0) {
    html += `
      <div class="slide">
        <h2 class="slide-title">نقاط القوة</h2>
        <div class="slide-content">`;
    
    strengths.forEach((strength, idx) => {
      html += `<div class="list-item">${idx + 1}. ${strength}</div>`;
    });
    
    html += `</div>
        ${images.success ? `
          <div class="image-container">
            <img src="${images.success}" alt="النجاح">
          </div>
        ` : ''}
      </div>`;
  }
  
  // Improvements
  if (improvements.length > 0) {
    html += `
      <div class="slide">
        <h2 class="slide-title">نقاط التحسين</h2>
        <div class="slide-content">`;
    
    improvements.forEach((improvement, idx) => {
      html += `<div class="list-item">${idx + 1}. ${improvement}</div>`;
    });
    
    html += `</div>
        ${images.classroom ? `
          <div class="image-container">
            <img src="${images.classroom}" alt="الفصل الدراسي">
          </div>
        ` : ''}
      </div>`;
  }
  
  // Recommendations
  if (recommendations.length > 0) {
    html += `
      <div class="slide">
        <h2 class="slide-title">التوصيات</h2>
        <div class="slide-content">`;
    
    recommendations.forEach((recommendation, idx) => {
      html += `<div class="list-item">${idx + 1}. ${recommendation}</div>`;
    });
    
    html += `</div></div>`;
  }
  
  // Closing
  html += `
    <div class="slide">
      <h2 class="slide-title">شكراً لكم</h2>
      <div class="vision-box">
        «متعلم ريادي لتنمية مستدامة»
      </div>
    </div>`;
  
  html += `
  </div>
</body>
</html>`;
  
  return html;
}
