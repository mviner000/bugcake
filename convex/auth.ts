// auth.ts

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      // Check if this is a new user creation (no existing user)
      const existingUser = args.existingUserId
        ? await ctx.db.get(args.existingUserId)
        : null;

      if (existingUser) {
        // User already exists, just update with any new profile info
        return existingUser._id;
      }

      // This is a new user, create with default verificationStatus
      const userId = await ctx.db.insert("users", {
        name: args.profile?.name,
        email: args.profile?.email,
        image: args.profile?.image,
        emailVerificationTime: args.profile?.emailVerificationTime,
        phone: args.profile?.phone,
        phoneVerificationTime: args.profile?.phoneVerificationTime,
        isAnonymous: args.profile?.isAnonymous,
        verificationStatus: "pending", // Set default here
        role: "user", // You might want to set a default role too
      });

      return userId;
    },
  },
});
