// convex/myFunctions.ts

import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";
import { Id } from "./_generated/dataModel";

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

export const getTestCasesForSheet = query({
  args: {
    sheetId: v.string(),
  },
  handler: async (ctx, args) => {
    const normalizedSheetId = ctx.db.normalizeId("sheets", args.sheetId);

    if (!normalizedSheetId) {
      return null;
    }

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

      // Enrich with user information AND sequence number
      testCases = await Promise.all(
        rawTestCases.map(async (testCase, index) => {
          const createdByUser = await ctx.db.get(testCase.createdBy);
          const executedByUser = testCase.executedBy
            ? await ctx.db.get(testCase.executedBy)
            : null;

          return {
            ...testCase,
            createdByName: createdByUser?.email || "Unknown User",
            executedByName: executedByUser?.email || "N/A",
            sequenceNumber: index + 1, // Simple incremental number based on array position
          };
        })
      );
    } else if (sheet.testCaseType === "altTextAriaLabel") {
      const rawTestCases = await ctx.db
        .query("altTextAriaLabelTestCases")
        .filter((q) => q.eq(q.field("sheetId"), normalizedSheetId))
        .collect();

      // Enrich with user information AND sequence number
      testCases = await Promise.all(
        rawTestCases.map(async (testCase, index) => {
          const createdByUser = await ctx.db.get(testCase.createdBy);
          const executedByUser = testCase.executedBy
            ? await ctx.db.get(testCase.executedBy)
            : null;

          return {
            ...testCase,
            createdByName: createdByUser?.email || "Unknown User",
            executedByName: executedByUser?.email || "N/A",
            sequenceNumber: index + 1, // Simple incremental number based on array position
          };
        })
      );
    }

    return {
      sheet,
      testCaseType: sheet.testCaseType,
      testCases,
    };
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
    // Optional fields you might add later
    isPublic: v.optional(v.boolean()),
    requestable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // 1. Authenticate and identify the user
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Unauthorized: You must be logged in to create a sheet.");
    }

    // We must normalize the ID to ensure it's a valid Doc<"users"> ID
    const normalizedUserId = ctx.db.normalizeId("users", userId);
    if (!normalizedUserId) {
      throw new Error("Invalid user session.");
    }

    const now = Date.now();

    // 2. Insert the new document into the 'sheets' table
    const sheetId = await ctx.db.insert("sheets", {
      name: args.name,
      type: args.type,
      owner: normalizedUserId, // Automatically set the owner to the logged-in user
      last_opened_at: now,
      created_at: now,
      updated_at: now,
      shared: args.shared,
      testCaseType: args.testCaseType,
      // Use defaults for optional fields if not provided
      isPublic: args.isPublic ?? false,
      requestable: args.requestable ?? false,
    });

    // 3. Return the ID of the new sheet for the frontend to navigate
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