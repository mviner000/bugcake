// convex/schema.ts

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const checklistStatusEnum = v.union(
  v.literal("Open"),
  v.literal("In Progress"),
  v.literal("Deferred"),
  v.literal("Finished")
);

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
    
    // NEW FIELD: Optional array of user IDs for single or multiple assignees
    // This allows:
    // 1. No assignees (field is missing or set to undefined) - if optional()
    // 2. No assignees (field is present but empty: [])
    // 3. Single assignee: [id1]
    // 4. Multiple assignees: [id1, id2, id3]
    assigneeIds: v.optional(v.array(v.id("users"))),
  })
    .index("by_sheetId", ["sheetId"]) // Index to quickly fetch modules for a sheet
    // NEW INDEX: To quickly find all modules assigned to a specific user ID
    .index("by_assigneeId", ["assigneeIds"]), // Convex indexes array elements individually

  functionalityTestCases: defineTable({
    // Link to the sheets table
    sheetId: v.id("sheets"),

    // Core info
    title: v.string(), // Test Case Title
    // UPDATED: 'module' now references the new 'modules' table
    module: v.id("modules"),
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

    // =======================================================
  // NEW 'moduleAccessRequests' table
  // =======================================================
  moduleAccessRequests: defineTable({
    // Foreign key to the module the user is requesting access to
    moduleId: v.id("modules"),
    
    // Foreign key to the sheet this module belongs to for efficient querying.
    sheetId: v.id("sheets"),

    // The user who is making the request
    requesterId: v.id("users"),

    // The status of the request
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined")
    ),

    // Optional message from the requester for context
    message: v.optional(v.string()),
  })
    // Index to find all requests for a specific sheet (for admins/owners to review)
    .index("by_sheetId", ["sheetId"])
    // Index to find all requests made by a specific user (for their dashboard)
    .index("by_requesterId", ["requesterId"])
    // Index to prevent duplicate requests and quickly find a specific request
    .index("by_module_and_requester", ["moduleId", "requesterId"]),


  // Main checklist table
  checklists: defineTable({
    sheetId: v.id("sheets"),
    
    // Sprint/Release Information
    sprintName: v.string(),
    titleRevisionNumber: v.string(),
    
    // ✅ NEW: Track the source test case type
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel")
    ),

    environment: v.union(
      v.literal("development"),
      v.literal("testing"),
      v.literal("production")
    ),
    
    // Progress Tracking
    status: checklistStatusEnum,
    progress: v.number(),
    
    // Team Assignment
    testExecutorAssigneeId: v.id("users"),
    additionalAssignees: v.optional(v.array(v.id("users"))),
    
    accessLevel: v.union(
      v.literal("restricted"),      // Only explicitly added members
      v.literal("anyoneWithLink"), // Anyone with the link
      v.literal("public")            // Fully public
    ),
    
    // Timeline
    dateStarted: v.optional(v.number()),
    goalDateToFinish: v.number(),
    dateFinished: v.optional(v.number()),
    
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    
    // Audit & Context
    description: v.optional(v.string()),
    sourceTestCaseCount: v.number(),
    includedWorkflowStatuses: v.array(v.string()),
  })
    .index("by_sheet", ["sheetId"])
    .index("by_status", ["status"])
    .index("by_executor", ["testExecutorAssigneeId"])
    .index("by_sheet_and_status", ["sheetId", "status"])
    .index("by_goalDate", ["goalDateToFinish"])
    // ✅ NEW: Index to filter checklists by type
    .index("by_testCaseType", ["testCaseType"])
    .index("by_sheet_and_type", ["sheetId", "testCaseType"]),

  // Checklist items (immutable copies of test cases)
  checklistItems: defineTable({
    checklistId: v.id("checklists"), // Parent checklist
    
    // SNAPSHOT: Copy all relevant fields from functionalityTestCases at creation time
    // Core Test Case Data (immutable snapshot)
    originalTestCaseId: v.string(), // Reference to original (for traceability, not for sync)
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel")
    ),
    
    // Functionality Test Case Fields (snapshot)
    title: v.string(),
    module: v.string(), // Store module NAME (not ID) to avoid orphaning if module deleted
    subModule: v.optional(v.string()),
    level: v.union(v.literal("High"), v.literal("Low")),
    scenario: v.union(v.literal("Happy Path"), v.literal("Unhappy Path")),
    preConditions: v.optional(v.string()),
    steps: v.string(),
    expectedResults: v.string(),
    
    // Original metadata (for reference)
    originalCreatedBy: v.string(), // Store name/email, not ID
    originalCreatedAt: v.number(),
    jiraUserStory: v.optional(v.string()),
    
    // Execution Status (MUTABLE - this is what changes during sprint)
    executionStatus: v.union(
      v.literal("Not Run"),
      v.literal("Passed"),
      v.literal("Failed"),
      v.literal("Blocked"),
      v.literal("Skipped")
    ),
    actualResults: v.optional(v.string()), // Captured during execution
    executedBy: v.optional(v.id("users")),
    executedAt: v.optional(v.number()),
    
    // Defect Tracking
    defectsFound: v.optional(v.array(v.string())), // Array of Jira ticket IDs
    notes: v.optional(v.string()), // Executor notes
    
    // Ordering
    sequenceNumber: v.number(), // Preserve original order
    
    // Timestamps
    createdAt: v.number(), // When this item was added to checklist
    updatedAt: v.number(), // Last execution update
  })
    .index("by_checklist", ["checklistId"])
    .index("by_executionStatus", ["executionStatus"])
    .index("by_checklist_and_status", ["checklistId", "executionStatus"])
    .index("by_originalTestCase", ["originalTestCaseId"]), // For traceability


  /**
  * Table for managing checklist members/collaborators
  * This allows multiple users to view and work on checklists together
  */
  checklistMembers: defineTable({
  checklistId: v.id("checklists"),
  userId: v.id("users"),
  role: v.union(
    v.literal("owner"),      // Full control over the checklist
    v.literal("qa_lead"),    // Can manage QA testers and oversee testing progress
    v.literal("qa_tester"),  // Can execute tests and update statuses
    v.literal("viewer")      // Can only view the checklist
  ),
  addedBy: v.id("users"), // Who added this member
  addedAt: v.number(),
})
  .index("by_checklist", ["checklistId"])
  .index("by_user", ["userId"])
  .index("by_checklist_and_user", ["checklistId", "userId"]),
  
  // ✅ NEW: Bug Lists Table
  bugLists: defineTable({
    checklistId: v.id("checklists"),      // Link to parent checklist
    sheetId: v.id("sheets"),              // Link to sheet for easy querying
    
    // Sprint Information (copied from checklist for convenience)
    sprintName: v.string(),
    titleRevisionNumber: v.string(),
    environment: v.union(
      v.literal("development"),
      v.literal("testing"),
      v.literal("production")
    ),
    
    // Bug List Status
    status: v.union(
      v.literal("Active"),       // Bugs are being tracked
      v.literal("Under Review"),  // Waiting for review/triage
      v.literal("Resolved"),      // All bugs resolved
      v.literal("Archived")       // Sprint completed, archived for reference
    ),
    
    // Statistics (updated as bugs are created/resolved)
    totalBugs: v.number(),
    openBugs: v.number(),
    resolvedBugs: v.number(),
    
    // Team Assignment (same as checklist)
    leadAssigneeId: v.id("users"),
    additionalAssignees: v.optional(v.array(v.id("users"))),
    
    // Access Control
    accessLevel: v.union(
      v.literal("restricted"),
      v.literal("anyoneWithLink"),
      v.literal("public")
    ),
    
    // Metadata
    createdBy: v.id("users"),
    createdAt: v.number(),
    updatedAt: v.number(),
    
    description: v.optional(v.string()),
  })
    .index("by_checklist", ["checklistId"])
    .index("by_sheet", ["sheetId"])
    .index("by_status", ["status"])
    .index("by_leadAssignee", ["leadAssigneeId"]),

  bugs: defineTable({
    // --- Links to the Source ---
    checklistItemId: v.id("checklistItems"), // The specific checklist item that failed
    checklistId: v.id("checklists"),       // The checklist/sprint this bug was found in
    bugListId: v.id("bugLists"),           // Link to bug list
    sheetId: v.id("sheets"),              // The sheet this bug belongs to
    originalTestCaseId: v.string(),       // The original test case ID for traceability

    // --- Bug Details (Pre-filled from test case) ---
    title: v.string(),                    // Pre-filled from checklistItem.title
    stepsToReproduce: v.string(),         // Pre-filled from checklistItem.steps
    expectedResults: v.string(),          // Pre-filled from checklistItem.expectedResults
    actualResults: v.string(),            // The "actual results" entered by the QA tester

    // --- Bug Tracking ---
    status: v.union(
      v.literal("Open"),            // Bug reported, awaiting initial review
      v.literal("Under Review"),    // Developer/Tech Lead reviewing the bug for validity, priority, scope
      v.literal("Assigned"),        // Bug validated and assigned to a developer
      v.literal("In Progress"),     // Developer actively working on the fix
      v.literal("Fixed"),           // Fix completed and deployed to test environment
      v.literal("Waiting for QA"),  // Explicitly in QA's queue for retesting
      v.literal("Passed"),          // QA confirmed the fix works
      v.literal("Reopened"),        // QA retested and bug still exists
      v.literal("Closed"),          // Final state, bug is resolved and verified
      v.literal("Won't Fix")        // After review, bug rejected (duplicate, not a bug, won't address)
    ),
    priority: v.optional(v.union(
      v.literal("High"), v.literal("Medium"), v.literal("Low")
    )),
    
    // --- Assignment & Metadata ---
    reportedBy: v.id("users"),            // The QA tester who ran the test
    assignedTo: v.optional(v.id("users")),// The Software Engineer assigned to fix it
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    // --- Indexes for fast querying ---
    .index("by_checklistItem", ["checklistItemId"])
    .index("by_bugList", ["bugListId"])
    .index("by_assignedTo", ["assignedTo"])
    .index("by_status", ["status"])
    .index("by_sheet", ["sheetId"]),

  checklistAccessRequests: defineTable({
    checklistId: v.id("checklists"),
    requesterId: v.id("users"),
    requestedRole: v.union(
      v.literal("qa_lead"),
      v.literal("qa_tester"),
      v.literal("viewer")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined")
    ),
    message: v.optional(v.string()),
    requestedAt: v.number(),
  })
    .index("by_checklist", ["checklistId"])
    .index("by_checklist_and_requester", ["checklistId", "requesterId"]),
});