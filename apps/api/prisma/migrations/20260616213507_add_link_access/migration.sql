-- CreateTable
CREATE TABLE "LinkAccess" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ip" TEXT,
    "referer" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "deviceType" TEXT,
    "country" TEXT,
    "city" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LinkAccess_linkId_idx" ON "LinkAccess"("linkId");

-- CreateIndex
CREATE INDEX "LinkAccess_createdAt_idx" ON "LinkAccess"("createdAt");

-- AddForeignKey
ALTER TABLE "LinkAccess" ADD CONSTRAINT "LinkAccess_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
