CREATE TYPE "public"."applicationstatus" AS ENUM('saved', 'applied', 'interview', 'offer', 'rejected', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."lengthtype" AS ENUM('short', 'medium', 'long');--> statement-breakpoint
CREATE TYPE "public"."plantype" AS ENUM('free', 'pro', 'premium');--> statement-breakpoint
CREATE TYPE "public"."subscriptionplan" AS ENUM('pro', 'premium');--> statement-breakpoint
CREATE TYPE "public"."subscriptionstatus" AS ENUM('active', 'past_due', 'canceled', 'trialing', 'incomplete');--> statement-breakpoint
CREATE TYPE "public"."tonetype" AS ENUM('professional', 'enthusiastic', 'confident', 'creative');--> statement-breakpoint
CREATE TABLE "affiliate_events" (
	"id" text PRIMARY KEY NOT NULL,
	"event_type" varchar(20) NOT NULL,
	"product_id" varchar(100) NOT NULL,
	"page" varchar(50) NOT NULL,
	"position" varchar(20) NOT NULL,
	"intent_level" varchar(20),
	"user_score" integer,
	"ab_variant" varchar(5),
	"session_id" text NOT NULL,
	"user_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"job_url" varchar(1000),
	"resume_id" text,
	"jd_id" text,
	"status" "applicationstatus" DEFAULT 'saved',
	"notes" text,
	"date_applied" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cover_letters" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"resume_id" text,
	"jd_id" text,
	"content" text,
	"tone" "tonetype" DEFAULT 'professional',
	"length" "lengthtype" DEFAULT 'medium',
	"company_name" varchar(255),
	"job_title" varchar(255),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "job_descriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" varchar(500),
	"company" varchar(255),
	"raw_text" text,
	"parsed_json" json,
	"embedding" vector(3072),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resume_scores" (
	"id" text PRIMARY KEY NOT NULL,
	"resume_id" text NOT NULL,
	"jd_id" text NOT NULL,
	"total_score" double precision DEFAULT 0,
	"keyword_score" double precision DEFAULT 0,
	"semantic_score" double precision DEFAULT 0,
	"formatting_score" double precision DEFAULT 0,
	"section_score" double precision DEFAULT 0,
	"quantification_score" double precision DEFAULT 0,
	"matched_keywords" json,
	"missing_keywords" json,
	"breakdown" json,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "resumes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"filename" varchar(500) NOT NULL,
	"file_type" varchar(10),
	"raw_text" text,
	"structured_json" json,
	"embedding" vector(3072),
	"version_tag" varchar(255),
	"is_optimized" boolean DEFAULT false,
	"parent_resume_id" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"paddle_subscription_id" varchar(255),
	"paddle_customer_id" varchar(255),
	"plan" "subscriptionplan",
	"status" "subscriptionstatus" DEFAULT 'incomplete',
	"current_period_start" timestamp with time zone,
	"current_period_end" timestamp with time zone,
	"cancel_at_period_end" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"feature" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"clerk_id" varchar(255),
	"full_name" varchar(255),
	"plan" "plantype" DEFAULT 'free',
	"paddle_customer_id" varchar(255),
	"paddle_subscription_id" varchar(255),
	"paddle_current_period_end" timestamp with time zone,
	"usage_count" integer DEFAULT 0,
	"usage_reset_date" timestamp with time zone,
	"is_active" boolean DEFAULT true,
	"is_admin" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_jd_id_job_descriptions_id_fk" FOREIGN KEY ("jd_id") REFERENCES "public"."job_descriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_jd_id_job_descriptions_id_fk" FOREIGN KEY ("jd_id") REFERENCES "public"."job_descriptions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_descriptions" ADD CONSTRAINT "job_descriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_scores" ADD CONSTRAINT "resume_scores_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resume_scores" ADD CONSTRAINT "resume_scores_jd_id_job_descriptions_id_fk" FOREIGN KEY ("jd_id") REFERENCES "public"."job_descriptions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usage_logs" ADD CONSTRAINT "usage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "affiliate_events_type_idx" ON "affiliate_events" USING btree ("event_type");--> statement-breakpoint
CREATE INDEX "affiliate_events_product_idx" ON "affiliate_events" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "affiliate_events_created_idx" ON "affiliate_events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_events_session_idx" ON "affiliate_events" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "applications_user_id_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cover_letters_user_id_idx" ON "cover_letters" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "job_descriptions_user_id_idx" ON "job_descriptions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "resume_scores_resume_id_idx" ON "resume_scores" USING btree ("resume_id");--> statement-breakpoint
CREATE INDEX "resume_scores_jd_id_idx" ON "resume_scores" USING btree ("jd_id");--> statement-breakpoint
CREATE INDEX "resumes_user_id_idx" ON "resumes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_user_id_idx" ON "subscriptions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscriptions_paddle_subscription_id_idx" ON "subscriptions" USING btree ("paddle_subscription_id");--> statement-breakpoint
CREATE INDEX "usage_logs_user_id_feature_idx" ON "usage_logs" USING btree ("user_id","feature");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_clerk_id_idx" ON "users" USING btree ("clerk_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_paddle_subscription_id_idx" ON "users" USING btree ("paddle_subscription_id");