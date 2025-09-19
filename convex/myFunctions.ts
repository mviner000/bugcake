// convex/myFunctions.ts

import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { api } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Doc } from "./_generated/dataModel";

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

    let testCases: (
      | Doc<"functionalityTestCases">
      | Doc<"altTextAriaLabelTestCases">
    )[] = [];

    if (sheet.testCaseType === "functionality") {
      testCases = await ctx.db
        .query("functionalityTestCases")
        .filter((q) => q.eq(q.field("sheetId"), normalizedSheetId))
        .collect();
    } else if (sheet.testCaseType === "altTextAriaLabel") {
      testCases = await ctx.db
        .query("altTextAriaLabelTestCases")
        .filter((q) => q.eq(q.field("sheetId"), normalizedSheetId))
        .collect();
    }

    return {
      sheet,
      testCaseType: sheet.testCaseType,
      testCases, // Return the correctly typed array
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
