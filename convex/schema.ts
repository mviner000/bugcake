// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    verificationStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
    ),
    // Add the new 'role' field here
    role: v.optional(
      v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin")),
    ),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),
  /**
   * Sessions.
   * A single user can have multiple active sessions.
   * See [Session document lifecycle](https://labs.convex.dev/auth/advanced#session-document-lifecycle).
   */
  authSessions: defineTable({
    userId: v.id("users"),
    expirationTime: v.number(),
  }).index("userId", ["userId"]),
  /**
   * Accounts. An account corresponds to
   * a single authentication provider.
   * A single user can have multiple accounts linked.
   */
  authAccounts: defineTable({
    userId: v.id("users"),
    provider: v.string(),
    providerAccountId: v.string(),
    secret: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("userIdAndProvider", ["userId", "provider"])
    .index("providerAndAccountId", ["provider", "providerAccountId"]),
  /**
   * Refresh tokens.
   * Refresh tokens are generally meant to be used once, to be exchanged for another
   * refresh token and a JWT access token, but with a few exceptions:
   * - The "active refresh token" is the most recently created refresh token that has
   *   not been used yet. The parent of the active refresh token can always be used to
   *   obtain the active refresh token.
   * - A refresh token can be used within a 10 second window ("reuse window") to
   *   obtain a new refresh token.
   * - On any invalid use of a refresh token, the token itself and all its descendants
   *   are invalidated.
   */
  authRefreshTokens: defineTable({
    sessionId: v.id("authSessions"),
    expirationTime: v.number(),
    firstUsedTime: v.optional(v.number()),
    // This is the ID of the refresh token that was exchanged to create this one.
    parentRefreshTokenId: v.optional(v.id("authRefreshTokens")),
  })
    // Sort by creationTime
    .index("sessionId", ["sessionId"])
    .index("sessionIdAndParentRefreshTokenId", [
      "sessionId",
      "parentRefreshTokenId",
    ]),
  /**
   * Verification codes:
   * - OTP tokens
   * - magic link tokens
   * - OAuth codes
   */
  authVerificationCodes: defineTable({
    accountId: v.id("authAccounts"),
    provider: v.string(),
    code: v.string(),
    expirationTime: v.number(),
    verifier: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    phoneVerified: v.optional(v.string()),
  })
    .index("accountId", ["accountId"])
    .index("code", ["code"]),
  /**
   * PKCE verifiers for OAuth.
   */
  authVerifiers: defineTable({
    sessionId: v.optional(v.id("authSessions")),
    signature: v.optional(v.string()),
  }).index("signature", ["signature"]),
  /**
   * Rate limits for OTP and password sign-in.
   */
  authRateLimits: defineTable({
    identifier: v.string(),
    lastAttemptTime: v.number(),
    attemptsLeft: v.number(),
  }).index("identifier", ["identifier"]),
  numbers: defineTable({
    value: v.number(),
  }),

  // =======================================================
  // UPDATED 'sheets' table
  // =======================================================
  sheets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("sheet"),
      v.literal("doc"),
      v.literal("pdf"),
      v.literal("folder"),
      v.literal("other"),
    ),
    owner: v.id("users"), // Changed to reference the 'users' table directly
    last_opened_at: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
    shared: v.boolean(),

    // New fields for permission
    isPublic: v.optional(v.boolean()),
    requestable: v.optional(v.boolean()),

    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel"),
    ),
  }),

  // =======================================================
  // NEW 'permissions' table
  // =======================================================
  permissions: defineTable({
    sheetId: v.id("sheets"),
    userId: v.id("users"),
    level: v.union(
      v.literal("viewer"),
      v.literal("commenter"),
      v.literal("editor"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
    ),
    message: v.optional(v.string()), // Added for the optional message in the request
  })
    .index("bySheetId", ["sheetId"])
    .index("byUserId", ["userId"])
    .index("bySheetAndUser", ["sheetId", "userId"]),

  functionalityTestCases: defineTable({
    // Link to the sheets table
    sheetId: v.id("sheets"),

    // Core info
    title: v.string(), // Test Case Title
    module: v.optional(v.string()), // Module (<=50 chars - enforce in app)
    subModule: v.optional(v.string()),

    // Classification
    level: v.union(v.literal("High"), v.literal("Low")), // TC_Level
    scenario: v.union(v.literal("Happy Path"), v.literal("Unhappy Path")), // Scenarios

    // Test content
    preConditions: v.optional(v.string()),
    steps: v.string(), // Test Steps
    expectedResults: v.string(),
    actualResults: v.optional(v.string()),

    // Status tracking
    status: v.union(
      v.literal("Passed"),
      v.literal("Failed"),
      v.literal("Not Run"),
      v.literal("Blocked"),
      v.literal("Not Available"),
    ),

    // References
    createdBy: v.id("users"),
    executedBy: v.optional(v.id("users")),
    jiraUserStory: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(), // auto: Date.now()
    updatedAt: v.number(), // auto update
    executedAt: v.optional(v.number()), // set manually when executed

    // New field
    rowHeight: v.number(),
  })
    .index("createdBy", ["createdBy"])
    .index("executedBy", ["executedBy"])
    .index("status", ["status"])
    .index("module", ["module"]),

  altTextAriaLabelTestCases: defineTable({
    // Link to the sheets table
    sheetId: v.id("sheets"),

    // Core info
    persona: v.union(
      v.literal("Super Admin"),
      v.literal("Admin"),
      v.literal("User"),
      v.literal("Employee"),
      v.literal("Reporting Manager"),
      v.literal("Manager"),
    ),
    module: v.string(),
    subModule: v.optional(v.string()),
    pageSection: v.string(),
    wireframeLink: v.optional(v.string()),
    imagesIcons: v.optional(v.string()), // Assuming image URLs or identifiers
    remarks: v.optional(v.string()),
    altTextAriaLabel: v.string(),

    // Status tracking
    seImplementation: v.union(
      v.literal("Not yet"),
      v.literal("Ongoing"),
      v.literal("Done"),
      v.literal("Has Concerns"),
      v.literal("To Update"),
      v.literal("Outdated"),
      v.literal("Not Available"),
    ),
    actualResults: v.optional(v.string()),
    testingStatus: v.union(
      v.literal("Passed"),
      v.literal("Failed"),
      v.literal("Not Run"),
      v.literal("Blocked"),
      v.literal("Not Available"),
    ),

    // References
    createdBy: v.id("users"),
    executedBy: v.optional(v.id("users")),
    jiraUserStory: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(), // auto: Date.now()
    updatedAt: v.number(), // auto update
    executedAt: v.optional(v.number()), // set manually when executed

    // New field
    rowHeight: v.number(),
  })
    .index("sheetId", ["sheetId"])
    .index("persona", ["persona"])
    .index("seImplementation", ["seImplementation"])
    .index("testingStatus", ["testingStatus"])
    .index("module", ["module"])
    .index("createdBy", ["createdBy"])
    .index("executedBy", ["executedBy"]),
});
