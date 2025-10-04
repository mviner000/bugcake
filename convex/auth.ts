// convex/auth.ts
// NOTE: This file should NOT have "use node" at the top

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

const tokenLength = 64; 
const FRONTEND_BASE_URL = "http://localhost:5173"; 

function generateToken(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      const existingUser = args.existingUserId
        ? await ctx.db.get(args.existingUserId)
        : null;

      if (existingUser) {
        return existingUser._id;
      }

      const userId = await ctx.db.insert("users", {
        name: args.profile?.name,
        email: args.profile?.email,
        image: args.profile?.image,
        emailVerificationTime: args.profile?.emailVerificationTime,
        phone: args.profile?.phone,
        phoneVerificationTime: args.profile?.phoneVerificationTime,
        isAnonymous: args.profile?.isAnonymous,
        verificationStatus: "pending",
        role: "user",
      });

      return userId;
    },
  },
});

export const forgotPassword = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    // 🔒 SECURITY: Always return success even if user not found
    if (!user) {
      return { success: true }; 
    }

    // Generate token and expiry
    const token = generateToken(tokenLength);
    const expiry = Date.now() + 3600000; // 1 hour

    // Update user with reset token
    await ctx.db.patch(user._id, {
      resetPasswordToken: token,
      resetPasswordExpiry: expiry,
    });

    // Construct reset link
    const resetLink = `${FRONTEND_BASE_URL}/reset-password?token=${token}&email=${args.email}`;

    // Schedule email action (runs immediately with 0 delay)
    await ctx.scheduler.runAfter(0, internal.resend.sendResetPasswordEmail, {
      to: args.email,
      resetLink: resetLink,
    });

    return { success: true };
  },
});