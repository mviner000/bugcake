// src/components/auth/VerificationStatusPage.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactSupportModal } from "./ContactSupportModal";

type VerificationStatusPageProps = {
  status: "pending" | "approved" | "declined" | undefined;
  userEmail?: string;
  onSignOut?: () => void; // Add onSignOut to props
};

/**
 * Content configuration for each verification status.
 * This makes it easy to manage text, images, and actions for each state.
 */
const getStatusConfig = (email: string) => ({
  pending: {
    image: "/pending-bee.png",
    alt: "Bee with a magnifying glass, reviewing an application",
    title: "Just a moment...",
    subtitle: "Your application is under review.",
    descriptionPrefix: "Your email: ",
    email: email,
    descriptionSuffix: " is pending approval. We're buzzing with excitement to check it out. You'll receive an email once we're done.",
    showContactSupportButton: false, // Be explicit for clarity
  },
  declined: {
    image: "/declined-bee.png",
    alt: "Sad bee with a declined paper",
    title: "Oh, honey...",
    subtitle: "Your application was declined.",
    descriptionPrefix: "Your email: ",
    email: email,
    descriptionSuffix: " is declined! If you believe this is a mistake, please don't hesitate to get in touch with our support team.",
    showContactSupportButton: true, // Be explicit for clarity
  },
});

export function VerificationStatusPage({ status, userEmail, onSignOut }: VerificationStatusPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Display a simple loading message while the status is being fetched
  if (!status) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600 animate-pulse">Loading status...</p>
      </div>
    );
  }

  // If somehow an approved user reaches this page, show a simple message
  if (status === "approved") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-2xl text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  const email = userEmail || "your email";
  const statusConfig = getStatusConfig(email);
  const content = statusConfig[status];

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-12 max-w-4xl mx-auto">
          {/* Bee illustration section */}
          <div className="relative">
            <img src={content.image} alt={content.alt} className="w-80 h-auto" />
          </div>

          {/* Text and button section */}
          <div className="flex flex-col items-start">
            {/* Main message */}
            <div className="mb-8">
              <h1 className="text-4xl font-normal text-gray-800 mb-2 italic">{content.title}</h1>
              <p className="text-4xl font-normal text-gray-800 italic">{content.subtitle}</p>
              <p className="text-lg text-gray-600 mt-4 max-w-md">
                {content.descriptionPrefix}
                <span className="text-red-600 underline font-semibold">{content.email}</span>
                {content.descriptionSuffix}
              </p>
            </div>

            {/* Action Buttons Section - Vertically Stacked */}
            <div className="flex flex-col gap-4">
              {/* Conditional Contact Support Button */}
              {content.showContactSupportButton && (
                <Button
                  size="xl"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-full transition-colors duration-200 text-2xl"
                >
                  Contact Support
                </Button>
              )}

              {/* Sign Out Button (always shown for pending/declined) */}
              <Button
                size="xl"
                variant="outline"
                onClick={onSignOut}
                className="font-semibold rounded-full text-2xl border-2"
              >
                Use a Different Account
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userEmail={userEmail}
      />
    </>
  );
}