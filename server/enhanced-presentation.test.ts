import { describe, expect, it } from "vitest";
import { generateEnhancedPresentation } from "./enhanced-presentation";
import * as fs from "fs";

describe("Enhanced Presentation with Charts", () => {
  it("should generate presentation HTML with Chart.js", async () => {
    const testData = {
      surveyTitle: "اختبار العرض التقديمي",
      surveyDescription: "عرض تقديمي تجريبي مع رسوم بيانية",
      questions: [
        {
          questionText: "ما رأيك في بيئة العمل؟",
          questionType: "multiple_choice",
          analysis: {
            total: 100,
            percentages: {
              "ممتازة": 45.5,
              "جيدة": 30.2,
              "متوسطة": 15.3,
              "ضعيفة": 9.0
            },
            interpretation: {
              interpretation: "النتائج إيجابية بشكل عام"
            }
          }
        },
        {
          questionText: "قيّم مستوى التعاون",
          questionType: "rating",
          analysis: {
            total: 100,
            percentages: {
              "5": 40.0,
              "4": 35.0,
              "3": 20.0,
              "2": 3.0,
              "1": 2.0
            },
            interpretation: {
              interpretation: "مستوى التعاون ممتاز"
            }
          }
        }
      ],
      overallSummary: "النتائج الإجمالية إيجابية",
      strengths: ["نقطة قوة 1", "نقطة قوة 2"],
      improvements: ["نقطة تحسين 1"],
      recommendations: ["توصية 1", "توصية 2"],
      images: {}
    };
    
    const html = await generateEnhancedPresentation(testData);
    
    // Verify Chart.js is included
    expect(html).toContain('chart.js');
    expect(html).toContain('Chart');
    
    // Verify charts are created
    expect(html).toContain('chart-0');
    expect(html).toContain('chart-1');
    
    // Verify Arabic content
    expect(html).toContain('lang="ar"');
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('Cairo');
    
    // Verify Qatari vision
    expect(html).toContain('متعلم ريادي لتنمية مستدامة');
    
    // Verify chart configurations are embedded
    expect(html).toContain('chartConfigs');
    expect(html).toContain('new Chart');
    
    console.log('\n✅ Enhanced presentation generated successfully');
    console.log(`   HTML length: ${html.length} characters`);
    console.log(`   Contains ${testData.questions.length} charts`);
    
    // Save sample for manual inspection
    fs.writeFileSync('/home/ubuntu/test-presentation.html', html);
    console.log('   Sample saved to: /home/ubuntu/test-presentation.html');
  });
  
  it("should use appropriate chart types for different questions", async () => {
    const testData = {
      surveyTitle: "اختبار أنواع الرسوم",
      surveyDescription: "اختبار",
      questions: [
        {
          questionText: "سؤال اختيار متعدد",
          questionType: "multiple_choice",
          analysis: {
            total: 100,
            percentages: { "أ": 50, "ب": 30, "ج": 20 }
          }
        },
        {
          questionText: "سؤال تقييم",
          questionType: "rating",
          analysis: {
            total: 100,
            percentages: { "5": 40, "4": 30, "3": 20, "2": 5, "1": 5 }
          }
        }
      ],
      overallSummary: "اختبار",
      strengths: [],
      improvements: [],
      recommendations: [],
      images: {}
    };
    
    const html = await generateEnhancedPresentation(testData);
    
    // Verify different chart types are used
    expect(html).toContain('"type":"pie"');
    expect(html).toContain('"type":"bar"');
    
    console.log('\n✅ Chart types correctly assigned based on question type');
  });
  
  it("should apply Qatari color scheme", async () => {
    const testData = {
      surveyTitle: "اختبار الألوان",
      surveyDescription: "اختبار",
      questions: [{
        questionText: "سؤال",
        questionType: "multiple_choice",
        analysis: {
          total: 100,
          percentages: { "خيار 1": 50, "خيار 2": 50 }
        }
      }],
      overallSummary: "اختبار",
      strengths: [],
      improvements: [],
      recommendations: [],
      images: {}
    };
    
    const html = await generateEnhancedPresentation(testData);
    
    // Verify Qatari colors (maroon and gold)
    expect(html).toContain('#8B1538'); // Maroon
    expect(html).toContain('#FFD700'); // Gold
    
    console.log('\n✅ Qatari color scheme applied correctly');
  });
});
