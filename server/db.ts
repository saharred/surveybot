import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  schools, InsertSchool, School,
  surveys, InsertSurvey, Survey,
  questions, InsertQuestion, Question,
  responses, InsertResponse, Response,
  analyses, InsertAnalysis, Analysis
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER FUNCTIONS =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= SCHOOL FUNCTIONS =============

export async function createSchool(school: InsertSchool): Promise<School> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(schools).values(school);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(schools).where(eq(schools.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted school");
  
  return inserted[0];
}

export async function getSchoolsByUserId(userId: number): Promise<School[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(schools).where(eq(schools.userId, userId)).orderBy(desc(schools.createdAt));
}

export async function getSchoolById(schoolId: number): Promise<School | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(schools).where(eq(schools.id, schoolId)).limit(1);
  return result[0];
}

export async function updateSchool(schoolId: number, updates: Partial<InsertSchool>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(schools).set(updates).where(eq(schools.id, schoolId));
}

// ============= SURVEY FUNCTIONS =============

export async function createSurvey(survey: InsertSurvey): Promise<Survey> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(surveys).values(survey);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(surveys).where(eq(surveys.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted survey");
  
  return inserted[0];
}

export async function getSurveysBySchoolId(schoolId: number): Promise<Survey[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(surveys).where(eq(surveys.schoolId, schoolId)).orderBy(desc(surveys.createdAt));
}

export async function getSurveyById(surveyId: number): Promise<Survey | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(surveys).where(eq(surveys.id, surveyId)).limit(1);
  return result[0];
}

export async function updateSurvey(surveyId: number, updates: Partial<InsertSurvey>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(surveys).set(updates).where(eq(surveys.id, surveyId));
}

// ============= QUESTION FUNCTIONS =============

export async function createQuestion(question: InsertQuestion): Promise<Question> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(questions).values(question);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(questions).where(eq(questions.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted question");
  
  return inserted[0];
}

export async function createQuestions(questionList: InsertQuestion[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (questionList.length === 0) return;
  await db.insert(questions).values(questionList);
}

export async function getQuestionsBySurveyId(surveyId: number): Promise<Question[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(questions).where(eq(questions.surveyId, surveyId)).orderBy(questions.orderIndex);
}

export async function getQuestionById(questionId: number): Promise<Question | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(questions).where(eq(questions.id, questionId)).limit(1);
  return result[0];
}

// ============= RESPONSE FUNCTIONS =============

export async function createResponse(response: InsertResponse): Promise<Response> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(responses).values(response);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(responses).where(eq(responses.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted response");
  
  return inserted[0];
}

export async function createResponses(responseList: InsertResponse[]): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (responseList.length === 0) return;
  await db.insert(responses).values(responseList);
}

export async function getResponsesBySurveyId(surveyId: number): Promise<Response[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(responses).where(eq(responses.surveyId, surveyId));
}

export async function getResponsesByQuestionId(questionId: number): Promise<Response[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(responses).where(eq(responses.questionId, questionId));
}

export async function getResponseCountBySurveyId(surveyId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select().from(responses).where(eq(responses.surveyId, surveyId));
  
  // Count unique respondents
  const uniqueRespondents = new Set(result.map(r => r.respondentId));
  return uniqueRespondents.size;
}

// ============= ANALYSIS FUNCTIONS =============

export async function createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(analyses).values(analysis);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(analyses).where(eq(analyses.id, insertedId)).limit(1);
  if (!inserted[0]) throw new Error("Failed to retrieve inserted analysis");
  
  return inserted[0];
}

export async function getAnalysisBySurveyId(surveyId: number): Promise<Analysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(analyses).where(eq(analyses.surveyId, surveyId)).limit(1);
  return result[0];
}

export async function updateAnalysis(surveyId: number, updates: Partial<InsertAnalysis>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(analyses).set(updates).where(eq(analyses.surveyId, surveyId));
}

export async function getAnalysisById(analysisId: number): Promise<Analysis | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
  return result[0];
}
