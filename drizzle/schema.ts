import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Schools table - stores information about educational institutions
 */
export const schools = mysqlTable("schools", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of this school record
  schoolName: text("schoolName").notNull(),
  principalName: text("principalName").notNull(),
  academicDeputyName: text("academicDeputyName").notNull(),
  administrativeDeputyName: text("administrativeDeputyName").notNull(),
  academicYear: varchar("academicYear", { length: 20 }).notNull(), // e.g., "2025-2026"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type School = typeof schools.$inferSelect;
export type InsertSchool = typeof schools.$inferInsert;

/**
 * Surveys table - stores survey metadata
 */
export const surveys = mysqlTable("surveys", {
  id: int("id").autoincrement().primaryKey(),
  schoolId: int("schoolId").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  purpose: text("purpose"), // هدف الاستبيان
  targetAudience: varchar("targetAudience", { length: 100 }), // e.g., "teachers", "students", "parents"
  status: mysqlEnum("status", ["draft", "active", "closed", "analyzed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  closedAt: timestamp("closedAt"),
});

export type Survey = typeof surveys.$inferSelect;
export type InsertSurvey = typeof surveys.$inferInsert;

/**
 * Questions table - stores individual survey questions
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "likert_scale", "text", "rating"]).notNull(),
  options: json("options").$type<string[]>(), // For multiple choice and likert scale
  isRequired: boolean("isRequired").default(true).notNull(),
  orderIndex: int("orderIndex").notNull(), // For ordering questions
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * Responses table - stores survey responses
 */
export const responses = mysqlTable("responses", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull(),
  questionId: int("questionId").notNull(),
  respondentId: varchar("respondentId", { length: 100 }), // Anonymous identifier or user ID
  answerText: text("answerText"), // For text responses
  answerOption: varchar("answerOption", { length: 255 }), // For multiple choice/likert
  answerValue: int("answerValue"), // Numeric value for ratings/likert
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Response = typeof responses.$inferSelect;
export type InsertResponse = typeof responses.$inferInsert;

/**
 * Analyses table - stores AI-generated analysis and reports
 */
export const analyses = mysqlTable("analyses", {
  id: int("id").autoincrement().primaryKey(),
  surveyId: int("surveyId").notNull().unique(), // One analysis per survey
  
  // Statistical analysis results (JSON)
  statisticalData: json("statisticalData").$type<{
    questionId: number;
    questionText: string;
    questionType: string;
    totalResponses: number;
    statistics: {
      percentages?: Record<string, number>;
      average?: number;
      standardDeviation?: number;
      frequencies?: Record<string, number>;
      mode?: string;
      median?: number;
    };
  }[]>(),
  
  // AI-generated educational interpretations
  educationalInterpretation: json("educationalInterpretation").$type<{
    questionId: number;
    interpretation: string;
    pedagogicalInsights: string;
    impact: string;
  }[]>(),
  
  // Overall analysis
  overallSummary: text("overallSummary"),
  strengths: json("strengths").$type<string[]>(),
  improvements: json("improvements").$type<string[]>(),
  recommendations: json("recommendations").$type<string[]>(),
  
  // Generated files
  presentationUrl: text("presentationUrl"), // S3 URL for HTML presentation
  presentationPdfUrl: text("presentationPdfUrl"), // S3 URL for PDF presentation
  reportUrl: text("reportUrl"), // S3 URL for detailed report
  reportPdfUrl: text("reportPdfUrl"), // S3 URL for PDF report
  
  // File keys for S3
  presentationKey: text("presentationKey"),
  presentationPdfKey: text("presentationPdfKey"),
  reportKey: text("reportKey"),
  reportPdfKey: text("reportPdfKey"),
  
  status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = typeof analyses.$inferInsert;
