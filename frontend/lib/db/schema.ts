import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  doublePrecision,
  json,
  pgEnum,
  customType,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// pgvector custom type
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return "vector(3072)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    if (typeof value === "string") {
      return JSON.parse(value);
    }
    return value as number[];
  },
});

// Enums
export const planTypeEnum = pgEnum("plantype", ["free", "pro", "premium"]);
export const toneTypeEnum = pgEnum("tonetype", [
  "professional",
  "enthusiastic",
  "confident",
  "creative",
]);
export const lengthTypeEnum = pgEnum("lengthtype", ["short", "medium", "long"]);
export const applicationStatusEnum = pgEnum("applicationstatus", [
  "saved",
  "applied",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
]);
export const subscriptionStatusEnum = pgEnum("subscriptionstatus", [
  "active",
  "past_due",
  "canceled",
  "trialing",
  "incomplete",
]);
export const subscriptionPlanEnum = pgEnum("subscriptionplan", [
  "pro",
  "premium",
]);

// Tables
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    clerkId: varchar("clerk_id", { length: 255 }),
    fullName: varchar("full_name", { length: 255 }),
    plan: planTypeEnum("plan").default("free"),
    paddleCustomerId: varchar("paddle_customer_id", { length: 255 }),
    paddleSubscriptionId: varchar("paddle_subscription_id", { length: 255 }),
    paddleCurrentPeriodEnd: timestamp("paddle_current_period_end", {
      withTimezone: true,
    }),
    usageCount: integer("usage_count").default(0),
    usageResetDate: timestamp("usage_reset_date", { withTimezone: true }),
    isActive: boolean("is_active").default(true),
    isAdmin: boolean("is_admin").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("users_email_idx").on(table.email),
    uniqueIndex("users_clerk_id_idx").on(table.clerkId),
    uniqueIndex("users_paddle_subscription_id_idx").on(
      table.paddleSubscriptionId
    ),
  ]
);

export const resumes = pgTable(
  "resumes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filename: varchar("filename", { length: 500 }).notNull(),
    fileType: varchar("file_type", { length: 10 }),
    rawText: text("raw_text"),
    structuredJson: json("structured_json"),
    embedding: vector("embedding"),
    versionTag: varchar("version_tag", { length: 255 }),
    isOptimized: boolean("is_optimized").default(false),
    parentResumeId: text("parent_resume_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("resumes_user_id_idx").on(table.userId)]
);

export const jobDescriptions = pgTable(
  "job_descriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 500 }),
    company: varchar("company", { length: 255 }),
    rawText: text("raw_text"),
    parsedJson: json("parsed_json"),
    embedding: vector("embedding"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("job_descriptions_user_id_idx").on(table.userId)]
);

export const resumeScores = pgTable(
  "resume_scores",
  {
    id: text("id").primaryKey(),
    resumeId: text("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jdId: text("jd_id")
      .notNull()
      .references(() => jobDescriptions.id, { onDelete: "cascade" }),
    totalScore: doublePrecision("total_score").default(0.0),
    keywordScore: doublePrecision("keyword_score").default(0.0),
    semanticScore: doublePrecision("semantic_score").default(0.0),
    formattingScore: doublePrecision("formatting_score").default(0.0),
    sectionScore: doublePrecision("section_score").default(0.0),
    quantificationScore: doublePrecision("quantification_score").default(0.0),
    matchedKeywords: json("matched_keywords"),
    missingKeywords: json("missing_keywords"),
    breakdown: json("breakdown"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("resume_scores_resume_id_idx").on(table.resumeId),
    index("resume_scores_jd_id_idx").on(table.jdId),
  ]
);

export const coverLetters = pgTable(
  "cover_letters",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resumeId: text("resume_id").references(() => resumes.id, {
      onDelete: "set null",
    }),
    jdId: text("jd_id").references(() => jobDescriptions.id, {
      onDelete: "set null",
    }),
    content: text("content"),
    tone: toneTypeEnum("tone").default("professional"),
    length: lengthTypeEnum("length").default("medium"),
    companyName: varchar("company_name", { length: 255 }),
    jobTitle: varchar("job_title", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("cover_letters_user_id_idx").on(table.userId)]
);

export const applications = pgTable(
  "applications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    companyName: varchar("company_name", { length: 255 }).notNull(),
    jobTitle: varchar("job_title", { length: 255 }).notNull(),
    jobUrl: varchar("job_url", { length: 1000 }),
    resumeId: text("resume_id").references(() => resumes.id, {
      onDelete: "set null",
    }),
    jdId: text("jd_id").references(() => jobDescriptions.id, {
      onDelete: "set null",
    }),
    status: applicationStatusEnum("status").default("saved"),
    notes: text("notes"),
    dateApplied: timestamp("date_applied", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [index("applications_user_id_idx").on(table.userId)]
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paddleSubscriptionId: varchar("paddle_subscription_id", { length: 255 }),
    paddleCustomerId: varchar("paddle_customer_id", { length: 255 }),
    plan: subscriptionPlanEnum("plan"),
    status: subscriptionStatusEnum("status").default("incomplete"),
    currentPeriodStart: timestamp("current_period_start", {
      withTimezone: true,
    }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    uniqueIndex("subscriptions_user_id_idx").on(table.userId),
    uniqueIndex("subscriptions_paddle_subscription_id_idx").on(
      table.paddleSubscriptionId
    ),
  ]
);

export const usageLogs = pgTable(
  "usage_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    feature: varchar("feature", { length: 50 }).notNull(), // 'ai_optimize', 'cover_letter', 'jd_match'
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("usage_logs_user_id_feature_idx").on(table.userId, table.feature),
  ]
);

export const affiliateEvents = pgTable(
  "affiliate_events",
  {
    id: text("id").primaryKey(),
    eventType: varchar("event_type", { length: 20 }).notNull(), // 'impression' | 'click'
    productId: varchar("product_id", { length: 100 }).notNull(),
    page: varchar("page", { length: 50 }).notNull(),
    position: varchar("position", { length: 20 }).notNull(), // 'primary' | 'secondary' | 'sticky'
    intentLevel: varchar("intent_level", { length: 20 }), // 'CRITICAL' | 'NEEDS_WORK' | 'STRONG' | 'READY'
    userScore: integer("user_score"), // 0–100
    abVariant: varchar("ab_variant", { length: 5 }), // 'A' | 'B'
    sessionId: text("session_id").notNull(),
    userId: text("user_id"), // nullable — marketing pages have no user
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("affiliate_events_type_idx").on(table.eventType),
    index("affiliate_events_product_idx").on(table.productId),
    index("affiliate_events_created_idx").on(table.createdAt),
    index("affiliate_events_session_idx").on(table.sessionId),
  ]
);

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Resume = typeof resumes.$inferSelect;
export type NewResume = typeof resumes.$inferInsert;
export type JobDescription = typeof jobDescriptions.$inferSelect;
export type NewJobDescription = typeof jobDescriptions.$inferInsert;
export type ResumeScore = typeof resumeScores.$inferSelect;
export type NewResumeScore = typeof resumeScores.$inferInsert;
export type CoverLetter = typeof coverLetters.$inferSelect;
export type NewCoverLetter = typeof coverLetters.$inferInsert;
export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type UsageLog = typeof usageLogs.$inferSelect;
export type AffiliateEvent = typeof affiliateEvents.$inferSelect;
export type NewAffiliateEvent = typeof affiliateEvents.$inferInsert;
export type NewUsageLog = typeof usageLogs.$inferInsert;
