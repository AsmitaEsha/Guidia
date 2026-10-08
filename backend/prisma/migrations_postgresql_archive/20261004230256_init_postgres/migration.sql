-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SENIOR', 'GUARDIAN', 'ADMIN');

-- CreateEnum
CREATE TYPE "CognitiveState" AS ENUM ('CALM', 'UNSURE', 'SCARED');

-- CreateEnum
CREATE TYPE "RiskContentType" AS ENUM ('URL', 'SMS', 'MESSAGE', 'SCREENSHOT');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('SAFE', 'WARNING', 'HIGH_RISK', 'CRITICAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "InterceptionResolution" AS ENUM ('PROCEED', 'EDIT', 'HELP');

-- CreateEnum
CREATE TYPE "GuardianStatus" AS ENUM ('PENDING', 'ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "GuardianRole" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "PermissionScope" AS ENUM ('EMERGENCY_ALERTS', 'APPROVAL_REQUESTS', 'LEARNING_PROGRESS', 'TASK_ACTIVITY', 'SAFETY_ALERTS', 'MEMORY_BOOK', 'PRIVATE_CONVERSATIONS', 'FINANCIAL_DETAILS');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "MemoryCategory" AS ENUM ('MESSAGING', 'SAFETY', 'BANKING', 'LEARNING', 'SOCIAL', 'PRIVACY');

-- CreateEnum
CREATE TYPE "AppCategory" AS ENUM ('MESSAGING', 'SOCIAL', 'EMAIL', 'PAYMENT', 'SHOPPING', 'HEALTHCARE', 'TRAVEL', 'OTHER');

-- CreateEnum
CREATE TYPE "LearningDomain" AS ENUM ('DIGITAL_OPERATIONS', 'SOCIAL_COMMUNICATION', 'DIGITAL_SAFETY', 'INFORMATION_LITERACY', 'AI_PRIVACY_LITERACY');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('ACTIVE', 'PAUSED', 'WAITING_FOR_CONFIRMATION', 'WAITING_FOR_GUARDIAN', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TaskEventType" AS ENUM ('TASK_STARTED', 'STEP_VIEWED', 'ACTION_ATTEMPTED', 'ACTION_SUCCEEDED', 'ACTION_FAILED', 'HINT_SHOWN', 'VOICE_USED', 'SCREENSHOT_ANALYZED', 'SAFETY_WARNING', 'CONFIRMATION_REQUESTED', 'GUARDIAN_REQUESTED', 'GUARDIAN_APPROVED', 'GUARDIAN_REJECTED', 'TASK_PAUSED', 'TASK_RESUMED', 'TASK_COMPLETED', 'TASK_CANCELLED');

-- CreateEnum
CREATE TYPE "AttemptOutcome" AS ENUM ('SUCCESS', 'FAILED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MasteryLevel" AS ENUM ('NEW', 'GUIDED', 'PRACTICING', 'INDEPENDENT', 'RETAINED', 'MASTERED');

-- CreateEnum
CREATE TYPE "ConversationMode" AS ENUM ('ASSISTANT', 'SCREEN', 'VOICE', 'TASK');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM', 'TOOL');

-- CreateEnum
CREATE TYPE "KnowledgeSource" AS ENUM ('VERIFIED_GUIDIA', 'OFFICIAL_SOURCE', 'SIMULATION', 'USER_PROVIDED', 'MODEL_INTERPRETATION', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "ScreenshotSource" AS ENUM ('UPLOAD', 'EXTENSION');

-- CreateEnum
CREATE TYPE "ScreenshotStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ActionStatus" AS ENUM ('DRAFT', 'REVIEW', 'USER_CONFIRMED', 'GUARDIAN_PENDING', 'GUARDIAN_APPROVED', 'EXECUTING', 'EXECUTED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "EmergencyReason" AS ENUM ('I_AM_CONFUSED', 'I_THINK_THIS_IS_UNSAFE', 'I_MAY_HAVE_MADE_A_MISTAKE', 'PAYMENT_HELP', 'APPOINTMENT_HELP', 'OTHER');

-- CreateEnum
CREATE TYPE "EmergencyStatus" AS ENUM ('TRIGGERED', 'SENT', 'ACKNOWLEDGED', 'CONTACTED', 'RESOLVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "NotificationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'SKIPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('VOICE_PROCESSING', 'SCREENSHOT_PROCESSING', 'GUARDIAN_SHARING', 'EXTENSION_CONNECTION', 'TEMPORARY_SUPPORT', 'ANALYTICS');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'GUARDIAN', 'ADMIN', 'SYSTEM', 'AI');

-- CreateEnum
CREATE TYPE "TxDirection" AS ENUM ('DEBIT', 'CREDIT');

-- CreateEnum
CREATE TYPE "ModelStatus" AS ENUM ('TRAINING', 'STAGED', 'ACTIVE', 'RETIRED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'SENIOR',
    "preferredLanguage" TEXT NOT NULL DEFAULT 'en',
    "age" INTEGER,
    "countryCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cognitiveState" "CognitiveState" NOT NULL DEFAULT 'CALM',
    "fontSize" INTEGER NOT NULL DEFAULT 20,
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "reducedMotion" BOOLEAN NOT NULL DEFAULT false,
    "voiceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "voiceSpeed" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "voiceAutoPlay" BOOLEAN NOT NULL DEFAULT false,
    "preferVoice" BOOLEAN NOT NULL DEFAULT false,
    "notificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "onboardingDone" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "replacedById" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "revokeReason" TEXT,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_reset_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_reset_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_assessments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentType" "RiskContentType" NOT NULL,
    "contentExcerpt" TEXT NOT NULL,
    "severity" "RiskSeverity" NOT NULL,
    "signals" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "decisionTrace" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_assessments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "safety_interceptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "resolution" "InterceptionResolution" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "safety_interceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "action_proposals" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskSessionId" TEXT,
    "applicationSlug" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "status" "ActionStatus" NOT NULL DEFAULT 'DRAFT',
    "payload" JSONB NOT NULL,
    "amountMinor" INTEGER,
    "currency" TEXT,
    "isSimulation" BOOLEAN NOT NULL DEFAULT true,
    "confirmationLevel" INTEGER NOT NULL DEFAULT 1,
    "confirmationsGiven" INTEGER NOT NULL DEFAULT 0,
    "requiresGuardian" BOOLEAN NOT NULL DEFAULT false,
    "reasons" JSONB NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "executedAt" TIMESTAMP(3),

    CONSTRAINT "action_proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_relationships" (
    "id" TEXT NOT NULL,
    "seniorUserId" TEXT NOT NULL,
    "guardianUserId" TEXT,
    "guardianEmail" TEXT NOT NULL,
    "role" "GuardianRole" NOT NULL DEFAULT 'PRIMARY',
    "approvalThreshold" INTEGER NOT NULL DEFAULT 0,
    "status" "GuardianStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "guardian_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_permissions" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "scope" "PermissionScope" NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "guardian_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guardian_approvals" (
    "id" TEXT NOT NULL,
    "relationshipId" TEXT NOT NULL,
    "actionProposalId" TEXT,
    "actionType" TEXT NOT NULL,
    "summary" JSONB NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "guardian_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_events" (
    "id" TEXT NOT NULL,
    "seniorId" TEXT NOT NULL,
    "reason" "EmergencyReason" NOT NULL,
    "severity" "RiskLevel" NOT NULL DEFAULT 'HIGH',
    "message" TEXT,
    "status" "EmergencyStatus" NOT NULL DEFAULT 'TRIGGERED',
    "taskSessionId" TEXT,
    "acknowledgedById" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "contactedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "emergency_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "severity" "NotificationSeverity" NOT NULL DEFAULT 'LOW',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "dedupeKey" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAttemptAt" TIMESTAMP(3),
    "lastError" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "notificationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "category" "AppCategory" NOT NULL,
    "countryCodes" TEXT[],
    "supportedLanguages" TEXT[],
    "currency" TEXT,
    "riskProfile" "RiskLevel" NOT NULL DEFAULT 'LOW',
    "hasSimulation" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "applicationId" TEXT,
    "domain" "LearningDomain" NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 5,
    "skillKey" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "safetyTips" JSONB,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_steps" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "body" JSONB NOT NULL,
    "hint" JSONB,

    CONSTRAINT "lesson_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenarios" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "lessonId" TEXT,
    "skillKey" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'BEGINNER',
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scenario_steps" (
    "id" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "instruction" JSONB NOT NULL,
    "expectedAction" TEXT,
    "hint" JSONB,
    "recovery" JSONB,
    "riskLevel" "RiskLevel" NOT NULL DEFAULT 'LOW',

    CONSTRAINT "scenario_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guided_task_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationId" TEXT,
    "lessonId" TEXT,
    "scenarioId" TEXT,
    "goal" TEXT,
    "currentStepOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "TaskStatus" NOT NULL DEFAULT 'ACTIVE',
    "context" JSONB NOT NULL DEFAULT '{}',
    "language" TEXT NOT NULL DEFAULT 'en',
    "version" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pausedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guided_task_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "task_events" (
    "id" TEXT NOT NULL,
    "taskSessionId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "type" "TaskEventType" NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "task_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scenarioId" TEXT,
    "taskSessionId" TEXT,
    "applicationSlug" TEXT,
    "skillKey" TEXT NOT NULL,
    "outcome" "AttemptOutcome" NOT NULL,
    "independent" BOOLEAN NOT NULL DEFAULT false,
    "hintCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_skills" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skillKey" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "successfulAttempts" INTEGER NOT NULL DEFAULT 0,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "independentSuccesses" INTEGER NOT NULL DEFAULT 0,
    "hintsUsed" INTEGER NOT NULL DEFAULT 0,
    "competenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "retentionScore" DOUBLE PRECISION,
    "masteryLevel" "MasteryLevel" NOT NULL DEFAULT 'NEW',
    "lastPracticedAt" TIMESTAMP(3),
    "nextReviewAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_book_entries" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "MemoryCategory" NOT NULL,
    "summary" TEXT NOT NULL,
    "skillKey" TEXT,
    "lessonId" TEXT,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_book_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskSessionId" TEXT,
    "title" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "mode" "ConversationMode" NOT NULL DEFAULT 'ASSISTANT',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archivedAt" TIMESTAMP(3),

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "redactions" INTEGER NOT NULL DEFAULT 0,
    "intent" TEXT,
    "intentConfidence" DOUBLE PRECISION,
    "riskLevel" TEXT,
    "grounding" "KnowledgeSource",
    "provenance" JSONB,
    "structured" JSONB,
    "provider" TEXT,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "screenshot_analyses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskSessionId" TEXT,
    "source" "ScreenshotSource" NOT NULL DEFAULT 'UPLOAD',
    "status" "ScreenshotStatus" NOT NULL DEFAULT 'PENDING',
    "storageKey" TEXT,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sourceHost" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "question" TEXT,
    "result" JSONB,
    "riskLevel" "RiskSeverity",
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screenshot_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "applicationSlug" TEXT NOT NULL,
    "balanceMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulation_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "actionProposalId" TEXT,
    "direction" "TxDirection" NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "counterpartyLabel" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "simulation_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extension_pairings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "codeHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extension_pairings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "extension_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "scopes" TEXT[],
    "extensionId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extension_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ConsentType" NOT NULL,
    "scope" JSONB,
    "granteeUserId" TEXT,
    "policyVersion" TEXT NOT NULL,
    "grantedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorUserId" TEXT,
    "actorType" "ActorType" NOT NULL,
    "action" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "requestId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_request_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "requestId" TEXT,
    "feature" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "degraded" BOOLEAN NOT NULL DEFAULT false,
    "errorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_request_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "idempotency_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "responseStatus" INTEGER NOT NULL,
    "responseBody" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_documents" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "applicationSlug" TEXT,
    "language" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "sourceType" "KnowledgeSource" NOT NULL DEFAULT 'VERIFIED_GUIDIA',
    "source" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_chunks" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "ordinal" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ml_model_versions" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "baseModel" TEXT NOT NULL,
    "datasetVersion" TEXT NOT NULL,
    "gitCommit" TEXT,
    "modelHash" TEXT,
    "metrics" JSONB NOT NULL,
    "status" "ModelStatus" NOT NULL DEFAULT 'STAGED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ml_model_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_userId_key" ON "user_preferences"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_tokenHash_key" ON "sessions"("tokenHash");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_familyId_idx" ON "sessions"("familyId");

-- CreateIndex
CREATE UNIQUE INDEX "password_reset_tokens_tokenHash_key" ON "password_reset_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "password_reset_tokens_userId_idx" ON "password_reset_tokens"("userId");

-- CreateIndex
CREATE INDEX "risk_assessments_userId_createdAt_idx" ON "risk_assessments"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "safety_interceptions_userId_createdAt_idx" ON "safety_interceptions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "action_proposals_userId_status_idx" ON "action_proposals"("userId", "status");

-- CreateIndex
CREATE INDEX "action_proposals_expiresAt_idx" ON "action_proposals"("expiresAt");

-- CreateIndex
CREATE INDEX "guardian_relationships_seniorUserId_idx" ON "guardian_relationships"("seniorUserId");

-- CreateIndex
CREATE INDEX "guardian_relationships_guardianUserId_idx" ON "guardian_relationships"("guardianUserId");

-- CreateIndex
CREATE INDEX "guardian_relationships_guardianEmail_status_idx" ON "guardian_relationships"("guardianEmail", "status");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_permissions_relationshipId_scope_key" ON "guardian_permissions"("relationshipId", "scope");

-- CreateIndex
CREATE UNIQUE INDEX "guardian_approvals_actionProposalId_key" ON "guardian_approvals"("actionProposalId");

-- CreateIndex
CREATE INDEX "guardian_approvals_relationshipId_status_idx" ON "guardian_approvals"("relationshipId", "status");

-- CreateIndex
CREATE INDEX "emergency_events_seniorId_status_idx" ON "emergency_events"("seniorId", "status");

-- CreateIndex
CREATE INDEX "notifications_userId_readAt_idx" ON "notifications"("userId", "readAt");

-- CreateIndex
CREATE INDEX "notifications_userId_createdAt_idx" ON "notifications"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_userId_dedupeKey_key" ON "notifications"("userId", "dedupeKey");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_idempotencyKey_key" ON "outbox_events"("idempotencyKey");

-- CreateIndex
CREATE INDEX "outbox_events_status_nextAttemptAt_idx" ON "outbox_events"("status", "nextAttemptAt");

-- CreateIndex
CREATE UNIQUE INDEX "applications_slug_key" ON "applications"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lessons_slug_key" ON "lessons"("slug");

-- CreateIndex
CREATE INDEX "lessons_status_domain_idx" ON "lessons"("status", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_steps_lessonId_order_key" ON "lesson_steps"("lessonId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "scenarios_slug_key" ON "scenarios"("slug");

-- CreateIndex
CREATE INDEX "scenarios_applicationId_status_idx" ON "scenarios"("applicationId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "scenario_steps_scenarioId_order_key" ON "scenario_steps"("scenarioId", "order");

-- CreateIndex
CREATE INDEX "guided_task_sessions_userId_status_idx" ON "guided_task_sessions"("userId", "status");

-- CreateIndex
CREATE INDEX "guided_task_sessions_expiresAt_idx" ON "guided_task_sessions"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "task_events_taskSessionId_sequence_key" ON "task_events"("taskSessionId", "sequence");

-- CreateIndex
CREATE INDEX "practice_attempts_userId_skillKey_idx" ON "practice_attempts"("userId", "skillKey");

-- CreateIndex
CREATE UNIQUE INDEX "user_skills_userId_skillKey_key" ON "user_skills"("userId", "skillKey");

-- CreateIndex
CREATE INDEX "memory_book_entries_userId_createdAt_idx" ON "memory_book_entries"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "conversations_userId_lastMessageAt_idx" ON "conversations"("userId", "lastMessageAt");

-- CreateIndex
CREATE INDEX "conversation_messages_conversationId_createdAt_idx" ON "conversation_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "screenshot_analyses_userId_createdAt_idx" ON "screenshot_analyses"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "screenshot_analyses_expiresAt_idx" ON "screenshot_analyses"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_accounts_userId_applicationSlug_key" ON "simulation_accounts"("userId", "applicationSlug");

-- CreateIndex
CREATE UNIQUE INDEX "simulation_transactions_actionProposalId_key" ON "simulation_transactions"("actionProposalId");

-- CreateIndex
CREATE INDEX "simulation_transactions_accountId_createdAt_idx" ON "simulation_transactions"("accountId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "extension_pairings_codeHash_key" ON "extension_pairings"("codeHash");

-- CreateIndex
CREATE UNIQUE INDEX "extension_tokens_tokenHash_key" ON "extension_tokens"("tokenHash");

-- CreateIndex
CREATE INDEX "extension_tokens_userId_idx" ON "extension_tokens"("userId");

-- CreateIndex
CREATE INDEX "consent_records_userId_type_idx" ON "consent_records"("userId", "type");

-- CreateIndex
CREATE INDEX "audit_logs_actorUserId_createdAt_idx" ON "audit_logs"("actorUserId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_targetType_targetId_idx" ON "audit_logs"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "ai_request_logs_feature_createdAt_idx" ON "ai_request_logs"("feature", "createdAt");

-- CreateIndex
CREATE INDEX "idempotency_keys_expiresAt_idx" ON "idempotency_keys"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "idempotency_keys_userId_key_route_key" ON "idempotency_keys"("userId", "key", "route");

-- CreateIndex
CREATE INDEX "knowledge_documents_status_language_idx" ON "knowledge_documents"("status", "language");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_documents_slug_language_version_key" ON "knowledge_documents"("slug", "language", "version");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_chunks_documentId_ordinal_key" ON "knowledge_chunks"("documentId", "ordinal");

-- CreateIndex
CREATE UNIQUE INDEX "ml_model_versions_role_version_key" ON "ml_model_versions"("role", "version");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_assessments" ADD CONSTRAINT "risk_assessments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "safety_interceptions" ADD CONSTRAINT "safety_interceptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_proposals" ADD CONSTRAINT "action_proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "action_proposals" ADD CONSTRAINT "action_proposals_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "guided_task_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_seniorUserId_fkey" FOREIGN KEY ("seniorUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_relationships" ADD CONSTRAINT "guardian_relationships_guardianUserId_fkey" FOREIGN KEY ("guardianUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_permissions" ADD CONSTRAINT "guardian_permissions_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "guardian_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_approvals" ADD CONSTRAINT "guardian_approvals_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "guardian_relationships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guardian_approvals" ADD CONSTRAINT "guardian_approvals_actionProposalId_fkey" FOREIGN KEY ("actionProposalId") REFERENCES "action_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_seniorId_fkey" FOREIGN KEY ("seniorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "guided_task_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_events" ADD CONSTRAINT "emergency_events_acknowledgedById_fkey" FOREIGN KEY ("acknowledgedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outbox_events" ADD CONSTRAINT "outbox_events_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_steps" ADD CONSTRAINT "lesson_steps_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenarios" ADD CONSTRAINT "scenarios_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scenario_steps" ADD CONSTRAINT "scenario_steps_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guided_task_sessions" ADD CONSTRAINT "guided_task_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guided_task_sessions" ADD CONSTRAINT "guided_task_sessions_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guided_task_sessions" ADD CONSTRAINT "guided_task_sessions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guided_task_sessions" ADD CONSTRAINT "guided_task_sessions_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "task_events" ADD CONSTRAINT "task_events_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "guided_task_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_scenarioId_fkey" FOREIGN KEY ("scenarioId") REFERENCES "scenarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_attempts" ADD CONSTRAINT "practice_attempts_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "guided_task_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_skills" ADD CONSTRAINT "user_skills_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memory_book_entries" ADD CONSTRAINT "memory_book_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "guided_task_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_messages" ADD CONSTRAINT "conversation_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshot_analyses" ADD CONSTRAINT "screenshot_analyses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "screenshot_analyses" ADD CONSTRAINT "screenshot_analyses_taskSessionId_fkey" FOREIGN KEY ("taskSessionId") REFERENCES "guided_task_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_accounts" ADD CONSTRAINT "simulation_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_transactions" ADD CONSTRAINT "simulation_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "simulation_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "simulation_transactions" ADD CONSTRAINT "simulation_transactions_actionProposalId_fkey" FOREIGN KEY ("actionProposalId") REFERENCES "action_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_pairings" ADD CONSTRAINT "extension_pairings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "extension_tokens" ADD CONSTRAINT "extension_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "idempotency_keys" ADD CONSTRAINT "idempotency_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "knowledge_chunks" ADD CONSTRAINT "knowledge_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "knowledge_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;
