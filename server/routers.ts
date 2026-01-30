import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzeExcelFile } from "./excel-analysis-orchestrator";
import { validateExcelFile } from "./excel-parser";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  excel: router({
    /**
     * Analyze Excel file from MS Forms
     */
    analyze: protectedProcedure
      .input(z.object({
        fileBase64: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          // Decode base64 to buffer
          const buffer = Buffer.from(input.fileBase64, 'base64');
          
          // Validate file
          const validation = validateExcelFile(buffer);
          if (!validation.valid) {
            return {
              success: false,
              error: validation.error,
            };
          }
          
          // Analyze file
          const result = await analyzeExcelFile(buffer);
          
          return result;
        } catch (error) {
          console.error('Error analyzing Excel:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
