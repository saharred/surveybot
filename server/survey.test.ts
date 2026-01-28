import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createTestContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Survey Creation and Management", () => {
  let testSchoolId: number;
  let testSurveyId: number;

  beforeEach(async () => {
    // Create a test school first
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const school = await caller.school.create({
      schoolName: "مدرسة الاختبار",
      principalName: "مديرة الاختبار",
      academicDeputyName: "نائبة أكاديمية",
      administrativeDeputyName: "نائبة إدارية",
      academicYear: "2025-2026",
    });

    testSchoolId = school.id;
  });

  it("should create a survey with questions", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const survey = await caller.survey.create({
      schoolId: testSchoolId,
      title: "استبيان اختبار",
      description: "وصف الاستبيان",
      purpose: "هدف الاستبيان",
      targetAudience: "teachers",
      questions: [
        {
          questionText: "ما رأيك في بيئة العمل؟",
          questionType: "multiple_choice",
          options: ["ممتازة", "جيدة", "متوسطة", "ضعيفة"],
          isRequired: true,
          orderIndex: 0,
        },
        {
          questionText: "قيّم مستوى التعاون",
          questionType: "rating",
          isRequired: true,
          orderIndex: 1,
        },
      ],
    });

    expect(survey).toBeDefined();
    expect(survey.title).toBe("استبيان اختبار");
    expect(survey.schoolId).toBe(testSchoolId);
    expect(survey.status).toBe("draft");

    testSurveyId = survey.id;
  });

  it("should list surveys for a school", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create a survey first
    await caller.survey.create({
      schoolId: testSchoolId,
      title: "استبيان للقائمة",
      description: "وصف",
      purpose: "هدف",
      targetAudience: "students",
      questions: [
        {
          questionText: "سؤال اختبار",
          questionType: "text",
          isRequired: false,
          orderIndex: 0,
        },
      ],
    });

    const surveys = await caller.survey.list({ schoolId: testSchoolId });

    expect(surveys).toBeDefined();
    expect(surveys.length).toBeGreaterThan(0);
    expect(surveys[0]?.schoolId).toBe(testSchoolId);
  });

  it("should update survey status", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create survey
    const survey = await caller.survey.create({
      schoolId: testSchoolId,
      title: "استبيان للتحديث",
      description: "وصف",
      purpose: "هدف",
      targetAudience: "parents",
      questions: [
        {
          questionText: "سؤال",
          questionType: "likert_scale",
          options: ["موافق بشدة", "موافق", "محايد", "غير موافق", "غير موافق بشدة"],
          isRequired: true,
          orderIndex: 0,
        },
      ],
    });

    // Update status to active
    await caller.survey.updateStatus({
      surveyId: survey.id,
      status: "active",
    });

    // Retrieve updated survey
    const updated = await caller.survey.getById({ surveyId: survey.id });
    expect(updated.survey.status).toBe("active");
  });

  it("should get survey by id with questions", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create survey
    const survey = await caller.survey.create({
      schoolId: testSchoolId,
      title: "استبيان للاسترجاع",
      description: "وصف",
      purpose: "هدف",
      targetAudience: "staff",
      questions: [
        {
          questionText: "سؤال 1",
          questionType: "multiple_choice",
          options: ["خيار 1", "خيار 2"],
          isRequired: true,
          orderIndex: 0,
        },
        {
          questionText: "سؤال 2",
          questionType: "text",
          isRequired: false,
          orderIndex: 1,
        },
      ],
    });

    const retrieved = await caller.survey.getById({ surveyId: survey.id });

    expect(retrieved).toBeDefined();
    expect(retrieved.survey.id).toBe(survey.id);
    expect(retrieved.questions.length).toBe(2);
    expect(retrieved.questions[0]?.questionText).toBe("سؤال 1");
  });
});

describe("Response Submission", () => {
  let testSurveyId: number;
  let testQuestionIds: number[];

  beforeEach(async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create school
    const school = await caller.school.create({
      schoolName: "مدرسة الاختبار للإجابات",
      principalName: "مديرة",
      academicDeputyName: "نائبة أكاديمية",
      administrativeDeputyName: "نائبة إدارية",
      academicYear: "2025-2026",
    });

    // Create survey
    const survey = await caller.survey.create({
      schoolId: school.id,
      title: "استبيان للإجابات",
      description: "وصف",
      purpose: "هدف",
      targetAudience: "teachers",
      questions: [
        {
          questionText: "سؤال اختيار متعدد",
          questionType: "multiple_choice",
          options: ["خيار 1", "خيار 2", "خيار 3"],
          isRequired: true,
          orderIndex: 0,
        },
        {
          questionText: "سؤال تقييم",
          questionType: "rating",
          isRequired: true,
          orderIndex: 1,
        },
      ],
    });

    // Activate survey
    await caller.survey.updateStatus({
      surveyId: survey.id,
      status: "active",
    });

    testSurveyId = survey.id;

    // Get question IDs
    const retrieved = await caller.survey.getById({ surveyId: survey.id });
    testQuestionIds = retrieved.questions.map(q => q.id);
  });

  it("should submit responses to a survey", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.response.submit({
      surveyId: testSurveyId,
      respondentId: "respondent_test_123",
      responses: [
        {
          questionId: testQuestionIds[0]!,
          answerOption: "خيار 1",
        },
        {
          questionId: testQuestionIds[1]!,
          answerValue: 4,
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("should retrieve responses for a survey", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Submit response
    await caller.response.submit({
      surveyId: testSurveyId,
      respondentId: "respondent_test_456",
      responses: [
        {
          questionId: testQuestionIds[0]!,
          answerOption: "خيار 2",
        },
        {
          questionId: testQuestionIds[1]!,
          answerValue: 5,
        },
      ],
    });

    const responses = await caller.response.getBySurveyId({ surveyId: testSurveyId });

    expect(responses).toBeDefined();
    expect(responses.length).toBeGreaterThan(0);
  });
});

describe("Analysis", () => {
  it("should create analysis record for a survey", async () => {
    const ctx = createTestContext();
    const caller = appRouter.createCaller(ctx);

    // Create school and survey
    const school = await caller.school.create({
      schoolName: "مدرسة الاختبار للتحليل",
      principalName: "مديرة",
      academicDeputyName: "نائبة أكاديمية",
      administrativeDeputyName: "نائبة إدارية",
      academicYear: "2025-2026",
    });

    const survey = await caller.survey.create({
      schoolId: school.id,
      title: "استبيان للتحليل",
      description: "وصف",
      purpose: "هدف",
      targetAudience: "teachers",
      questions: [
        {
          questionText: "سؤال",
          questionType: "multiple_choice",
          options: ["نعم", "لا"],
          isRequired: true,
          orderIndex: 0,
        },
      ],
    });

    const analysis = await caller.analysis.getOrCreate({ surveyId: survey.id });

    expect(analysis).toBeDefined();
    expect(analysis.surveyId).toBe(survey.id);
    expect(analysis.status).toBe("processing");
  });
});
