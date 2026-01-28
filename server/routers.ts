import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // School management
  school: router({
    create: protectedProcedure
      .input(z.object({
        schoolName: z.string().min(1),
        principalName: z.string().min(1),
        academicDeputyName: z.string().min(1),
        administrativeDeputyName: z.string().min(1),
        academicYear: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        return await db.createSchool({
          userId: ctx.user.id,
          ...input,
        });
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getSchoolsByUserId(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ ctx, input }) => {
        const school = await db.getSchoolById(input.schoolId);
        if (!school) {
          throw new TRPCError({ code: "NOT_FOUND", message: "School not found" });
        }
        if (school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return school;
      }),

    update: protectedProcedure
      .input(z.object({
        schoolId: z.number(),
        schoolName: z.string().min(1).optional(),
        principalName: z.string().min(1).optional(),
        academicDeputyName: z.string().min(1).optional(),
        administrativeDeputyName: z.string().min(1).optional(),
        academicYear: z.string().min(1).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { schoolId, ...updates } = input;
        const school = await db.getSchoolById(schoolId);
        if (!school) {
          throw new TRPCError({ code: "NOT_FOUND", message: "School not found" });
        }
        if (school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        await db.updateSchool(schoolId, updates);
        return { success: true };
      }),
  }),

  // Survey management
  survey: router({
    create: protectedProcedure
      .input(z.object({
        schoolId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        purpose: z.string().optional(),
        targetAudience: z.string().optional(),
        questions: z.array(z.object({
          questionText: z.string().min(1),
          questionType: z.enum(["multiple_choice", "likert_scale", "text", "rating"]),
          options: z.array(z.string()).optional(),
          isRequired: z.boolean().default(true),
          orderIndex: z.number(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verify school ownership
        const school = await db.getSchoolById(input.schoolId);
        if (!school) {
          throw new TRPCError({ code: "NOT_FOUND", message: "School not found" });
        }
        if (school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        // Create survey
        const survey = await db.createSurvey({
          schoolId: input.schoolId,
          title: input.title,
          description: input.description,
          purpose: input.purpose,
          targetAudience: input.targetAudience,
          status: "draft",
        });

        // Create questions
        const questions = input.questions.map(q => ({
          surveyId: survey.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options: q.options || null,
          isRequired: q.isRequired,
          orderIndex: q.orderIndex,
        }));

        await db.createQuestions(questions);

        // Send notification to owner
        try {
          const { notifyOwner } = await import("./_core/notification");
          await notifyOwner({
            title: "تم إنشاء استبيان جديد",
            content: `تم إنشاء استبيان "${survey.title}" لمدرسة ${school.schoolName} بنجاح.`,
          });
        } catch (error) {
          console.error("Failed to send notification:", error);
          // Don't fail survey creation if notification fails
        }

        return survey;
      }),

    list: protectedProcedure
      .input(z.object({ schoolId: z.number() }))
      .query(async ({ ctx, input }) => {
        const school = await db.getSchoolById(input.schoolId);
        if (!school) {
          throw new TRPCError({ code: "NOT_FOUND", message: "School not found" });
        }
        if (school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }
        return await db.getSurveysBySchoolId(input.schoolId);
      }),

    getById: publicProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ input }) => {
        const survey = await db.getSurveyById(input.surveyId);
        if (!survey) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
        }
        const questions = await db.getQuestionsBySurveyId(input.surveyId);
        return { survey, questions };
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        surveyId: z.number(),
        status: z.enum(["draft", "active", "closed", "analyzed"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const survey = await db.getSurveyById(input.surveyId);
        if (!survey) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
        }
        const school = await db.getSchoolById(survey.schoolId);
        if (!school || school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        await db.updateSurvey(input.surveyId, {
          status: input.status,
          closedAt: input.status === "closed" ? new Date() : undefined,
        });

        return { success: true };
      }),

    getResponseCount: publicProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ input }) => {
        return await db.getResponseCountBySurveyId(input.surveyId);
      }),
  }),

  // Response collection
  response: router({
    submit: publicProcedure
      .input(z.object({
        surveyId: z.number(),
        respondentId: z.string(),
        responses: z.array(z.object({
          questionId: z.number(),
          answerText: z.string().optional(),
          answerOption: z.string().optional(),
          answerValue: z.number().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const survey = await db.getSurveyById(input.surveyId);
        if (!survey) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
        }
        if (survey.status !== "active") {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Survey is not active" });
        }

        const responseList = input.responses.map(r => ({
          surveyId: input.surveyId,
          questionId: r.questionId,
          respondentId: input.respondentId,
          answerText: r.answerText || null,
          answerOption: r.answerOption || null,
          answerValue: r.answerValue || null,
        }));

        await db.createResponses(responseList);
        return { success: true };
      }),

    getBySurveyId: protectedProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ ctx, input }) => {
        const survey = await db.getSurveyById(input.surveyId);
        if (!survey) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
        }
        const school = await db.getSchoolById(survey.schoolId);
        if (!school || school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        return await db.getResponsesBySurveyId(input.surveyId);
      }),
  }),

  // Analysis
  analysis: router({
    getOrCreate: protectedProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ ctx, input }) => {
        const survey = await db.getSurveyById(input.surveyId);
        if (!survey) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
        }
        const school = await db.getSchoolById(survey.schoolId);
        if (!school || school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        let analysis = await db.getAnalysisBySurveyId(input.surveyId);
        if (!analysis) {
          analysis = await db.createAnalysis({
            surveyId: input.surveyId,
            status: "processing",
          });
        }

        return analysis;
      }),

    getBySurveyId: publicProcedure
      .input(z.object({ surveyId: z.number() }))
      .query(async ({ input }) => {
        return await db.getAnalysisBySurveyId(input.surveyId);
      }),

    startAnalysis: protectedProcedure
      .input(z.object({ surveyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const survey = await db.getSurveyById(input.surveyId);
        if (!survey) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Survey not found" });
        }
        const school = await db.getSchoolById(survey.schoolId);
        if (!school || school.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Access denied" });
        }

        // Import analysis orchestrator
        const { performCompleteAnalysis, isSurveyReadyForAnalysis } = await import("./analysis-orchestrator");
        
        // Check if ready
        const readyCheck = await isSurveyReadyForAnalysis(input.surveyId);
        if (!readyCheck.ready) {
          throw new TRPCError({ code: "BAD_REQUEST", message: readyCheck.reason || "Survey not ready" });
        }

        // Start analysis in background (don't await)
        performCompleteAnalysis(input.surveyId).catch(error => {
          console.error("Background analysis failed:", error);
        });

        return { success: true, message: "Analysis started" };
      }),
  }),
});

export type AppRouter = typeof appRouter;
