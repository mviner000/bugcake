// code convex/myFunctions.ts

import { v } from "convex/values";
import { query, mutation, action, QueryCtx, MutationCtx } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { Id } from "./_generated/dataModel";
import { workflowStatusEnum } from "./schema";


type UserRole = "owner" | "viewer" | "qa_lead" | "qa_tester";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);
    return {
      viewer: user?.email ?? null,
      numbers: numbers.reverse().map((number) => number.value),
    };
  },
});

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});

export const listSheets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    const sheets = await ctx.db.query("sheets").order("desc").take(100);

    // Fetch user details and permissions for each sheet
    const sheetsWithDetails = await Promise.all(
      sheets.map(async (sheet) => {
        const ownerUser = await ctx.db.get(sheet.owner);
        const ownerName = ownerUser?.email || "Unknown User";

        const normalizedUserId = userId
          ? ctx.db.normalizeId("users", userId)
          : null;

        const isOwnedByMe =
          normalizedUserId !== null && normalizedUserId === sheet.owner;

        // Fetch all permissions for the current sheet
        const permissions = await ctx.db
          .query("permissions")
          .filter((q) => q.eq(q.field("sheetId"), sheet._id))
          .collect();

        // Fetch user details for each permission
        const permissionDetails = await Promise.all(
          permissions.map(async (permission) => {
            const user = await ctx.db.get(permission.userId);
            return {
              userEmail: user?.email || "Unknown",
              level: permission.level,
              status: permission.status,
            };
          }),
        );

        const hasPermissions = permissionDetails.length > 0;

        return {
          ...sheet,
          ownerName,
          isOwnedByMe,
          permissions: permissionDetails, // Add the permissions to the sheet object
          hasPermissions,
        };
      }),
    );
    return sheetsWithDetails;
  },
});

// Query to get a single sheet by ID
export const getSheetById = query({
  args: {
    id: v.string(), // Use string to match the URL parameter type
  },
  handler: async (ctx, args) => {
    // Normalize the string ID from the URL to a Convex Id
    const sheetId = ctx.db.normalizeId("sheets", args.id);

    // If the ID is invalid, return null
    if (!sheetId) {
      return null;
    }

    return await ctx.db.get(sheetId);
  },
});

// Query to list test cases for a specific sheet
export const listTestCasesBySheetId = query({
  args: {
    sheetId: v.string(),
  },
  handler: async (ctx, args) => {
    // Normalize the sheetId from the URL
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);

    // If the ID is invalid, return an empty array
    if (!normalizedSheetId) {
      return { testCases: [], viewer: null };
    }

    const testCasesQuery = ctx.db
      .query("functionalityTestCases")
      .filter((q) => q.eq(q.field("sheetId"), normalizedSheetId));

    const rawTestCases = await testCasesQuery.order("desc").take(100);

    const testCasesWithUsers = await Promise.all(
      rawTestCases.map(async (testCase) => {
        // Corrected line: Fetch the user from the 'users' table
        const createdByUser = await ctx.db.get(testCase.createdBy);

        // Corrected line: Use the 'email' from the user document
        const executedByUser = testCase.executedBy
          ? await ctx.db.get(testCase.executedBy)
          : null;

        return {
          ...testCase,
          createdByName: createdByUser?.email || "Unknown User",
          executedByName: executedByUser?.email || "N/A",
        };
      }),
    );

    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);

    return {
      viewer: user?.email ?? null,
      testCases: testCasesWithUsers,
    };
  },
});

export const updateSheetAccessLevel = mutation({
  args: {
    sheetId: v.string(),
    accessLevel: v.union(
      v.literal("restricted"),
      v.literal("anyoneWithLink"), 
      v.literal("public")
    )
  },
  handler: async (ctx, args) => {
    // Normalize the sheet ID
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      throw new Error("Invalid sheet ID");
    }

    // ✅ Check if user is authenticated
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required");
    }

    // ✅ Verify user has permission to change access (owners/qa_lead only)
    const userPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", normalizedSheetId).eq("userId", currentUserId)
      )
      .unique();

    if (!userPermission) {
      throw new Error("You don't have access to this sheet");
    }

    if (!["owner", "qa_lead"].includes(userPermission.role)) {
      throw new Error("Only owners and qa_lead can change access levels");
    }

    // ✅ Update the sheet's access level
    await ctx.db.patch(normalizedSheetId, {
      accessLevel: args.accessLevel
    });

    return { success: true };
  },
});
// Mutation to update row height for functionality test cases
export const updateFunctionalityTestCaseRowHeight = mutation({
  args: {
    testCaseId: v.string(),
    rowHeight: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Normalize the testCaseId
    const normalizedTestCaseId = ctx.db.normalizeId(
      "functionalityTestCases",
      args.testCaseId,
    );
    if (!normalizedTestCaseId) {
      throw new Error("Invalid test case ID");
    }

    // Get the test case to verify it exists
    const testCase = await ctx.db.get(normalizedTestCaseId);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    // Validate row height (minimum 20px, maximum 500px for safety)
    const clampedHeight = Math.max(20, Math.min(500, args.rowHeight));

    // Update only the rowHeight field
    await ctx.db.patch(normalizedTestCaseId, {
      rowHeight: clampedHeight,
      updatedAt: Date.now(),
    });

    return { success: true, newHeight: clampedHeight };
  },
});

// Mutation to update row height for alt text aria label test cases
export const updateAltTextAriaLabelTestCaseRowHeight = mutation({
  args: {
    testCaseId: v.string(),
    rowHeight: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    // Normalize the testCaseId
    const normalizedTestCaseId = ctx.db.normalizeId(
      "altTextAriaLabelTestCases",
      args.testCaseId,
    );
    if (!normalizedTestCaseId) {
      throw new Error("Invalid test case ID");
    }

    // Get the test case to verify it exists
    const testCase = await ctx.db.get(normalizedTestCaseId);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    // Validate row height (minimum 20px, maximum 500px for safety)
    const clampedHeight = Math.max(20, Math.min(500, args.rowHeight));

    // Update only the rowHeight field
    await ctx.db.patch(normalizedTestCaseId, {
      rowHeight: clampedHeight,
      updatedAt: Date.now(),
    });

    return { success: true, newHeight: clampedHeight };
  },
});

export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    return user;
  },
});

export const listAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const userId = await getAuthUserId(ctx);
    const user = userId === null ? null : await ctx.db.get(userId);

    // Only "approved" users get to see the full list of details.
    if (user?.verificationStatus === "approved") {
      return allUsers;
    }

    // For all other users (unauthorized/unapproved), return a limited set of public data.
    // This maintains data consistency for the front-end while preserving security.
    return allUsers.map((u) => ({
      _id: u._id,
      _creationTime: u._creationTime,
      name: u.name,
      email: u.email,
      phone: u.phone,
      image: u.image,
      verificationStatus: u.verificationStatus,
      role: u.role,
    }));
  },
});

export const updateUserVerificationStatus = mutation({
  args: {
    userId: v.id("users"), // The ID of the user to update
    newStatus: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("declined"),
    ),
  },
  handler: async (ctx, args) => {
    // 1. Get the ID of the logged-in user
    const loggedInUserId = await getAuthUserId(ctx);

    // 2. Ensure a user is logged in
    if (!loggedInUserId) {
      throw new Error("Authentication required. Please log in to continue.");
    }

    // 3. Fetch the logged-in user's profile to check their role
    const loggedInUser = await ctx.db.get(loggedInUserId);
    if (!loggedInUser) {
      throw new Error("User profile not found. Please contact support.");
    }

    // 4. Implement access control: only "super_admin" users can update verification status
    if (loggedInUser.role !== "super_admin") {
      throw new Error(
        "Access denied. Only super administrators can update user verification status.",
      );
    }

    // 5. Verify the target user exists before updating
    const targetUser = await ctx.db.get(args.userId);
    if (!targetUser) {
      throw new Error(
        "Target user not found. Cannot update verification status.",
      );
    }

    // 6. Update the target user's verification status
    await ctx.db.patch(args.userId, {
      verificationStatus: args.newStatus,
    });

    return {
      success: true,
      message: `User verification status updated to "${args.newStatus}" successfully.`,
    };
  },
});

export const createSheetWithModules = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("sheet"),
      v.literal("doc"),
      v.literal("pdf"),
      v.literal("folder"),
      v.literal("other"),
    ),
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel"),
    ),
    shared: v.boolean(),
    isPublic: v.optional(v.boolean()),
    requestable: v.optional(v.boolean()),
    modules: v.array(v.string()), // ✅ NEW: Accept array of module names
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: You must be logged in to create a sheet.");
    }

    const normalizedUserId = ctx.db.normalizeId("users", userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user session.");
    }

    // ✅ Validate: At least one module is required
    if (!args.modules || args.modules.length === 0) {
      throw new Error("At least one module is required.");
    }

    const now = Date.now();

    // 1. Create the sheet
    const sheetId = await ctx.db.insert("sheets", {
      name: args.name,
      type: args.type,
      owner: normalizedUserId,
      last_opened_at: now,
      created_at: now,
      updated_at: now,
      shared: args.shared,
      testCaseType: args.testCaseType,
      isPublic: args.isPublic ?? false,
      requestable: args.requestable ?? false,
      accessLevel: "restricted",
    });

    // 2. Add the creator as "owner" in sheetPermissions
    await ctx.db.insert("sheetPermissions", {
      sheetId: sheetId,
      userId: normalizedUserId,
      role: "owner",
    });

    // 3. ✅ Create ALL modules linked to this sheet
    for (const moduleName of args.modules) {
      await ctx.db.insert("modules", {
        sheetId: sheetId,
        name: moduleName.trim(), // Trim whitespace
        createdBy: normalizedUserId,
      });
    }

    return sheetId;
  },
});

export const createSheet = mutation({
  args: {
    name: v.string(),
    type: v.union(
      v.literal("sheet"),
      v.literal("doc"),
      v.literal("pdf"),
      v.literal("folder"),
      v.literal("other"),
    ),
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel"),
    ),
    shared: v.boolean(),
    isPublic: v.optional(v.boolean()),
    requestable: v.optional(v.boolean()),
    moduleName: v.string(), // NEW: Module name to create with the sheet
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: You must be logged in to create a sheet.");
    }

    const normalizedUserId = ctx.db.normalizeId("users", userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user session.");
    }

    const now = Date.now();

    // Insert the new sheet
    const sheetId = await ctx.db.insert("sheets", {
      name: args.name,
      type: args.type,
      owner: normalizedUserId,
      last_opened_at: now,
      created_at: now,
      updated_at: now,
      shared: args.shared,
      testCaseType: args.testCaseType,
      isPublic: args.isPublic ?? false,
      requestable: args.requestable ?? false,
      accessLevel: "restricted",
    });

    // ✅ Auto-add the creator as "owner" in sheetPermissions
    await ctx.db.insert("sheetPermissions", {
      sheetId: sheetId,
      userId: normalizedUserId,
      role: "owner",
    });

    // ✅ NEW: Create the initial module linked to this sheet
    await ctx.db.insert("modules", {
      sheetId: sheetId,
      name: args.moduleName,
      createdBy: normalizedUserId,
    });

    return sheetId;
  },
});

/**
 * Creates a new support message from a user.
 * This is called from the Contact Support modal on the frontend.
 */
export const sendSupportMessage = mutation({
  args: {
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Get the authenticated user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be logged in to send a support message.");
    }

    // We must normalize the ID to ensure it's a valid Doc<"users"> ID
    const normalizedUserId = ctx.db.normalizeId("users", userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user session.");
    }

    // 2. Insert the new message into the database
    await ctx.db.insert("supportMessages", {
      userId: normalizedUserId,
      subject: args.subject,
      message: args.message,
      isResolved: false, // Messages are always unresolved when created
      dateCreated: Date.now(),
    });

    return { success: true, message: "Your support message has been sent!" };
  },
});

/**
 * Retrieves all support messages, along with the sender's email.
 * This is intended for an admin dashboard to view and manage tickets.
 */

export const getSupportMessages = query({
  args: {},
  handler: async (ctx) => {
    // 1. Check if the logged-in user is a super_admin
    const userId = await getAuthUserId(ctx); // This is the ID of the logged-in user
    if (!userId) {
      throw new Error("Authentication required.");
    }

    const user = await ctx.db.get(userId);
    if (user?.role !== "super_admin") {
      throw new Error(
        "Access denied. Only super administrators can view support messages.",
      );
    }

    // 2. Fetch all support messages
    const messages = await ctx.db
      .query("supportMessages")
      .order("desc")
      .collect();

    // 3. Enhance messages with user, resolver, and NEW view details
    const messagesWithDetails = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.userId);
        const resolver = message.resolvedBy
          ? await ctx.db.get(message.resolvedBy)
          : null;

        // Fetch all view records for this message
        const viewRecords = await ctx.db
          .query("messageViews")
          .filter((q) => q.eq(q.field("messageId"), message._id))
          .collect();

        // Calculate view count
        const viewCount = viewRecords.length;

        // Determine if the *currently logged-in admin* has seen it
        const isSeenByMe = viewRecords.some(
          (view) => view.adminId.toString() === userId.toString(),
        );

        return {
          ...message,
          senderEmail: sender?.email ?? "Unknown User",
          resolverEmail: resolver?.email ?? "N/A",
          viewCount, // <-- NEW: Total number of admins who have viewed
          isSeenByMe, // <-- NEW: Has the current admin viewed it?
        };
      }),
    );

    return messagesWithDetails;
  },
});

/**
 * Marks a support message as resolved.
 * This is intended for an admin to call from a support dashboard.
 */
export const resolveSupportMessage = mutation({
  args: {
    messageId: v.id("supportMessages"), // The ID of the message to resolve
  },
  handler: async (ctx, args) => {
    // 1. Check if the logged-in user is a super_admin
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Authentication required.");
    }

    const adminUser = await ctx.db.get(adminUserId);
    if (adminUser?.role !== "super_admin") {
      throw new Error("Access denied. Only super administrators can resolve messages.");
    }

    // 2. Update the message to mark it as resolved
    await ctx.db.patch(args.messageId, {
      isResolved: true,
      resolvedBy: adminUserId, // Record which admin resolved it
      dateResolved: Date.now(), // Record the time of resolution
    });

    return { success: true, message: "Support message has been marked as resolved." };
  },
});

/**
 * Records a view for a support message by the currently logged-in super_admin.
 * It ensures only one view record exists per admin per message (for the specific message).
 */
export const markMessageAsSeen = mutation({
  args: {
    messageId: v.id("supportMessages"), // The ID of the message that was opened
  },
  handler: async (ctx, args) => {
    // 1. Authentication and Authorization Check
    const adminUserId = await getAuthUserId(ctx);
    if (!adminUserId) {
      throw new Error("Authentication required.");
    }

    const adminUser = await ctx.db.get(adminUserId);
    if (adminUser?.role !== "super_admin") {
      throw new Error(
        "Access denied. Only super administrators can mark messages as seen.",
      );
    }

    // 2. Check if the admin has already seen this specific message
    const existingView = await ctx.db
      .query("messageViews")
      .filter((q) =>
        q.and(
          q.eq(q.field("messageId"), args.messageId),
          q.eq(q.field("adminId"), adminUserId),
        ),
      )
      .first();

    // 3. If no existing view, insert a new record
    if (!existingView) {
      await ctx.db.insert("messageViews", {
        messageId: args.messageId,
        adminId: adminUserId,
        viewedAt: Date.now(),
      });
      return { success: true, seen: true, message: "Message marked as seen." };
    }

    return { success: true, seen: true, message: "Message already marked as seen by this admin." };
  },
});

/**
 * Retrieves support messages for a specific user, and the details of ALL unique admins 
 * who have viewed any message in the thread.
 */
export const listSupportMessagesByUserId = query({
  args: {
    targetUserId: v.id("users"), // The ID of the user whose messages to fetch
  },
  handler: async (ctx, args) => {
    // 1. Check if the logged-in user is a super_admin
    const loggedInUserId = await getAuthUserId(ctx);
    if (!loggedInUserId) {
      throw new Error("Authentication required.");
    }

    const loggedInUser = await ctx.db.get(loggedInUserId);
    if (loggedInUser?.role !== "super_admin") {
      throw new Error("Access denied. Only super administrators can view support messages.");
    }
    
    // 2. Fetch all support messages for the target user, ordered by creation time
    const supportMessages = await ctx.db
      .query("supportMessages")
      .filter((q) => q.eq(q.field("userId"), args.targetUserId))
      .order("asc")
      .collect();
      
    // 3. Get sender details
    const targetUser = await ctx.db.get(args.targetUserId);

    // --- START: Seener Logic FIX: Collect ALL unique admins who have viewed the thread ---

    const seenAdminIds = new Set<Id<"users">>();

    if (supportMessages.length > 0) {
      
      // Collect ALL view records for ALL messages in this thread.
      // This is the guaranteed-to-work workaround for missing q.in.
      const allViewRecords: Doc<"messageViews">[] = [];
      
      for (const message of supportMessages) {
        const views = await ctx.db
          .query("messageViews")
          .filter((q) => q.eq(q.field("messageId"), message._id))
          .collect();
        allViewRecords.push(...views);
      }
      
      // Collect the unique admin IDs from all view records
      for (const view of allViewRecords) {
          seenAdminIds.add(view.adminId);
      }
    }
    
    // Convert Set of IDs to array, and fetch full user details for each unique admin
    const uniqueAdminIds = Array.from(seenAdminIds);
    const seenByAdmins = await Promise.all(
        uniqueAdminIds.map(async (adminId) => {
            const adminUser = await ctx.db.get(adminId);
            return {
                _id: adminId,
                name: adminUser?.name || adminUser?.email || "Admin",
                email: adminUser?.email || "N/A",
                image: adminUser?.image || "/placeholder.svg",
            };
        })
    );

    // --- END: Seener Logic FIX ---

    // Determine the display name: Use name, fallback to email, then "Unknown User"
    const displayName = targetUser?.name || targetUser?.email || "Unknown User";

    return {
      supportMessages,
      targetUser: {
        _id: args.targetUserId,
        name: displayName, 
        email: targetUser?.email || "N/A", 
        image: targetUser?.image || "/placeholder.svg",
      },
      // RETURN THE ARRAY OF SEEN ADMINS
      seenByAdmins: seenByAdmins, 
    };
  },
});

/**
 * Calculates the number of support messages sent by a specific user (userId)
 * that the currently logged-in super_admin has NOT marked as seen.
 * * NOTE: This assumes 'supportMessages' has a 'senderId' field indexed.
 */
export const getUnseenMessageCountForUser = query({
  args: {
    targetUserId: v.id("users"), // The user who sent the messages
  },
  handler: async (ctx, args) => {
    // 1. Authorization Check (Only super_admin should calculate this)
    const adminUserId = await getAuthUserId(ctx); // Assuming getAuthUserId exists
    const adminUser = adminUserId ? await ctx.db.get(adminUserId) : null;
    if (adminUser?.role !== "super_admin") {
      return 0;
    }
    
    // 2. Find all messages from the target user
    const userMessages = await ctx.db
      .query("supportMessages")
      .filter((q) => q.eq(q.field("userId"), args.targetUserId)) 
      .collect();

    let unseenCount = 0;

    // 3. Check which messages this specific admin has not seen
    const checks = userMessages.map(async (message) => {
      // Check if a view record exists for this message by the current admin
      const hasBeenSeen = await ctx.db
        .query("messageViews")
        .filter((q) =>
          q.and(
            q.eq(q.field("messageId"), message._id),
            q.eq(q.field("adminId"), adminUserId),
          ),
        )
        .first(); 

      // If 'hasBeenSeen' is null, the message is unseen by this admin
      return hasBeenSeen === null;
    });

    const results = await Promise.all(checks);
    unseenCount = results.filter(isUnseen => isUnseen).length;

    return unseenCount;
  },
});

export const createFunctionalityTestCase = mutation({
  args: {
    sheetId: v.string(),
    title: v.string(),
    level: v.union(v.literal("High"), v.literal("Low")),
    scenario: v.union(v.literal("Happy Path"), v.literal("Unhappy Path")),
    module: v.id("modules"), // UPDATED: Made required (removed v.optional)
    subModule: v.optional(v.string()),
    preConditions: v.optional(v.string()),
    steps: v.string(),
    expectedResults: v.string(),
    status: v.union(
      v.literal("Passed"),
      v.literal("Failed"),
      v.literal("Not Run"),
      v.literal("Blocked"),
      v.literal("Not Available"),
    ),
    jiraUserStory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication and User Details Fetch
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to create a test case.");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Authenticated user record not found.");
    }
    
    // Normalize sheetId for insertion
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
        throw new Error("Invalid Sheet ID provided.");
    }

    // UPDATED: Simplified module ID normalization (now required, not optional)
    const normalizedModuleId = ctx.db.normalizeId("modules", args.module);
    if (!normalizedModuleId) {
      throw new Error("Invalid Module ID provided.");
    }

    const now = Date.now();
    const defaultRowHeight = 20;

    // 2. Insert the new functionalityTestCases document
    const newTestCaseId = await ctx.db.insert("functionalityTestCases", {
      sheetId: normalizedSheetId,
      title: args.title,
      level: args.level,
      scenario: args.scenario,
      module: normalizedModuleId, // UPDATED: Now always defined
      subModule: args.subModule,
      preConditions: args.preConditions,
      steps: args.steps,
      expectedResults: args.expectedResults,
      status: args.status,
      jiraUserStory: args.jiraUserStory,
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      rowHeight: defaultRowHeight,
      workflowStatus: "Open",
    });

    // 3. Log the activity to the 'activityLogs' database
    await ctx.db.insert("activityLogs", {
      testCaseId: newTestCaseId.toString(),
      testCaseType: "functionality",
      action: "Created",
      userId: userId,
      username: user.name ?? user.email?.split('@')[0] ?? "Anonymous",
      userEmail: user.email ?? "N/A",
      sheetId: normalizedSheetId,
      timestamp: now,
      details: `New test case "${args.title}" created with workflow status "Open".`,
    });

    return newTestCaseId;
  },
});

// Get column widths for a sheet
export const getColumnWidths = query({
  args: {
    sheetId: v.string(),
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel"),
    ),
  },
  handler: async (ctx, args) => {
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      return [];
    }

    return await ctx.db
      .query("columnWidths")
      .filter((q) =>
        q.and(
          q.eq(q.field("sheetId"), normalizedSheetId),
          q.eq(q.field("testCaseType"), args.testCaseType),
        ),
      )
      .collect();
  },
});

// Update column width
export const updateColumnWidth = mutation({
  args: {
    sheetId: v.string(),
    columnName: v.string(),
    width: v.number(),
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel"),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      throw new Error("Invalid sheet ID");
    }

    // Check if column width entry exists
    const existing = await ctx.db
      .query("columnWidths")
      .filter((q) =>
        q.and(
          q.eq(q.field("sheetId"), normalizedSheetId),
          q.eq(q.field("columnName"), args.columnName),
          q.eq(q.field("testCaseType"), args.testCaseType),
        ),
      )
      .first();

    const clampedWidth = Math.max(50, Math.min(1000, args.width));

    if (existing) {
      await ctx.db.patch(existing._id, {
        width: clampedWidth,
      });
    } else {
      await ctx.db.insert("columnWidths", {
        sheetId: normalizedSheetId,
        columnName: args.columnName,
        width: clampedWidth,
        testCaseType: args.testCaseType,
      });
    }

    return { success: true, newWidth: clampedWidth };
  },
});

// Create a new Alt Text / Aria Label test case
export const createAltTextAriaLabelTestCase = mutation({
  args: {
    sheetId: v.string(),
    persona: v.union(
      v.literal("Super Admin"),
      v.literal("Admin"),
      v.literal("User"),
      v.literal("Employee"),
      v.literal("Reporting Manager"),
      v.literal("Manager"),
    ),
    // UPDATED: Expect an ID for the module, not a string name
    module: v.id("modules"),
    subModule: v.optional(v.string()),
    pageSection: v.string(),
    wireframeLink: v.optional(v.string()),
    imagesIcons: v.optional(v.string()),
    remarks: v.optional(v.string()),
    altTextAriaLabel: v.string(),
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
    notes: v.optional(v.string()),
    jiraUserStory: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication and User Details Fetch
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated to create a test case");
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Authenticated user record not found.");
    }

    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      throw new Error("Invalid sheet ID");
    }

    // NEW: Normalize the module ID
    const normalizedModuleId = ctx.db.normalizeId("modules", args.module);
    if (!normalizedModuleId) {
      throw new Error("Invalid module ID");
    }

    // UPDATED: Destructure `module` so it's not included in `restArgs`
    const { sheetId, module, ...restArgs } = args;
    const now = Date.now();
    const defaultRowHeight = 20;

    // 2. Insert the new test case document with default "Open" workflow status
    const newTestCaseId = await ctx.db.insert("altTextAriaLabelTestCases", {
      sheetId: normalizedSheetId,
      // UPDATED: Add the normalized ID explicitly
      module: normalizedModuleId,
      createdBy: userId,
      executedBy: userId,
      rowHeight: defaultRowHeight,
      createdAt: now,
      updatedAt: now,
      workflowStatus: "Open", // ✅ DEFAULT: Set to "Open" on creation
      ...restArgs,
    });

    // 3. Log the activity to the 'activityLogs' database
    await ctx.db.insert("activityLogs", {
      testCaseId: newTestCaseId.toString(),
      testCaseType: "altTextAriaLabel",
      action: "Created",
      userId: userId,
      username: user.name ?? user.email?.split('@')[0] ?? "Anonymous",
      userEmail: user.email ?? "N/A",
      sheetId: normalizedSheetId,
      timestamp: now,
      details: `New test case for page section "${args.pageSection}" created with workflow status "Open".`,
    });

    return newTestCaseId;
  },
});


// This query fetches activity logs for a specific sheet, filtered and sorted by timestamp descending.
export const getActivityLogsForSheet = query({
  args: {
    sheetId: v.id("sheets"),
    filter: v.union(v.literal("all"), v.literal("updates"), v.literal("creates")),
  },
  handler: async (ctx, args) => {
    // 1. Build the base query, using the indexed fields and ordering by timestamp descending
    let logsQuery = ctx.db
      .query("activityLogs")
      .withIndex("by_sheetId_timestamp", (q) => q.eq("sheetId", args.sheetId))
      .order("desc");

    // 2. Apply filtering based on the 'filter' argument
    if (args.filter === "updates") {
      // Assuming 'updates' means any action that is not 'Created'
      logsQuery = logsQuery.filter((q) => q.neq("action", "Created"));
    } else if (args.filter === "creates") {
      logsQuery = logsQuery.filter((q) => q.eq("action", "Created"));
    }

    // 3. Execute the query
    return logsQuery.collect();
  },
});

// Helper to get the current user's ID
const getUserId = async (ctx: QueryCtx | MutationCtx): Promise<Id<"users"> | null> => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || !identity.email) {
    return null; 
  }
  const user = await ctx.db
    .query("users")
    .withIndex("email", (q) => q.eq("email", identity.email!))
    .unique();

  return user ? user._id : null;
};

// 💡 FIX APPLIED HERE: Use the union type (QueryCtx | MutationCtx)
type Role = "owner" | "qa_lead" | "qa_tester" | "viewer" | null;

const checkAccessRoleInternal = async (
  ctx: QueryCtx | MutationCtx, 
  sheetId: Id<"sheets">
): Promise<Role> => {
  // Logic remains the same, using only methods available on both contexts (auth, db.query)
  const userId = await getUserId(ctx);
  if (!userId) return null;

  const permission = await ctx.db
    .query("sheetPermissions")
    .withIndex("by_sheet_and_user", (q) =>
      q.eq("sheetId", sheetId).eq("userId", userId)
    )
    .unique();

  return permission ? permission.role : null;
};

// --- Step 2b: getAccessRole (Now works) ---
export const getAccessRole = query({
  args: { sheetId: v.id("sheets") },
  handler: async (ctx, args) => {
    // ctx is QueryCtx, which is assignable to QueryCtx | MutationCtx
    return await checkAccessRoleInternal(ctx, args.sheetId);
  },
});

// --- Step 3b: updatePermission (Now works) ---
export const updatePermission = mutation({
  args: {
    sheetId: v.id("sheets"),
    targetUserId: v.id("users"),
    role: v.union(
      v.literal("owner"), 
      v.literal("qa_lead"), 
      v.literal("qa_tester"), 
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const sharerId = await getAuthUserId(ctx);
    if (!sharerId) {
      throw new Error("Authentication required.");
    }

    // Get the sharer's permission
    const sharerPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", sharerId)
      )
      .unique();

    // ✅ FIX: Allow owner, qa_lead, AND qa_tester to update permissions
    if (!sharerPermission) {
      throw new Error("You don't have access to this sheet.");
    }

    if (sharerPermission.role === "viewer") {
      throw new Error("Permission denied. Viewers cannot manage permissions.");
    }

    const existingPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", args.targetUserId)
      )
      .unique();

    if (existingPermission) {
      await ctx.db.patch(existingPermission._id, { role: args.role });
    } else {
      await ctx.db.insert("sheetPermissions", {
        sheetId: args.sheetId,
        userId: args.targetUserId,
        role: args.role,
      });
    }

    return { success: true, message: "Permission updated successfully." };
  },
});


export const getUsersWithAccess = query({
  args: { sheetId: v.id("sheets") },
  handler: async (ctx, args) => {
    // Get all permissions for this sheet
    const permissions = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet", (q) => q.eq("sheetId", args.sheetId))
      .collect();

    // Fetch user details for each permission
    const usersWithAccess = await Promise.all(
      permissions.map(async (permission) => {
        const user = await ctx.db.get(permission.userId);
        
        // Get current logged-in user to mark "you"
        const currentUserId = await getAuthUserId(ctx);
        const isCurrentUser = currentUserId === permission.userId;

        return {
          id: permission.userId,
          name: user?.name || user?.email?.split('@')[0] || "Unknown User",
          email: user?.email || "N/A",
          role: permission.role,
          avatarUrl: user?.image,
          isCurrentUser: isCurrentUser,
        };
      })
    );

    return usersWithAccess;
  },
});


export const addUserAccessToSheet = mutation({
  args: {
    sheetId: v.id("sheets"),
    userEmail: v.string(),
    role: v.union(
      v.literal("owner"), 
      v.literal("qa_lead"), 
      v.literal("qa_tester"), 
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Check if current user has permission to share
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", currentUserId)
      )
      .unique();

    // ✅ FIX: Allow owner, qa_lead, AND qa_tester to add people
    if (!currentUserPermission) {
      throw new Error("You don't have access to this sheet.");
    }

    if (currentUserPermission.role === "viewer") {
      throw new Error("Permission denied. Viewers cannot add people.");
    }

    // 2. Find the user by email
    const targetUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.userEmail))
      .unique();

    if (!targetUser) {
      throw new Error("User not found with that email.");
    }

    // 3. Check if user already has access
    const existingPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", targetUser._id)
      )
      .unique();

    if (existingPermission) {
      throw new Error("User already has access to this sheet.");
    }

    // 4. Add the permission
    await ctx.db.insert("sheetPermissions", {
      sheetId: args.sheetId,
      userId: targetUser._id,
      role: args.role,
    });

    return { success: true, message: `Access granted to ${args.userEmail}` };
  },
});

export const removeUserAccessFromSheet = mutation({
  args: {
    sheetId: v.id("sheets"),
    targetUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // Check if current user is owner
    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentUserPermission || currentUserPermission.role !== "owner") {
      throw new Error("Only owners can remove access.");
    }

    // Find and delete the target user's permission
    const targetPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", args.targetUserId)
      )
      .unique();

    if (targetPermission) {
      await ctx.db.delete(targetPermission._id);
    }

    return { success: true };
  },
});

export const checkSheetAccess = async (
  ctx: QueryCtx | MutationCtx,
  sheetId: Id<"sheets">
) => {
  const sheet = await ctx.db.get(sheetId);
  if (!sheet) return { allowed: false, reason: "not_found" };

  // Public sheets are accessible to anyone
  if (sheet.accessLevel === "public") {
    return { allowed: true, public: true };
  }

  const userId = await getAuthUserId(ctx);
  
  // Anyone with link access (authenticated users only)
  if (sheet.accessLevel === "anyoneWithLink" && userId) {
    return { allowed: true, viaLink: true };
  }

  // Restricted access - check explicit permissions
  if (userId) {
    const permission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", sheetId).eq("userId", userId)
      )
      .unique();

    if (permission) {
      return { 
        allowed: true, 
        restricted: true, 
        role: permission.role 
      };
    }
  }

  return { allowed: false, reason: "no_access" };
};

export const getTestCasesForSheet = query({
  args: {
    sheetId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      return null;
    }

    // ✅ Use the centralized authorization check
    const access = await checkSheetAccess(ctx, normalizedSheetId);
    
    if (!access.allowed) {
      return { 
        accessDenied: true, 
        reason: access.reason,
        requiresAuth: access.reason === "no_access" && !(await getAuthUserId(ctx))
      };
    }

    // User has access - continue with existing logic
    const sheet = await ctx.db.get(normalizedSheetId);
    if (!sheet) {
      return null;
    }

    let testCases: any[] = [];

    if (sheet.testCaseType === "functionality") {
      const rawTestCases = await ctx.db
        .query("functionalityTestCases")
        .filter((q) => q.eq(q.field("sheetId"), normalizedSheetId))
        .collect();

      testCases = await Promise.all(
        rawTestCases.map(async (testCase, index) => {
          const createdByUser = await ctx.db.get(testCase.createdBy);
          const executedByUser = testCase.executedBy
            ? await ctx.db.get(testCase.executedBy)
            : null;

          // ✅ NEW: Fetch module name if module exists
          let moduleName = "N/A";
          if (testCase.module) {
            const module = await ctx.db.get(testCase.module);
            moduleName = module?.name || "N/A";
          }

          return {
            ...testCase,
            createdByName: createdByUser?.email || "Unknown User",
            executedByName: executedByUser?.email || "N/A",
            sequenceNumber: index + 1,
            moduleName: moduleName, // ✅ Add module name
          };
        })
      );
    } else if (sheet.testCaseType === "altTextAriaLabel") {
      const rawTestCases = await ctx.db
        .query("altTextAriaLabelTestCases")
        .filter((q) => q.eq(q.field("sheetId"), normalizedSheetId))
        .collect();

      testCases = await Promise.all(
        rawTestCases.map(async (testCase, index) => {
          const createdByUser = await ctx.db.get(testCase.createdBy);
          const executedByUser = testCase.executedBy
            ? await ctx.db.get(testCase.executedBy)
            : null;

          // ✅ NEW: Fetch module name
          let moduleName = "N/A";
          if (testCase.module) {
            const module = await ctx.db.get(testCase.module);
            moduleName = module?.name || "N/A";
          }

          return {
            ...testCase,
            createdByName: createdByUser?.email || "Unknown User",
            executedByName: executedByUser?.email || "N/A",
            sequenceNumber: index + 1,
            moduleName: moduleName, // ✅ Add module name
          };
        })
      );
    }

    return {
      sheet,
      testCaseType: sheet.testCaseType,
      testCases,
      access,
    };
  },
});

// Protected query that uses the authorization check
export const getProtectedSheet = query({
  args: { sheetId: v.id("sheets") },
  handler: async (ctx, args) => {
    const access = await checkSheetAccess(ctx, args.sheetId);
    
    if (!access.allowed) {
      // Return access denied instead of throwing for better UX
      return { 
        accessDenied: true, 
        reason: access.reason,
        requiresAuth: access.reason === "no_access" 
      };
    }

    // User has access - return the sheet data
    const sheet = await ctx.db.get(args.sheetId);
    return { sheet, access };
  },
});

export const requestSheetAccess = mutation({
  args: {
    sheetId: v.string(),
    accessLevel: v.union(
      v.literal("qa_lead"),
      v.literal("qa_tester"),
      v.literal("viewer"),
    ),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to request access.");
    }

    // 2. Normalize the sheet ID
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      throw new Error("Invalid sheet ID.");
    }

    // 3. Verify the sheet exists
    const sheet = await ctx.db.get(normalizedSheetId);
    if (!sheet) {
      throw new Error("Sheet not found.");
    }

    // 4. Check if user already has a permission record (approved, pending, or declined)
    const existingPermission = await ctx.db
      .query("permissions")
      .withIndex("bySheetAndUser", (q) =>
        q.eq("sheetId", normalizedSheetId).eq("userId", userId)
      )
      .unique();

    if (existingPermission) {
      // Handle different existing states
      if (existingPermission.status === "approved") {
        throw new Error("You already have access to this sheet.");
      }
      if (existingPermission.status === "pending") {
        throw new Error("You already have a pending access request for this sheet.");
      }
      if (existingPermission.status === "declined") {
        // Allow re-requesting if previously declined
        await ctx.db.patch(existingPermission._id, {
          level: args.accessLevel,
          status: "pending",
          message: args.message,
        });
        return { 
          success: true, 
          message: "Your access request has been resubmitted." 
        };
      }
    }

    // 5. Create new permission request with "pending" status
    await ctx.db.insert("permissions", {
      sheetId: normalizedSheetId,
      userId: userId,
      level: args.accessLevel,
      status: "pending",
      message: args.message,
    });

    return { 
      success: true, 
      message: "Access request submitted successfully. The owner will be notified." 
    };
  },
});

export const getPendingAccessRequests = query({
  args: {
    sheetId: v.id("sheets"),
  },
  handler: async (ctx, args) => {
    // 1. Check if current user has permission to view requests
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. First check sheetPermissions table for the current user
    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", currentUserId)
      )
      .unique();

    // ✅ FIX: Allow owner, qa_lead, AND qa_tester to view requests
    // Only viewers should be blocked
    if (!currentUserPermission) {
      throw new Error("You don't have access to this sheet.");
    }

    if (currentUserPermission.role === "viewer") {
      throw new Error("Permission denied. Viewers cannot manage access requests.");
    }

    // 3. Fetch all pending permissions for this sheet
    const pendingPermissions = await ctx.db
      .query("permissions")
      .withIndex("bySheetId", (q) => q.eq("sheetId", args.sheetId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // 4. Enhance with user details
    const requestsWithDetails = await Promise.all(
      pendingPermissions.map(async (permission) => {
        const user = await ctx.db.get(permission.userId);

        return {
          id: permission._id,
          userId: permission.userId,
          name: user?.name || user?.email?.split('@')[0] || "Unknown User",
          email: user?.email || "N/A",
          avatarUrl: user?.image || null,
          requestedAt: permission._creationTime,
          requestMessage: permission.message || "No message provided",
          requestedRole: permission.level,
        };
      })
    );

    // Sort by most recent first
    requestsWithDetails.sort((a, b) => b.requestedAt - a.requestedAt);

    return requestsWithDetails;
  },
});

// Mutation to approve access request
export const approveAccessRequest = mutation({
  args: {
    permissionId: v.id("permissions"),
    finalRole: v.union(
      v.literal("owner"), 
      v.literal("qa_lead"), 
      v.literal("qa_tester"), 
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // Get the permission request
    const permission = await ctx.db.get(args.permissionId);
    if (!permission) {
      throw new Error("Permission request not found.");
    }

    // Check if current user can approve
    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", permission.sheetId).eq("userId", currentUserId)
      )
      .unique();

    // ✅ FIX: Allow owner, qa_lead, AND qa_tester to approve requests
    if (!currentUserPermission) {
      throw new Error("You don't have access to this sheet.");
    }

    if (currentUserPermission.role === "viewer") {
      throw new Error("Permission denied. Viewers cannot approve requests.");
    }

    // 1. Update the 'permissions' table status to approved
    await ctx.db.patch(args.permissionId, {
      status: "approved",
    });

    // 2. Check if user already has sheetPermissions (to avoid duplicate entries)
    const existingSheetPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", permission.sheetId).eq("userId", permission.userId)
      )
      .unique();

    if (existingSheetPermission) {
      // Update existing permission
      await ctx.db.patch(existingSheetPermission._id, {
        role: args.finalRole,
      });
    } else {
      // Insert new permission
      await ctx.db.insert("sheetPermissions", {
        sheetId: permission.sheetId,
        userId: permission.userId,
        role: args.finalRole,
      });
    }

    return { success: true, message: "Access request approved successfully." };
  },
});

// Mutation to decline access request
export const declineAccessRequest = mutation({
  args: {
    permissionId: v.id("permissions"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // Get the permission request
    const permission = await ctx.db.get(args.permissionId);
    if (!permission) {
      throw new Error("Permission request not found.");
    }

    // Check if current user can decline
    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", permission.sheetId).eq("userId", currentUserId)
      )
      .unique();

    // ✅ FIX: Allow owner, qa_lead, AND qa_tester to decline requests
    if (!currentUserPermission) {
      throw new Error("You don't have access to this sheet.");
    }

    if (currentUserPermission.role === "viewer") {
      throw new Error("Permission denied. Viewers cannot decline requests.");
    }

    // Update the permission status to declined
    await ctx.db.patch(args.permissionId, {
      status: "declined",
    });

    return { success: true, message: "Access request declined." };
  },
});

// NEW: Mutation to update workflow status for functionality test cases
export const updateFunctionalityWorkflowStatus = mutation({
  args: {
    testCaseId: v.string(),
    workflowStatus: v.union(
      v.literal("Open"),
      v.literal("Waiting for QA Lead Approval"),
      v.literal("Needs revision"),
      v.literal("In Progress"),
      v.literal("Approved"),
      v.literal("Declined"),
      v.literal("Reopen"),
      v.literal("Won't Do")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const normalizedTestCaseId = ctx.db.normalizeId(
      "functionalityTestCases",
      args.testCaseId
    );
    if (!normalizedTestCaseId) {
      throw new Error("Invalid test case ID");
    }

    const testCase = await ctx.db.get(normalizedTestCaseId);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    const now = Date.now();
    const oldStatus = testCase.workflowStatus;

    // Update the workflow status
    await ctx.db.patch(normalizedTestCaseId, {
      workflowStatus: args.workflowStatus,
      updatedAt: now,
    });

    // Log the activity
    await ctx.db.insert("activityLogs", {
      testCaseId: args.testCaseId,
      testCaseType: "functionality",
      action: "Status Change",
      userId: userId,
      username: user.name ?? user.email?.split('@')[0] ?? "Anonymous",
      userEmail: user.email ?? "N/A",
      sheetId: testCase.sheetId,
      timestamp: now,
      details: `Workflow status changed from "${oldStatus}" to "${args.workflowStatus}".`,
    });

    return { success: true, newStatus: args.workflowStatus };
  },
});

// NEW: Mutation to update workflow status for alt text aria label test cases
export const updateAltTextAriaLabelWorkflowStatus = mutation({
  args: {
    testCaseId: v.string(),
    workflowStatus: v.union(
      v.literal("Open"),
      v.literal("Waiting for QA Lead Approval"),
      v.literal("Needs revision"),
      v.literal("In Progress"),
      v.literal("Approved"),
      v.literal("Declined"),
      v.literal("Reopen"),
      v.literal("Won't Do")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const normalizedTestCaseId = ctx.db.normalizeId(
      "altTextAriaLabelTestCases",
      args.testCaseId
    );
    if (!normalizedTestCaseId) {
      throw new Error("Invalid test case ID");
    }

    const testCase = await ctx.db.get(normalizedTestCaseId);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    const now = Date.now();
    const oldStatus = testCase.workflowStatus;

    // Update the workflow status
    await ctx.db.patch(normalizedTestCaseId, {
      workflowStatus: args.workflowStatus,
      updatedAt: now,
    });

    // Log the activity
    await ctx.db.insert("activityLogs", {
      testCaseId: args.testCaseId,
      testCaseType: "altTextAriaLabel",
      action: "Status Change",
      userId: userId,
      username: user.name ?? user.email?.split('@')[0] ?? "Anonymous",
      userEmail: user.email ?? "N/A",
      sheetId: testCase.sheetId,
      timestamp: now,
      details: `Workflow status changed from "${oldStatus}" to "${args.workflowStatus}".`,
    });

    return { success: true, newStatus: args.workflowStatus };
  },
});

// ============================================
// FUNCTIONALITY TEST CASES - Batch Update
// ============================================
export const batchUpdateFunctionalityWorkflowStatus = mutation({
  args: {
    testCaseIds: v.array(v.string()),
    workflowStatus: v.literal("Waiting for QA Lead Approval"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const results: { success: number; failed: number; errors: string[] } = { 
      success: 0, 
      failed: 0, 
      errors: [] 
    };

    for (const testCaseIdStr of args.testCaseIds) {
      try {
        const normalizedTestCaseId = ctx.db.normalizeId(
          "functionalityTestCases",
          testCaseIdStr
        );
        if (!normalizedTestCaseId) {
          results.failed++;
          results.errors.push(`Invalid ID: ${testCaseIdStr}`);
          continue;
        }

        const testCase = await ctx.db.get(normalizedTestCaseId);
        if (!testCase) {
          results.failed++;
          results.errors.push(`Test case not found: ${testCaseIdStr}`);
          continue;
        }

        const oldStatus = testCase.workflowStatus;

        // Update workflow status
        await ctx.db.patch(normalizedTestCaseId, {
          workflowStatus: args.workflowStatus,
          updatedAt: now,
        });

        // Log the activity
        await ctx.db.insert("activityLogs", {
          testCaseId: testCaseIdStr,
          testCaseType: "functionality",
          action: "Status Change",
          userId: userId,
          username: user.name ?? user.email?.split("@")[0] ?? "Anonymous",
          userEmail: user.email ?? "N/A",
          sheetId: testCase.sheetId,
          timestamp: now,
          details: `Workflow status changed from "${oldStatus}" to "${args.workflowStatus}" (batch update).`,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Error updating ${testCaseIdStr}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return {
      success: true,
      summary: {
        total: args.testCaseIds.length,
        successful: results.success,
        failed: results.failed,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    };
  },
});

// ============================================
// FUNCTIONALITY TEST CASES - Single Update
// ============================================
export const updateFunctionalityWorkflowStatusToApproval = mutation({
  args: {
    testCaseId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const normalizedTestCaseId = ctx.db.normalizeId(
      "functionalityTestCases",
      args.testCaseId
    );
    if (!normalizedTestCaseId) {
      throw new Error("Invalid test case ID");
    }

    const testCase = await ctx.db.get(normalizedTestCaseId);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    const now = Date.now();
    const oldStatus = testCase.workflowStatus;
    const newStatus = "Waiting for QA Lead Approval";

    // Update workflow status
    await ctx.db.patch(normalizedTestCaseId, {
      workflowStatus: newStatus,
      updatedAt: now,
    });

    // Log the activity
    await ctx.db.insert("activityLogs", {
      testCaseId: args.testCaseId,
      testCaseType: "functionality",
      action: "Status Change",
      userId: userId,
      username: user.name ?? user.email?.split("@")[0] ?? "Anonymous",
      userEmail: user.email ?? "N/A",
      sheetId: testCase.sheetId,
      timestamp: now,
      details: `Workflow status changed from "${oldStatus}" to "${newStatus}".`,
    });

    return { success: true, newStatus };
  },
});

// ============================================
// ALT TEXT ARIA LABEL TEST CASES - Batch Update 
// ============================================
export const batchUpdateAltTextAriaLabelWorkflowStatus = mutation({
  args: {
    testCaseIds: v.array(v.string()),
    workflowStatus: v.literal("Waiting for QA Lead Approval"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const now = Date.now();
    const results: { success: number; failed: number; errors: string[] } = { 
      success: 0, 
      failed: 0, 
      errors: [] 
    };

    for (const testCaseIdStr of args.testCaseIds) {
      try {
        const normalizedTestCaseId = ctx.db.normalizeId(
          "altTextAriaLabelTestCases",
          testCaseIdStr
        );
        if (!normalizedTestCaseId) {
          results.failed++;
          results.errors.push(`Invalid ID: ${testCaseIdStr}`);
          continue;
        }

        const testCase = await ctx.db.get(normalizedTestCaseId);
        if (!testCase) {
          results.failed++;
          results.errors.push(`Test case not found: ${testCaseIdStr}`);
          continue;
        }

        const oldStatus = testCase.workflowStatus;

        // Update workflow status
        await ctx.db.patch(normalizedTestCaseId, {
          workflowStatus: args.workflowStatus,
          updatedAt: now,
        });

        // Log the activity
        await ctx.db.insert("activityLogs", {
          testCaseId: testCaseIdStr,
          testCaseType: "altTextAriaLabel",
          action: "Status Change",
          userId: userId,
          username: user.name ?? user.email?.split("@")[0] ?? "Anonymous",
          userEmail: user.email ?? "N/A",
          sheetId: testCase.sheetId,
          timestamp: now,
          details: `Workflow status changed from "${oldStatus}" to "${args.workflowStatus}" (batch update).`,
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(
          `Error updating ${testCaseIdStr}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return {
      success: true,
      summary: {
        total: args.testCaseIds.length,
        successful: results.success,
        failed: results.failed,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    };
  },
});

// ============================================
// ALT TEXT ARIA LABEL TEST CASES - Single Update
// ============================================
export const updateAltTextAriaLabelWorkflowStatusToApproval = mutation({
  args: {
    testCaseId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const normalizedTestCaseId = ctx.db.normalizeId(
      "altTextAriaLabelTestCases",
      args.testCaseId
    );
    if (!normalizedTestCaseId) {
      throw new Error("Invalid test case ID");
    }

    const testCase = await ctx.db.get(normalizedTestCaseId);
    if (!testCase) {
      throw new Error("Test case not found");
    }

    const now = Date.now();
    const oldStatus = testCase.workflowStatus;
    const newStatus = "Waiting for QA Lead Approval";

    // Update workflow status
    await ctx.db.patch(normalizedTestCaseId, {
      workflowStatus: newStatus,
      updatedAt: now,
    });

    // Log the activity
    await ctx.db.insert("activityLogs", {
      testCaseId: args.testCaseId,
      testCaseType: "altTextAriaLabel",
      action: "Status Change",
      userId: userId,
      username: user.name ?? user.email?.split("@")[0] ?? "Anonymous",
      userEmail: user.email ?? "N/A",
      sheetId: testCase.sheetId,
      timestamp: now,
      details: `Workflow status changed from "${oldStatus}" to "${newStatus}".`,
    });

    return { success: true, newStatus };
  },
});



export const getAltTextAriaLabelTestCasesAwaitingApproval = query({
  args: {
    sheetId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { testCases: [], viewer: null };
    }

    // Normalize the sheetId
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      return { testCases: [], viewer: null };
    }

    // Query test cases with "Waiting for QA Lead Approval" status
    const testCasesQuery = ctx.db
      .query("altTextAriaLabelTestCases")
      .filter((q) => 
        q.and(
          q.eq(q.field("sheetId"), normalizedSheetId),
          q.eq(q.field("workflowStatus"), "Waiting for QA Lead Approval")
        )
      );

    const rawTestCases = await testCasesQuery.order("desc").collect();

    // Enhance test cases with user information
    const testCasesWithUsers = await Promise.all(
      rawTestCases.map(async (testCase) => {
        const createdByUser = await ctx.db.get(testCase.createdBy);
        const executedByUser = testCase.executedBy
          ? await ctx.db.get(testCase.executedBy)
          : null;

        return {
          ...testCase,
          createdByName: createdByUser?.email || "Unknown User",
          executedByName: executedByUser?.email || "N/A",
        };
      })
    );

    const user = await ctx.db.get(userId);

    return {
      viewer: user?.email ?? null,
      testCases: testCasesWithUsers,
    };
  },
});

// Query for Functionality Test Cases by a specific status
export const getFunctionalityTestCasesByWorkflowStatus = query({
  args: {
    sheetId: v.string(),
    status: workflowStatusEnum, 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { testCases: [], viewer: null };
    }

    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      return { testCases: [], viewer: null };
    }

    const testCasesQuery = ctx.db
      .query("functionalityTestCases")
      .filter((q) => 
        q.and(
          q.eq(q.field("sheetId"), normalizedSheetId),
          q.eq(q.field("workflowStatus"), args.status) 
        )
      );

    const rawTestCases = await testCasesQuery.order("desc").collect();

    const testCasesWithUsers = await Promise.all(
      rawTestCases.map(async (testCase) => {
        const createdByUser = await ctx.db.get(testCase.createdBy);
        const executedByUser = testCase.executedBy
          ? await ctx.db.get(testCase.executedBy)
          : null;

        // ✅ NEW: Fetch module name
        let moduleName = "N/A";
        if (testCase.module) {
          const module = await ctx.db.get(testCase.module);
          moduleName = module?.name || "N/A";
        }

        return {
          ...testCase,
          createdByName: createdByUser?.email || "Unknown User",
          executedByName: executedByUser?.email || "N/A",
          moduleName: moduleName, // ✅ Add module name
        };
      })
    );

    const user = await ctx.db.get(userId);

    return {
      viewer: user?.email ?? null,
      testCases: testCasesWithUsers,
    };
  },
});

// Query for Alt Text/Aria Label Test Cases by a specific workflow status
export const getAltTextAriaLabelTestCasesByWorkflowStatus = query({
  args: {
    sheetId: v.string(),
    status: workflowStatusEnum, 
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { testCases: [], viewer: null };
    }

    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
    if (!normalizedSheetId) {
      return { testCases: [], viewer: null };
    }

    const testCasesQuery = ctx.db
      .query("altTextAriaLabelTestCases")
      .filter((q) => 
        q.and(
          q.eq(q.field("sheetId"), normalizedSheetId),
          q.eq(q.field("workflowStatus"), args.status) 
        )
      );

    const rawTestCases = await testCasesQuery.order("desc").collect();

    const testCasesWithUsers = await Promise.all(
      rawTestCases.map(async (testCase) => {
        const createdByUser = await ctx.db.get(testCase.createdBy);
        const executedByUser = testCase.executedBy
          ? await ctx.db.get(testCase.executedBy)
          : null;

        // ✅ NEW: Fetch module name
        let moduleName = "N/A";
        if (testCase.module) {
          const module = await ctx.db.get(testCase.module);
          moduleName = module?.name || "N/A";
        }

        return {
          ...testCase,
          createdByName: createdByUser?.email || "Unknown User",
          executedByName: executedByUser?.email || "N/A",
          moduleName: moduleName, // ✅ Add module name
        };
      })
    );

    const user = await ctx.db.get(userId);

    return {
      viewer: user?.email ?? null,
      testCases: testCasesWithUsers,
    };
  },
});

// Query for Functionality Test Cases awaiting approval
// export const getFunctionalityTestCasesAwaitingApproval = query({
//   args: {
//     sheetId: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       return { testCases: [], viewer: null };
//     }

//     // Normalize the sheetId
//     const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);
//     if (!normalizedSheetId) {
//       return { testCases: [], viewer: null };
//     }

//     // Query test cases with "Waiting for QA Lead Approval" status
//     const testCasesQuery = ctx.db
//       .query("functionalityTestCases")
//       .filter((q) => 
//         q.and(
//           q.eq(q.field("sheetId"), normalizedSheetId),
//           q.eq(q.field("workflowStatus"), "Waiting for QA Lead Approval")
//         )
//       );

//     const rawTestCases = await testCasesQuery.order("desc").collect();

//     // Enhance test cases with user information
//     const testCasesWithUsers = await Promise.all(
//       rawTestCases.map(async (testCase) => {
//         const createdByUser = await ctx.db.get(testCase.createdBy);
//         const executedByUser = testCase.executedBy
//           ? await ctx.db.get(testCase.executedBy)
//           : null;

//         return {
//           ...testCase,
//           createdByName: createdByUser?.email || "Unknown User",
//           executedByName: executedByUser?.email || "N/A",
//         };
//       })
//     );

//     const user = await ctx.db.get(userId);

//     return {
//       viewer: user?.email ?? null,
//       testCases: testCasesWithUsers,
//     };
//   },
// });


// ============================================
// INTERNAL HELPER for Workflow Status Updates
// ============================================
const _updateWorkflowStatus = async (
  ctx: MutationCtx,
  testCaseId: string,
  testCaseType: "functionality" | "altTextAriaLabel",
  newStatus: "Approved" | "Declined" | "Needs revision"
) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("User must be authenticated");

  const user = await ctx.db.get(userId);
  if (!user) throw new Error("User not found");

  const tableName =
    testCaseType === "functionality"
      ? "functionalityTestCases"
      : "altTextAriaLabelTestCases";

  const normalizedTestCaseId = ctx.db.normalizeId(tableName, testCaseId);
  if (!normalizedTestCaseId) throw new Error("Invalid test case ID");

  const testCase = await ctx.db.get(normalizedTestCaseId);
  if (!testCase) throw new Error("Test case not found");

  const now = Date.now();
  const oldStatus = testCase.workflowStatus;

  await ctx.db.patch(normalizedTestCaseId, {
    workflowStatus: newStatus,
    updatedAt: now,
  });

  await ctx.db.insert("activityLogs", {
    testCaseId: testCaseId,
    testCaseType: testCaseType,
    action: "Status Change",
    userId,
    username: user.name ?? user.email?.split("@")[0] ?? "Anonymous",
    userEmail: user.email ?? "N/A",
    sheetId: testCase.sheetId,
    timestamp: now,
    details: `Workflow status changed from "${oldStatus}" to "${newStatus}".`,
  });

  return { success: true, newStatus };
};

// ============================================
// NEW CONSOLIDATED MUTATION for QA Lead Actions
// ============================================
export const updateTestCaseWorkflowStatus = mutation({
  args: {
    testCaseId: v.string(),
    testCaseType: v.union(
      v.literal("functionality"),
      v.literal("altTextAriaLabel")
    ),
    workflowStatus: v.union(
      v.literal("Approved"),
      v.literal("Declined"),
      v.literal("Needs revision")
    ),
  },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(
      ctx,
      args.testCaseId,
      args.testCaseType,
      args.workflowStatus
    );
  },
});

// ============================================
// REFACTORED MUTATIONS (Backward Compatible)
// ============================================

// --- Approved ---
export const updateFunctionalityWorkflowStatusToApproved = mutation({
  args: { testCaseId: v.string() },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(ctx, args.testCaseId, "functionality", "Approved");
  },
});

export const updateAltTextAriaLabelWorkflowStatusToApproved = mutation({
  args: { testCaseId: v.string() },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(ctx, args.testCaseId, "altTextAriaLabel", "Approved");
  },
});

// --- Declined ---
export const updateFunctionalityWorkflowStatusToDeclined = mutation({
  args: { testCaseId: v.string() },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(ctx, args.testCaseId, "functionality", "Declined");
  },
});

export const updateAltTextAriaLabelWorkflowStatusToDeclined = mutation({
  args: { testCaseId: v.string() },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(ctx, args.testCaseId, "altTextAriaLabel", "Declined");
  },
});

// --- Needs Revision ---
export const updateFunctionalityWorkflowStatusToNeedsRevision = mutation({
  args: { testCaseId: v.string() },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(ctx, args.testCaseId, "functionality", "Needs revision");
  },
});

export const updateAltTextAriaLabelWorkflowStatusToNeedsRevision = mutation({
  args: { testCaseId: v.string() },
  handler: async (ctx, args) => {
    return await _updateWorkflowStatus(ctx, args.testCaseId, "altTextAriaLabel", "Needs revision");
  },
});

/**
 * Fetches all modules associated with a given sheet ID.
 * This is used to populate the Module dropdown when creating a new test case.
 */
export const getModulesForSheet = query({
  args: {
    sheetId: v.id("sheets"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch all modules that belong to the sheetId using the index
    const modules = await ctx.db
      .query("modules")
      .withIndex("by_sheetId", (q) => q.eq("sheetId", args.sheetId))
      .collect();

    // 2. Return the list of modules (including their name and _id)
    // You can add sorting here if needed (e.g., sorting by module name)
    return modules;
  },
});

// =======================================================
// MODULE ASSIGNEE ACCESS REQUESTS
// =======================================================

/**
 * Retrieves all pending module access requests for a given sheet.
 * Only users with 'owner' or 'qa_lead' roles for the sheet can view these.
 */
export const getPendingModuleAccessRequests = query({
  args: {
    sheetId: v.id("sheets"),
  },
  handler: async (ctx, args) => {
    // 1. Authorization check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", currentUserId)
      )
      .unique();

    // Only owners and qa_leads are permitted to view requests
    if (!currentUserPermission || !["owner", "qa_lead"].includes(currentUserPermission.role)) {
      // Return an empty array instead of throwing an error for a better UX
      return [];
    }

    // 2. Fetch all requests with "pending" status for the specified sheet
    const pendingRequests = await ctx.db
      .query("moduleAccessRequests")
      .withIndex("by_sheetId", (q) => q.eq("sheetId", args.sheetId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // 3. Enhance requests with details about the requester and the module
    const requestsWithDetails = await Promise.all(
      pendingRequests.map(async (request) => {
        const requester = await ctx.db.get(request.requesterId);
        const module = await ctx.db.get(request.moduleId);

        return {
          ...request,
          requesterName: requester?.name || requester?.email || "Unknown User",
          requesterEmail: requester?.email || "N/A",
          requesterImage: requester?.image,
          moduleName: module?.name || "Unknown Module",
        };
      })
    );

    return requestsWithDetails;
  },
});

/**
 * Approves a module access request. This updates the request status
 * and adds the user to the module's `assigneeIds` array.
 */
export const approveModuleAccessRequest = mutation({
  args: {
    requestId: v.id("moduleAccessRequests"),
  },
  handler: async (ctx, args) => {
    // 1. Authorization check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== 'pending') {
      throw new Error("Access request not found or is not pending.");
    }

    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", request.sheetId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentUserPermission || !["owner", "qa_lead"].includes(currentUserPermission.role)) {
      throw new Error("You do not have permission to approve requests for this sheet.");
    }

    // 2. Update the request status to "approved"
    await ctx.db.patch(args.requestId, { status: "approved" });

    // 3. Add the user to the module's assignees list
    const module = await ctx.db.get(request.moduleId);
    if (!module) {
      console.warn(`Module with ID ${request.moduleId} not found while approving request ${args.requestId}`);
      return { success: true, message: "Request approved, but the associated module was not found." };
    }

    const currentAssignees = module.assigneeIds || [];
    
    // ✅ FIX: Compare ID types directly using '===' instead of '.equals()'
    if (!currentAssignees.some(id => id === request.requesterId)) {
      await ctx.db.patch(request.moduleId, {
        assigneeIds: [...currentAssignees, request.requesterId],
      });
    }

    return { success: true, message: "Module access request approved." };
  },
});

/**
 * Declines a pending module access request.
 */
export const declineModuleAccessRequest = mutation({
  args: {
    requestId: v.id("moduleAccessRequests"),
  },
  handler: async (ctx, args) => {
    // 1. Authorization check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== 'pending') {
      throw new Error("Access request not found or is not pending.");
    }

    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", request.sheetId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentUserPermission || !["owner", "qa_lead"].includes(currentUserPermission.role)) {
      throw new Error("You do not have permission to decline requests for this sheet.");
    }

    // 2. Update the request status to "declined"
    await ctx.db.patch(args.requestId, { status: "declined" });

    return { success: true, message: "Module access request declined." };
  },
});

/**
 * Creates a new module access request and sets the status to 'pending'.
 */
export const requestModuleAccess = mutation({
  args: {
    moduleId: v.id("modules"),
    sheetId: v.id("sheets"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authorization: Ensure the user is logged in
    const requesterId = await getAuthUserId(ctx);
    if (!requesterId) {
      throw new Error("Authentication required to request module access.");
    }

    // 2. Normalize the IDs
    const normalizedRequesterId = ctx.db.normalizeId("users", requesterId);
    if (!normalizedRequesterId) {
        throw new Error("Invalid user ID.");
    }

    // 3. Check for an existing pending request to prevent spam
    const existingRequest = await ctx.db
      .query("moduleAccessRequests")
      .withIndex("by_module_and_requester", (q) =>
        q.eq("moduleId", args.moduleId).eq("requesterId", normalizedRequesterId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (existingRequest) {
      return { success: false, message: "A pending request for this module already exists." };
    }

    // 4. Insert the new request document
    const requestId = await ctx.db.insert("moduleAccessRequests", {
      moduleId: args.moduleId,
      sheetId: args.sheetId,
      requesterId: normalizedRequesterId,
      status: "pending",
      message: args.message,
    });

    // You may want to trigger a notification action here, e.g., to the sheet owner

    // 💡 THE FIX IS HERE: Removed .id from requestId
    return { success: true, requestId: requestId }; 
  },
})

/**
 * Retrieves all users who currently have access (assignment) to a specific module.
 * Includes module assignees and the sheet owner (who always has access).
 */
export const getUsersWithModuleAccess = query({
  args: {
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    // 1. Authorization check: Must be authenticated
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }

    // 2. Fetch the module
    const module = await ctx.db.get(args.moduleId);
    if (!module) {
      return [];
    }

    // 3. Fetch the sheet (to get owner)
    const sheet = await ctx.db.get(module.sheetId);
    if (!sheet) {
      return [];
    }

    // 4. Permission check: Ensure the user has access to the *sheet*
    const currentUserPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", module.sheetId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentUserPermission) {
      return [];
    }

    // 5. Build list of users with access
    // Start with owner
    const userIdsWithAccess = new Set<Id<"users">>([sheet.owner]);

    // Add module assignees
    const currentModule = await ctx.db.get(args.moduleId);
    const assigneeIds = currentModule?.assigneeIds || [];
    assigneeIds.forEach((id) => userIdsWithAccess.add(id));

    // 6. Also include users with approved access requests (optional if your module tracks them)
    const approvedRequests = await ctx.db
      .query("moduleAccessRequests")
      .withIndex("by_module_and_requester", (q) => q.eq("moduleId", args.moduleId))
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    approvedRequests.forEach((req) => userIdsWithAccess.add(req.requesterId));

    // 7. Fetch user details
    const usersWithAccess = await Promise.all(
      Array.from(userIdsWithAccess).map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (!user) return null;

        let role: UserRole = "qa_tester";
        if (userId === sheet.owner) role = "owner";

        return {
          id: userId,
          name: user.name || user.email || "Unknown User",
          email: user.email || "N/A",
          role,
          isCurrentUser: userId === currentUserId,
        };
      })
    );

    // 8. Return valid users only
    return usersWithAccess.filter((u): u is NonNullable<typeof u> => u !== null);
  },
});


/**
 * Gets the current user's role and module access status for a specific module.
 * This determines what actions they can perform (add test cases, request access, etc.)
 */
export const getUserModuleAccess = query({
  args: {
    moduleId: v.id("modules"),
    sheetId: v.id("sheets"),
  },
  handler: async (ctx, args) => {
    // 1. Check authentication
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return {
        role: "viewer" as const,
        moduleAccessStatus: "none" as const,
        hasAccess: false,
      };
    }

    // 2. Get the user's role on the sheet
    const sheetPermission = await ctx.db
      .query("sheetPermissions")
      .withIndex("by_sheet_and_user", (q) =>
        q.eq("sheetId", args.sheetId).eq("userId", currentUserId)
      )
      .unique();

    // If no sheet permission, they're a viewer
    if (!sheetPermission) {
      return {
        role: "viewer" as const,
        moduleAccessStatus: "none" as const,
        hasAccess: false,
      };
    }

    const userRole = sheetPermission.role;

    // 3. Owners and QA Leads have full access to all modules
    if (userRole === "owner" || userRole === "qa_lead") {
      return {
        role: userRole,
        moduleAccessStatus: "approved" as const,
        hasAccess: true,
      };
    }

    // 4. For QA Testers, check module-specific access
    if (userRole === "qa_tester") {
      // Check if user is assigned to the module
      const module = await ctx.db.get(args.moduleId);
      const isAssigned = module?.assigneeIds?.some(id => id === currentUserId) || false;

      if (isAssigned) {
        return {
          role: "qa_tester" as const,
          moduleAccessStatus: "approved" as const,
          hasAccess: true,
        };
      }

      // Check if there's a pending or declined request
      const accessRequest = await ctx.db
        .query("moduleAccessRequests")
        .withIndex("by_module_and_requester", (q) =>
          q.eq("moduleId", args.moduleId).eq("requesterId", currentUserId)
        )
        .order("desc")
        .first();

      if (accessRequest) {
        return {
          role: "qa_tester" as const,
          moduleAccessStatus: accessRequest.status,
          hasAccess: false,
        };
      }

      // No request exists yet
      return {
        role: "qa_tester" as const,
        moduleAccessStatus: "none" as const,
        hasAccess: false,
      };
    }

    // 5. Viewers can only view
    return {
      role: "viewer" as const,
      moduleAccessStatus: "none" as const,
      hasAccess: false,
    };
  },
});
/**
 * Fetches all users with approved access to a specific module
 * Includes the sheet owner (who always has access) plus approved requesters
 */
export const getModuleAssignees = query({
  args: {
    moduleId: v.id("modules"),
  },
  handler: async (ctx, args) => {
    // 1. Fetch the module to verify it exists
    const module = await ctx.db.get(args.moduleId);
    if (!module) {
      return [];
    }

    // 2. Fetch the sheet to get the owner
    const sheet = await ctx.db.get(module.sheetId);
    if (!sheet) {
      return [];
    }

    // 3. Start with the owner's ID (owner always has access)
    const userIdsWithAccess = new Set<Id<"users">>([sheet.owner]);

    // 4. Find all APPROVED access requests for this module
    const approvedRequests = await ctx.db
      .query("moduleAccessRequests")
      .withIndex("by_module_and_requester", (q) => 
        q.eq("moduleId", args.moduleId)
      )
      .filter((q) => q.eq(q.field("status"), "approved"))
      .collect();

    // 5. Add all approved requesters to the set
    approvedRequests.forEach(req => {
      userIdsWithAccess.add(req.requesterId);
    });

    // 6. Fetch user details for everyone with access
    const assignees = await Promise.all(
      Array.from(userIdsWithAccess).map(async (userId) => {
        const user = await ctx.db.get(userId);
        if (!user) {
          return null;
        }

        // Format for ModuleNamebar TeamMember interface
        return {
          name: user.name || user.email || "Unknown User",
          email: user.email || undefined,
          avatar: user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || user.email || "U")}`,
          fallback: (user.name || user.email || "U")
            .split(" ")
            .map(n => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2),
        };
      })
    );

    // Filter out any null results (in case a user was deleted)
    return assignees.filter((assignee): assignee is NonNullable<typeof assignee> => assignee !== null);
  },
});


export const createChecklistFromSheetFunctionality = mutation({
  args: {
    sheetId: v.id("sheets"),
    selectedTestCaseIds: v.array(v.string()),
    sprintName: v.string(),
    titleRevisionNumber: v.string(),
    testExecutorAssigneeIds: v.array(v.id("users")),
    goalDateToFinish: v.number(),
    description: v.optional(v.string()),
    // ✅ NEW: Environment field (required)
    environment: v.union(
      v.literal("development"),
      v.literal("testing"),
      v.literal("production")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to create a checklist.");
    }

    // Validate: All selected test cases must be "Approved"
    const testCases: (Doc<"functionalityTestCases"> | null)[] = await Promise.all(
      args.selectedTestCaseIds.map(async (id) => {
        const normalizedId = ctx.db.normalizeId("functionalityTestCases", id);
        if (!normalizedId) {
          console.warn(`Invalid test case ID: ${id}`);
          return null;
        }
        return await ctx.db.get(normalizedId);
      })
    );

    const validTestCases = testCases.filter((tc): tc is Doc<"functionalityTestCases"> => tc !== null);
    
    if (validTestCases.length === 0) {
      throw new Error("No valid test cases found to create checklist.");
    }

    const unapprovedCases = validTestCases.filter(
      (tc) => tc.workflowStatus !== "Approved"
    );
    
    if (unapprovedCases.length > 0) {
      throw new Error(
        `Cannot create checklist: ${unapprovedCases.length} test case(s) are not approved. Only approved test cases can be added to checklists.`
      );
    }

    const now = Date.now();

    // Use first executor as primary, rest as additional
    const [primaryExecutor, ...additionalExecutors] = args.testExecutorAssigneeIds;

    // ✅ UPDATED: Create the checklist with environment field
    const checklistId = await ctx.db.insert("checklists", {
      sheetId: args.sheetId,
      sprintName: args.sprintName,
      titleRevisionNumber: args.titleRevisionNumber,
      testCaseType: "functionality",
      accessLevel: "restricted",
      status: "Open",
      progress: 0,
      testExecutorAssigneeId: primaryExecutor,
      additionalAssignees: additionalExecutors.length > 0 ? additionalExecutors : undefined,
      goalDateToFinish: args.goalDateToFinish,
      description: args.description,
      environment: args.environment, // ✅ NEW: Add environment
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      sourceTestCaseCount: validTestCases.length,
      includedWorkflowStatuses: ["Approved"],
    });

    // Create immutable copies as checklistItems
    let sequenceNumber = 1;
    for (const testCase of validTestCases) {
      const createdByUser = await ctx.db.get(testCase.createdBy);
      
      let moduleName = "No Module";
      if (testCase.module) {
        const module = await ctx.db.get(testCase.module);
        moduleName = module?.name || "Unknown Module";
      }

      await ctx.db.insert("checklistItems", {
        checklistId,
        originalTestCaseId: testCase._id,
        testCaseType: "functionality",
        
        title: testCase.title,
        module: moduleName,
        subModule: testCase.subModule,
        level: testCase.level,
        scenario: testCase.scenario,
        preConditions: testCase.preConditions,
        steps: testCase.steps,
        expectedResults: testCase.expectedResults,
        
        originalCreatedBy: createdByUser?.email || "Unknown",
        originalCreatedAt: testCase.createdAt,
        jiraUserStory: testCase.jiraUserStory,
        
        executionStatus: "Not Run",
        sequenceNumber: sequenceNumber++,
        
        createdAt: now,
        updatedAt: now,
      });
    }

    return { 
      checklistId, 
      itemCount: validTestCases.length,
      message: `Successfully created checklist with ${validTestCases.length} test case(s) assigned to ${args.testExecutorAssigneeIds.length} executor(s)` 
    };
  },
});

export const createChecklistFromSheetAltText = mutation({
  args: {
    sheetId: v.id("sheets"),
    selectedTestCaseIds: v.array(v.string()),
    sprintName: v.string(),
    titleRevisionNumber: v.string(),
    testExecutorAssigneeIds: v.array(v.id("users")),
    goalDateToFinish: v.number(),
    description: v.optional(v.string()),
    // ✅ NEW: Environment field (required)
    environment: v.union(
      v.literal("development"),
      v.literal("testing"),
      v.literal("production")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required to create a checklist.");
    }

    const testCases: (Doc<"altTextAriaLabelTestCases"> | null)[] = await Promise.all(
      args.selectedTestCaseIds.map(async (id) => {
        const normalizedId = ctx.db.normalizeId("altTextAriaLabelTestCases", id);
        if (!normalizedId) {
          console.warn(`Invalid test case ID: ${id}`);
          return null;
        }
        return await ctx.db.get(normalizedId);
      })
    );

    const validTestCases = testCases.filter((tc): tc is Doc<"altTextAriaLabelTestCases"> => tc !== null);
    
    if (validTestCases.length === 0) {
      throw new Error("No valid test cases found to create checklist.");
    }

    const unapprovedCases = validTestCases.filter(
      (tc) => tc.workflowStatus !== "Approved"
    );
    
    if (unapprovedCases.length > 0) {
      throw new Error(
        `Cannot create checklist: ${unapprovedCases.length} test case(s) are not approved. Only approved test cases can be added to checklists.`
      );
    }

    const now = Date.now();

    // Use first executor as primary, rest as additional
    const [primaryExecutor, ...additionalExecutors] = args.testExecutorAssigneeIds;

    // ✅ UPDATED: Create the checklist with environment field
    const checklistId = await ctx.db.insert("checklists", {
      sheetId: args.sheetId,
      sprintName: args.sprintName,
      titleRevisionNumber: args.titleRevisionNumber,
      testCaseType: "altTextAriaLabel",
      accessLevel: "restricted",
      status: "Open",
      progress: 0,
      testExecutorAssigneeId: primaryExecutor,
      additionalAssignees: additionalExecutors.length > 0 ? additionalExecutors : undefined,
      goalDateToFinish: args.goalDateToFinish,
      description: args.description,
      environment: args.environment, // ✅ NEW: Add environment
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
      sourceTestCaseCount: validTestCases.length,
      includedWorkflowStatuses: ["Approved"],
    });

    let sequenceNumber = 1;
    for (const testCase of validTestCases) {
      const createdByUser = await ctx.db.get(testCase.createdBy);
      
      let moduleName = "No Module";
      if (testCase.module) {
        const module = await ctx.db.get(testCase.module);
        moduleName = module?.name || "Unknown Module";
      }

      await ctx.db.insert("checklistItems", {
        checklistId,
        originalTestCaseId: testCase._id,
        testCaseType: "altTextAriaLabel",
        
        title: testCase.altTextAriaLabel,
        module: moduleName,
        subModule: testCase.subModule,
        
        level: "High",
        scenario: "Happy Path",
        preConditions: testCase.remarks,
        steps: `Persona: ${testCase.persona}\nPage/Section: ${testCase.pageSection}\nAlt Text/Aria Label: ${testCase.altTextAriaLabel}`,
        expectedResults: `SE Implementation: ${testCase.seImplementation}\n${testCase.wireframeLink ? `Wireframe: ${testCase.wireframeLink}` : ''}`,
        
        originalCreatedBy: createdByUser?.email || "Unknown",
        originalCreatedAt: testCase.createdAt,
        jiraUserStory: testCase.jiraUserStory,
        
        executionStatus: "Not Run",
        sequenceNumber: sequenceNumber++,
        
        createdAt: now,
        updatedAt: now,
      });
    }

    return { 
      checklistId, 
      itemCount: validTestCases.length,
      message: `Successfully created checklist with ${validTestCases.length} alt text/aria label test case(s) assigned to ${args.testExecutorAssigneeIds.length} executor(s)` 
    };
  },
});

export const listChecklists = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    
    // Fetch all checklists
    const checklists = await ctx.db.query("checklists").order("desc").collect();

    // Enhance checklists with related data
    const checklistsWithDetails = await Promise.all(
      checklists.map(async (checklist) => {
        // Get sheet information
        const sheet = await ctx.db.get(checklist.sheetId);
        
        // Get creator information
        const creator = await ctx.db.get(checklist.createdBy);
        
        // Get executor information
        const executor = await ctx.db.get(checklist.testExecutorAssigneeId);
        
        const normalizedUserId = userId
          ? ctx.db.normalizeId("users", userId)
          : null;

        const isOwnedByMe =
          normalizedUserId !== null && normalizedUserId === checklist.createdBy;

        return {
          ...checklist,
          sheetName: sheet?.name || "Unknown Sheet",
          creatorName: creator?.email || "Unknown User",
          executorName: executor?.email || "Unknown Executor",
          isOwnedByMe,
        };
      })
    );

    return checklistsWithDetails;
  },
});

// Get a single checklist by ID with enhanced details
export const getChecklistById = query({
  args: {
    checklistId: v.id("checklists"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      return null;
    }

    // Get sheet information
    const sheet = await ctx.db.get(checklist.sheetId);
    
    // Get creator information
    const creator = await ctx.db.get(checklist.createdBy);
    
    // Get executor information
    const executor = await ctx.db.get(checklist.testExecutorAssigneeId);
    
    const normalizedUserId = userId
      ? ctx.db.normalizeId("users", userId)
      : null;

    const isOwnedByMe =
      normalizedUserId !== null && normalizedUserId === checklist.createdBy;

    return {
      ...checklist,
      sheetName: sheet?.name || "Unknown Sheet",
      creatorName: creator?.email || "Unknown User",
      executorName: executor?.email || "Unknown Executor",
      isOwnedByMe,
    };
  },
});

// Get all checklist items for a specific checklist
export const getChecklistItems = query({
  args: {
    checklistId: v.id("checklists"),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("checklistItems")
      .withIndex("by_checklist", (q) => q.eq("checklistId", args.checklistId))
      .order("asc")
      .collect();

    // Sort by sequence number to maintain order
    return items.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  },
});

// Update checklist item execution status
export const updateChecklistItemStatus = mutation({
  args: {
    itemId: v.id("checklistItems"),
    executionStatus: v.union(
      v.literal("Not Run"),
      v.literal("Passed"),
      v.literal("Failed"),
      v.literal("Blocked"),
      v.literal("Skipped")
    ),
    actualResults: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User must be authenticated");
    }

    const now = Date.now();

    // 1. Update the checklist item's status
    await ctx.db.patch(args.itemId, {
      executionStatus: args.executionStatus,
      actualResults: args.actualResults,
      executedBy: userId,
      executedAt: now,
      updatedAt: now,
    });

    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // ======================================================
    // ✅ START: NEW BUG TRACKING LOGIC
    // ======================================================

    const checklist = await ctx.db.get(item.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found");
    }

    // Find any existing bug for this item
    const existingBug = await ctx.db
      .query("bugs")
      .withIndex("by_checklistItem", (q) => q.eq("checklistItemId", args.itemId))
      .first();

    if (args.executionStatus === "Failed") {
      // 1. A test case FAILED
      const bugActualResults = args.actualResults ?? item.actualResults ?? "No details provided.";

      if (existingBug) {
        // 1a. It failed AGAIN. Reopen the bug.
        await ctx.db.patch(existingBug._id, {
          status: "Reopened",
          actualResults: bugActualResults,
          updatedAt: now,
        });
      } else {
        // 1b. It failed for the first time. Create a NEW bug.
        const newBugId = await ctx.db.insert("bugs", {
          checklistItemId: args.itemId,
          checklistId: item.checklistId,
          sheetId: checklist.sheetId,
          originalTestCaseId: item.originalTestCaseId,
          title: item.title,
          stepsToReproduce: item.steps,
          expectedResults: item.expectedResults,
          actualResults: bugActualResults,
          status: "New",
          reportedBy: userId,
          createdAt: now,
          updatedAt: now,
        });

        // Optional: Link bug ID back to the item's `defectsFound` array
        const currentDefects = item.defectsFound || [];
        currentDefects.push(newBugId.toString());
        await ctx.db.patch(item._id, { defectsFound: currentDefects });
      }

    } else if (args.executionStatus === "Passed") {
      // 2. A test case PASSED
      if (existingBug && existingBug.status !== "Closed") {
        // 2a. It passed validation! Close the bug.
        await ctx.db.patch(existingBug._id, {
          status: "Closed",
          updatedAt: now,
        });
      }
    }
    // ======================================================
    // 🔚 END: NEW BUG TRACKING LOGIC
    // ======================================================

    // 3. Update parent checklist progress (this logic is unchanged)
    const allItems = await ctx.db
      .query("checklistItems")
      .withIndex("by_checklist", (q) => q.eq("checklistId", item.checklistId))
      .collect();
    const completedItems = allItems.filter(
      (i) => i.executionStatus === "Passed" || i.executionStatus === "Failed"
    ).length;
    const progress = Math.round((completedItems / allItems.length) * 100);

    await ctx.db.patch(item.checklistId, {
      progress,
      updatedAt: now,
    });

    return { success: true };
  },
});

/**
 * Fetches the execution status history for a specific checklist item
 * Returns a timeline of all status changes with user and timestamp info
 */
export const getChecklistItemStatusHistory = query({
  args: {
    itemId: v.id("checklistItems"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Authentication required");
    }

    // Get the checklist item
    const item = await ctx.db.get(args.itemId);
    if (!item) {
      throw new Error("Checklist item not found");
    }

    // Get the checklist to verify access
    const checklist = await ctx.db.get(item.checklistId);
    if (!checklist) {
      throw new Error("Parent checklist not found");
    }

    // Build a timeline of status changes
    const timeline: {
      status: string;
      timestamp: number;
      userName: string;
      userEmail: string;
      actualResults?: string;
      isCreation?: boolean;
    }[] = [];

    // Add the creation event
    const creator = await ctx.db.get(checklist.createdBy);
    timeline.push({
      status: "Not Run",
      timestamp: item.createdAt,
      userName: creator?.name || creator?.email || "Unknown",
      userEmail: creator?.email || "N/A",
      isCreation: true,
    });

    // Add execution events if the item has been executed
    if (item.executedAt && item.executedBy) {
      const executor = await ctx.db.get(item.executedBy);
      timeline.push({
        status: item.executionStatus,
        timestamp: item.executedAt,
        userName: executor?.name || executor?.email || "Unknown",
        userEmail: executor?.email || "N/A",
        actualResults: item.actualResults,
      });
    }

    // Sort by timestamp (oldest first)
    timeline.sort((a, b) => a.timestamp - b.timestamp);

    return {
      item: {
        id: item._id,
        title: item.title,
        currentStatus: item.executionStatus,
        module: item.module,
      },
      timeline,
    };
  },
});
// ============================================
// CHECKLIST MEMBER MANAGEMENT MUTATIONS (FIXED)
// ============================================

/**
 * Adds a new member to a checklist by email
 */
export const addChecklistMember = mutation({
  args: {
    checklistId: v.id("checklists"),
    memberEmail: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("qa_lead"),
      v.literal("qa_tester"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. Verify the checklist exists
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 3. Authorization: Check if user is the checklist owner OR a qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", args.checklistId).eq("userId", currentUserId)
      )
      .unique();

    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      throw new Error("Only the checklist owner or QA lead can add members.");
    }

    // 4. Find the user by email
    const targetUser = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.memberEmail.toLowerCase().trim()))
      .unique();

    if (!targetUser) {
      throw new Error(`No user found with email: ${args.memberEmail}`);
    }

    // 5. Check if user is already a member
    const existingMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", args.checklistId).eq("userId", targetUser._id)
      )
      .unique();

    if (existingMember) {
      throw new Error("User is already a member of this checklist.");
    }

    // 6. Prevent adding the checklist owner again
    if (targetUser._id === checklist.createdBy) {
      throw new Error("Cannot add the checklist owner as a member.");
    }

    // 7. Add the member
    const memberId = await ctx.db.insert("checklistMembers", {
      checklistId: args.checklistId,
      userId: targetUser._id,
      role: args.role,
      addedBy: currentUserId,
      addedAt: Date.now(),
    });

    return {
      success: true,
      member: {
        id: memberId,
        email: targetUser.email,
        name: targetUser.name || targetUser.email?.split("@")[0] || "Unknown",
        role: args.role,
        addedAt: Date.now(),
      },
    };
  },
});

/**
 * Removes a member from a checklist
 */
export const removeChecklistMember = mutation({
  args: {
    checklistId: v.id("checklists"),
    memberId: v.string(), // checklistMembers document ID
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. Verify checklist exists
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 3. Authorization: Check if user is the checklist owner OR a qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", args.checklistId).eq("userId", currentUserId)
      )
      .unique();

    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      throw new Error("Only the checklist owner or QA lead can remove members.");
    }

    // 4. Normalize and validate the member record
    const memberRecordId = ctx.db.normalizeId("checklistMembers", args.memberId);
    if (!memberRecordId) {
      throw new Error("Invalid member ID.");
    }

    const memberRecord = await ctx.db.get(memberRecordId);
    if (!memberRecord || memberRecord.checklistId !== args.checklistId) {
      throw new Error("Member not found in this checklist.");
    }

    // Prevent removing the owner
    if (memberRecord.role === "owner") {
      throw new Error("Cannot remove the checklist owner.");
    }

    // 5. Delete the member
    await ctx.db.delete(memberRecordId);

    return { success: true };
  },
});

/**
 * Updates a member's role in a checklist
 */
export const updateChecklistMemberRole = mutation({
  args: {
    checklistId: v.id("checklists"),
    memberId: v.string(),
    newRole: v.union(
      v.literal("owner"),
      v.literal("qa_lead"),
      v.literal("qa_tester"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. Verify checklist exists
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 3. Authorization: Check if user is the checklist owner OR a qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    // Also check if they're a qa_lead member
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", args.checklistId).eq("userId", currentUserId)
      )
      .unique();

    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      throw new Error("Only the checklist owner or QA lead can update member roles.");
    }

    // 4. Normalize and get the member record
    const memberRecordId = ctx.db.normalizeId("checklistMembers", args.memberId);
    if (!memberRecordId) {
      throw new Error("Invalid member ID.");
    }

    const memberRecord = await ctx.db.get(memberRecordId);
    if (!memberRecord || memberRecord.checklistId !== args.checklistId) {
      throw new Error("Member not found in this checklist.");
    }

    // Prevent changing owner role
    if (memberRecord.role === "owner") {
      throw new Error("Cannot modify the checklist owner role.");
    }

    // 5. Update role
    await ctx.db.patch(memberRecordId, { role: args.newRole });

    return { success: true, newRole: args.newRole };
  },
});

/**
 * Gets all members of a checklist
 */
export const getChecklistMembers = query({
  args: {
    checklistId: v.id("checklists"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }

    // 2. Verify checklist exists
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      return [];
    }

    // 3. Get all members
    const memberRecords = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist", (q) => q.eq("checklistId", args.checklistId))
      .collect();

    // 4. Enhance with user details
    const members = await Promise.all(
      memberRecords.map(async (record) => {
        const user = await ctx.db.get(record.userId);
        const addedByUser = await ctx.db.get(record.addedBy);

        return {
          id: record._id,
          userId: record.userId,
          email: user?.email || "N/A",
          name: user?.name || user?.email?.split("@")[0] || "Unknown",
          role: record.role,
          addedAt: record.addedAt,
          addedBy: addedByUser?.email || "Unknown",
        };
      })
    );

    return members;
  },
});


/**
 * Creates a new checklist access request.
 * Guest users can request access to become a viewer, qa_tester, or qa_lead.
 */
export const requestChecklistAccess = mutation({
  args: {
    checklistId: v.string(),
    accessLevel: v.union(
      v.literal("qa_lead"),
      v.literal("qa_tester"),
      v.literal("viewer"),
    ),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to request access.");
    }

    // 2. Normalize the checklist ID
    const normalizedChecklistId = ctx.db.normalizeId("checklists", args.checklistId);
    if (!normalizedChecklistId) {
      throw new Error("Invalid checklist ID.");
    }

    // 3. Verify the checklist exists
    const checklist = await ctx.db.get(normalizedChecklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 4. Check if user is already the owner
    if (checklist.createdBy === userId) {
      throw new Error("You are the owner of this checklist.");
    }

    // 5. Check if user already has a member record (approved access)
    const existingMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", normalizedChecklistId).eq("userId", userId)
      )
      .unique();

    if (existingMember) {
      throw new Error("You already have access to this checklist.");
    }

    // 6. Check if user already has a pending request
    const existingRequest = await ctx.db
      .query("checklistAccessRequests")
      .withIndex("by_checklist_and_requester", (q) =>
        q.eq("checklistId", normalizedChecklistId).eq("requesterId", userId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .unique();

    if (existingRequest) {
      throw new Error("You already have a pending access request for this checklist.");
    }

    // 7. Check if there's a previously declined request
    const declinedRequest = await ctx.db
      .query("checklistAccessRequests")
      .withIndex("by_checklist_and_requester", (q) =>
        q.eq("checklistId", normalizedChecklistId).eq("requesterId", userId)
      )
      .filter((q) => q.eq(q.field("status"), "declined"))
      .order("desc")
      .first();

    if (declinedRequest) {
      // Allow re-requesting if previously declined
      await ctx.db.patch(declinedRequest._id, {
        requestedRole: args.accessLevel,
        status: "pending",
        message: args.message,
        requestedAt: Date.now(),
      });
      
      return { 
        success: true, 
        message: "Your access request has been resubmitted." 
      };
    }

    // 8. Create new access request
    await ctx.db.insert("checklistAccessRequests", {
      checklistId: normalizedChecklistId,
      requesterId: userId,
      requestedRole: args.accessLevel,
      status: "pending",
      message: args.message,
      requestedAt: Date.now(),
    });

    return { 
      success: true, 
      message: "Access request submitted successfully. The checklist owner will be notified." 
    };
  },
});

/**
 * Gets all pending access requests for a checklist.
 * Only the owner and qa_lead members can view these.
 */
export const getPendingChecklistAccessRequests = query({
  args: {
    checklistId: v.id("checklists"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      return [];
    }

    // 2. Verify checklist exists
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      return [];
    }

    // 3. Authorization: Check if user is owner or qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", args.checklistId).eq("userId", currentUserId)
      )
      .unique();

    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      return [];
    }

    // 4. Fetch pending requests
    const pendingRequests = await ctx.db
      .query("checklistAccessRequests")
      .withIndex("by_checklist", (q) => q.eq("checklistId", args.checklistId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    // 5. Enhance with user details
    const requestsWithDetails = await Promise.all(
      pendingRequests.map(async (request) => {
        const user = await ctx.db.get(request.requesterId);

        return {
          id: request._id,
          requesterId: request.requesterId,
          name: user?.name || user?.email?.split("@")[0] || "Unknown User",
          email: user?.email || "N/A",
          avatarUrl: user?.image || null,
          requestedAt: request.requestedAt,
          requestMessage: request.message || "No message provided",
          requestedRole: request.requestedRole,
        };
      })
    );

    // Sort by most recent first
    requestsWithDetails.sort((a, b) => b.requestedAt - a.requestedAt);

    return requestsWithDetails;
  },
});

/**
 * Approves a checklist access request.
 * Adds the user as a member with the requested (or modified) role.
 */
export const approveChecklistAccessRequest = mutation({
  args: {
    requestId: v.id("checklistAccessRequests"),
    finalRole: v.union(
      v.literal("qa_lead"),
      v.literal("qa_tester"),
      v.literal("viewer")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. Get the request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Access request not found.");
    }

    // 3. Verify checklist exists
    const checklist = await ctx.db.get(request.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 4. Authorization: Check if user is owner or qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", request.checklistId).eq("userId", currentUserId)
      )
      .unique();

    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      throw new Error("Only the checklist owner or QA lead can approve access requests.");
    }

    // 5. Update request status
    await ctx.db.patch(args.requestId, {
      status: "approved",
    });

    // 6. Add user as a member (check for existing membership first)
    const existingMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", request.checklistId).eq("userId", request.requesterId)
      )
      .unique();

    if (existingMember) {
      // Update existing role
      await ctx.db.patch(existingMember._id, {
        role: args.finalRole,
      });
    } else {
      // Insert new member
      await ctx.db.insert("checklistMembers", {
        checklistId: request.checklistId,
        userId: request.requesterId,
        role: args.finalRole,
        addedBy: currentUserId,
        addedAt: Date.now(),
      });
    }

    return { 
      success: true, 
      message: "Access request approved successfully." 
    };
  },
});

/**
 * Declines a checklist access request.
 */
export const declineChecklistAccessRequest = mutation({
  args: {
    requestId: v.id("checklistAccessRequests"),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. Get the request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Access request not found.");
    }

    // 3. Verify checklist exists
    const checklist = await ctx.db.get(request.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 4. Authorization: Check if user is owner or qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", request.checklistId).eq("userId", currentUserId)
      )
      .unique();

    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      throw new Error("Only the checklist owner or QA lead can decline access requests.");
    }

    // 5. Update request status
    await ctx.db.patch(args.requestId, {
      status: "declined",
    });

    return { 
      success: true, 
      message: "Access request declined." 
    };
  },
});


/**
 * Updates a checklist's general access level
 */
export const updateChecklistAccessLevel = mutation({
  args: {
    checklistId: v.id("checklists"),
    // ✅ FIXED: Changed from snake_case to camelCase
    accessLevel: v.union(
      v.literal("restricted"),
      v.literal("anyoneWithLink"),  // ✅ Changed from "anyone_with_link"
      v.literal("public")
    ),
  },
  handler: async (ctx, args) => {
    // 1. Authentication check
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Authentication required.");
    }

    // 2. Verify checklist exists
    const checklist = await ctx.db.get(args.checklistId);
    if (!checklist) {
      throw new Error("Checklist not found.");
    }

    // 3. Authorization: Check if user is the checklist owner OR a qa_lead
    const isOwner = checklist.createdBy === currentUserId;
    
    const currentMember = await ctx.db
      .query("checklistMembers")
      .withIndex("by_checklist_and_user", (q) =>
        q.eq("checklistId", args.checklistId).eq("userId", currentUserId)
      )
      .unique();
      
    const isQALead = currentMember?.role === "qa_lead";

    if (!isOwner && !isQALead) {
      throw new Error("Only the checklist owner or QA lead can change access levels.");
    }

    // 4. Update the checklist's access level
    await ctx.db.patch(args.checklistId, {
      accessLevel: args.accessLevel,
    });

    return { success: true };
  },
});