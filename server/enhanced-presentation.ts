/**
 * Enhanced presentation generator with Chart.js interactive charts
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

/**
 * Generate chart configuration for different question types
 */
function generateChartConfig(questionIndex: number, analysis: any, questionType: string) {
  const chartId = `chart-${questionIndex}`;
  
  if (!analysis.percentages || Object.keys(analysis.percentages).length === 0) {
    return null;
  }
  
  const labels = Object.keys(analysis.percentages);
  const data = Object.values(analysis.percentages) as number[];
  
  // Qatari-inspired color palette (maroon, gold, white)
  const qatariColors = [
    '#8B1538', // Maroon
    '#FFD700', // Gold
    '#4A90E2', // Blue
    '#50C878', // Emerald
    '#E8B4B8', // Light maroon
    '#FFA500', // Orange
    '#9370DB', // Purple
    '#20B2AA', // Turquoise
  ];
  
  const backgroundColors = labels.map((_, i) => qatariColors[i % qatariColors.length]);
  
  // Choose chart type based on question type and data
  let chartType = 'pie';
  if (questionType === 'rating' || questionType === 'likert') {
    chartType = 'bar';
  } else if (labels.length > 6) {
    chartType = 'bar';
  }
  
  const config = {
    type: chartType,
    data: {
      labels: labels,
      datasets: [{
        label: 'النسبة المئوية',
        data: data,
        backgroundColor: backgroundColors,
        borderColor: '#ffffff',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: chartType === 'pie',
          position: 'bottom',
          rtl: true,
          labels: {
            font: {
              family: 'Cairo',
              size: 14
            },
            padding: 15,
            usePointStyle: true,
          }
        },
        tooltip: {
          rtl: true,
          titleFont: {
            family: 'Cairo',
            size: 16
          },
          bodyFont: {
            family: 'Cairo',
            size: 14
          },
          callbacks: {
            label: function(context: any) {
              return context.label + ': ' + context.parsed.toFixed(1) + '%';
            }
          }
        },
        title: {
          display: false
        }
      },
      scales: chartType === 'bar' ? {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            font: {
              family: 'Cairo',
              size: 12
            },
            callback: function(value: any) {
              return value + '%';
            }
          },
          title: {
            display: true,
            text: 'النسبة المئوية',
            font: {
              family: 'Cairo',
              size: 14,
              weight: 'bold'
            }
          }
        },
        x: {
          ticks: {
            font: {
              family: 'Cairo',
              size: 12
            }
          }
        }
      } : {}
    }
  };
  
  return { chartId, config };
}

export async function generateEnhancedPresentation(data: PresentationData): Promise<string> {
  const { surveyTitle, surveyDescription, questions, overallSummary, strengths, improvements, recommendations, images } = data;
  
  // Generate chart configurations
  const chartConfigs: Array<{ chartId: string; config: any }> = [];
  questions.forEach((q, idx) => {
    const chartConfig = generateChartConfig(idx, q.analysis, q.questionType);
    if (chartConfig) {
      chartConfigs.push(chartConfig);
    }
  });
  
  let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${surveyTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #8B1538 0%, #4A90E2 100%);
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
      background: linear-gradient(135deg, #8B1538 0%, #FFD700 100%);
      color: white;
      padding: 30px;
      border-radius: 15px;
      text-align: center;
      font-size: 32px;
      font-weight: 700;
      margin: 30px 0;
      box-shadow: 0 10px 30px rgba(139, 21, 56, 0.3);
    }
    
    .chart-container {
      position: relative;
      height: 400px;
      margin: 30px 0;
      padding: 20px;
      background: #f7fafc;
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 25px;
      border-radius: 15px;
      text-align: center;
      border: 2px solid #8B1538;
      transition: transform 0.3s ease;
    }
    
    .stat-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 25px rgba(139, 21, 56, 0.2);
    }
    
    .stat-value {
      font-size: 42px;
      font-weight: 700;
      color: #8B1538;
      margin-bottom: 10px;
    }
    
    .stat-label {
      font-size: 16px;
      color: #4a5568;
      font-weight: 600;
    }
    
    .list-item {
      background: #f7fafc;
      padding: 20px 25px;
      margin: 15px 0;
      border-radius: 12px;
      border-right: 5px solid #8B1538;
      font-size: 18px;
      line-height: 1.6;
      transition: all 0.3s ease;
    }
    
    .list-item:hover {
      background: #edf2f7;
      transform: translateX(-5px);
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
    
    .interpretation-box {
      margin-top: 30px;
      padding: 25px;
      background: linear-gradient(135deg, #f7fafc 0%, #e6f7ff 100%);
      border-radius: 15px;
      border-right: 5px solid #4A90E2;
    }
    
    .interpretation-box p {
      white-space: pre-wrap;
      line-height: 1.8;
      color: #2d3748;
    }
    
    @media print {
      .slide {
        page-break-after: always;
        margin-bottom: 0;
      }
      body {
        background: white;
      }
    }
    
    @media (max-width: 768px) {
      .slide {
        padding: 30px 20px;
      }
      .slide-title {
        font-size: 32px;
      }
      .chart-container {
        height: 300px;
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
  
  // Questions Analysis with Charts
  questions.forEach((q, idx) => {
    const chartConfig = chartConfigs.find(c => c.chartId === `chart-${idx}`);
    
    html += `
      <div class="slide">
        <h2 class="slide-title">السؤال ${idx + 1}</h2>
        <p class="slide-subtitle">${q.questionText}</p>
        <div class="slide-content">`;
    
    // Add interactive chart
    if (chartConfig) {
      html += `
          <div class="chart-container">
            <canvas id="${chartConfig.chartId}"></canvas>
          </div>`;
    }
    
    // Add statistics grid
    if (q.analysis.percentages && Object.keys(q.analysis.percentages).length <= 4) {
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
    
    // Add interpretation
    if (q.analysis.interpretation) {
      html += `<div class="interpretation-box">
        <p>${q.analysis.interpretation.interpretation || ''}</p>
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
      html += `<div class="list-item">✓ ${strength}</div>`;
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
      html += `<div class="list-item">→ ${improvement}</div>`;
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
  
  // Add Chart.js initialization scripts
  html += `
  </div>
  <script>
    // Initialize all charts
    document.addEventListener('DOMContentLoaded', function() {
      const chartConfigs = ${JSON.stringify(chartConfigs)};
      
      chartConfigs.forEach(({ chartId, config }) => {
        const ctx = document.getElementById(chartId);
        if (ctx) {
          new Chart(ctx, config);
        }
      });
    });
  </script>
</body>
</html>`;
  
  return html;
}
