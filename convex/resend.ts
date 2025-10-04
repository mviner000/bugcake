// convex/resend.ts
"use node";

import { internalAction } from "./_generated/server";
import { v } from "convex/values";

export const sendResetPasswordEmail = internalAction({
  args: {
    to: v.string(),
    resetLink: v.string(), 
  },
  handler: async (_ctx, args) => {
    try {
      const apiKey = process.env.RESEND_API_KEY;
      
      if (!apiKey) {
        throw new Error("RESEND_API_KEY environment variable not set.");
      }

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // For testing: only works with oscar.nogoy08@gmail.com
          // For production: change to "Your App <noreply@yourdomain.com>" after verifying domain
          from: "Your App <onboarding@resend.dev>",
          to: args.to,
          subject: "Password Reset Request",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>You requested a password reset. Click the button below to reset your password:</p>
              <a href="${args.resetLink}" 
                 style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Reset Password
              </a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="color: #666; word-break: break-all;">${args.resetLink}</p>
              <p style="color: #666; font-size: 14px; margin-top: 24px;">
                This link will expire in 1 hour.
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 24px;">
                If you didn't request this password reset, you can safely ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText };
        }
        
        console.error("Resend API Error:", errorText);
        
        // Handle specific error cases
        if (errorData.statusCode === 403 && errorText.includes("testing emails")) {
          throw new Error("Email service is in test mode. Please contact support.");
        }
        
        throw new Error(`Failed to send email: ${errorData.message || errorText}`);
      }

      const data = await response.json();
      console.log("Email sent successfully:", data);
      
      return { success: true, emailId: data.id };

    } catch (e) {
      console.error("Internal error sending email:", e);
      throw new Error("Failed to send password reset email.");
    }
  },
});
