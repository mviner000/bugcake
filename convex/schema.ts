// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const workflowStatusEnum = v.union(
  v.literal("Open"),
  v.literal("Waiting for QA Lead Approval"),
  v.literal("Needs revision"),
  v.literal("In Progress"),
  v.literal("Approved"),
  v.literal("Declined"),
  v.literal("Reopen"),
  v.literal("Won't Do")
);

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

    // New fields for password reset
    resetPasswordToken: v.optional(v.string()), // The unique token 
    resetPasswordExpiry: v.optional(v.number()), // Unix timestamp (e.g., 1 hour expiry)

    // Add the new 'role' field here
    role: v.optional(
      v.union(v.literal("user"), v.literal("admin"), v.literal("super_admin")),
    ),
  })
    .index("email", ["email"])
    .index("phone", ["phone"])
    // Optional: Add an index on the token for quick lookup during the reset phase
    .index("by_reset_token", ["resetPasswordToken"]), 
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

    accessLevel: v.union(
      v.literal("restricted"), // Only explicitly added users
      v.literal("anyoneWithLink"), // Anyone with the link
      v.literal("public") // Fully public
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
      v.literal("qa_lead"),
      v.literal("qa_tester"),
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

    // =======================================================
  // NEW 'modules' table
  // =======================================================
  modules: defineTable({
    sheetId: v.id("sheets"), // Link to the specific sheet
    name: v.string(),        // The name of the module, e.g., "User Profile"
    createdBy: v.id("users"),// Who created the module
  }).index("by_sheetId", ["sheetId"]), // Index to quickly fetch modules for a sheet

  functionalityTestCases: defineTable({
    // Link to the sheets table
    sheetId: v.id("sheets"),

    // Core info
    title: v.string(), // Test Case Title
    // UPDATED: 'module' now references the new 'modules' table
    module: v.optional(v.id("modules")),
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
    // NEW: Workflow Status field
    workflowStatus: workflowStatusEnum,
  })
    .index("createdBy", ["createdBy"])
    .index("executedBy", ["executedBy"])
    .index("status", ["status"])
    // UPDATED: Index on the new module ID field
    .index("by_module", ["module"]),

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
    // UPDATED: 'module' now references the new 'modules' table
    module: v.id("modules"),
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
    notes: v.optional(v.string()),
    jiraUserStory: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(), // auto: Date.now()
    updatedAt: v.number(), // auto update
    executedAt: v.optional(v.number()), // set manually when executed

    // New field
    rowHeight: v.number(),
    // NEW: Workflow Status field
    workflowStatus: workflowStatusEnum,
  })
    .index("sheetId", ["sheetId"])
    .index("persona", ["persona"])
    .index("seImplementation", ["seImplementation"])
    .index("testingStatus", ["testingStatus"])
    // UPDATED: Index on the new module ID field
    .index("by_module", ["module"])
    .index("createdBy", ["createdBy"])
    .index("executedBy", ["executedBy"]),

    supportMessages: defineTable({
    userId: v.id("users"), // The link to the user who sent the message
    subject: v.string(), // The subject line from the form
    message: v.string(), // The message content
    isResolved: v.boolean(), // Simple flag to see if it's handled
    
    // New fields for tracking resolution
    resolvedBy: v.optional(v.id("users")), // The admin who resolved the message
    dateCreated: v.number(), // Timestamp of when the message was created
    dateResolved: v.optional(v.number()), // Timestamp of when it was resolved
  })
    .index("by_userId", ["userId"]) // To find all messages from a user
    .index("by_isResolved", ["isResolved"]), // To find all unresolved messages


  /**
   * Message Views.
   * Tracks which admin has seen which support message.
   * A single message can have multiple view records (one for each admin).
   */
  messageViews: defineTable({
    messageId: v.id("supportMessages"), // The message that was viewed
    adminId: v.id("users"),           // The ID of the super_admin who viewed it
    viewedAt: v.number(),             // Timestamp of the view
  })
    // 1. Index to efficiently check if *a specific admin* has viewed *a specific message*
    .index("byMessageAndAdmin", ["messageId", "adminId"])
    // 2. Index to efficiently fetch all views for a message (e.g., to get a count)
    .index("byMessageId", ["messageId"]),

  columnWidths: defineTable({
    sheetId: v.id("sheets"),
    columnName: v.string(), // e.g., "title", "module", "steps"
    width: v.number(), // width in pixels
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel"),
    ),
  })
    .index("bySheetId", ["sheetId"])
    .index("bySheetAndType", ["sheetId", "testCaseType"]),

  activityLogs: defineTable({
    // Link to the specific item being acted upon
    testCaseId: v.string(),
    testCaseType: v.union(v.literal("functionality"), v.literal("altTextAriaLabel")),
    // Data for the 'created by: email | username on datecreated' requirement
    action: v.union(v.literal("Created"), v.literal("Updated"), v.literal("Deleted"), v.literal("Status Change")),
    
    // User Identity (assuming you have a 'users' table)
    userId: v.id("users"),
    username: v.string(),
    userEmail: v.string(), // To fulfill the 'email | username' requirement
    
    sheetId: v.id("sheets"), // Add this field for efficient querying

    // Timestamp (fulfills the 'on datecreated' part)
    timestamp: v.number(), // Use the built-in system field _creationTime

    // Optional: Context/detail about the change (useful for "Updated")
    details: v.optional(v.string()), // e.g., "Updated Title and Status from Passed to Failed"
  })
    // Efficiently query all logs for a specific test case (for the Activity History Sheet)
    .index("by_testCase", ["testCaseId", "testCaseType"])
    // Efficiently query by user (e.g., to see all of a user's activity)
    .index("by_user", ["userId"])
    .index("by_sheet", ["sheetId"])
    .index("by_sheetId_timestamp", ["sheetId", "timestamp"]),

  sheetPermissions: defineTable({
    sheetId: v.id("sheets"),
    userId: v.id("users"),
    // Define the roles for access control
   role: v.union(
      v.literal("owner"),
      v.literal("qa_lead"), // Added QA Lead
      v.literal("qa_tester"), // Added QA Tester
      v.literal("viewer")
    ),
  })
    // Index for quickly checking a user's permission on a sheet (Critical for Step 5)
    .index("by_sheet_and_user", ["sheetId", "userId"])
    // Index for quickly fetching all users who have access to a specific sheet (Critical for Share Modal)
    .index("by_sheet", ["sheetId"]),
});

