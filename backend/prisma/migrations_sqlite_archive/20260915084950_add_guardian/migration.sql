-- CreateTable
CREATE TABLE "guardian_relationships" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "seniorUserId" TEXT NOT NULL,
    "guardianUserId" TEXT,
    "guardianEmail" TEXT NOT NULL,
    "approvalThreshold" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" DATETIME,
    CONSTRAINT "guardian_relationships_seniorUserId_fkey" FOREIGN KEY ("seniorUserId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "guardian_relationships_guardianUserId_fkey" FOREIGN KEY ("guardianUserId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "guardian_approvals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "relationshipId" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    CONSTRAINT "guardian_approvals_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "guardian_relationships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
