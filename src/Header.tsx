// components/header.tsx or wherever your Header component is located

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";

import { UserProfileDropdown } from "@/components/user-profile-dropdown";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component
import { api } from "../convex/_generated/api";

export function Header() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const navigate = useNavigate();

  // Dynamically fetch the user's profile data
  const userProfile = useQuery(api.myFunctions.getMyProfile);

  const handleEditProfile = () => {
    console.log("Edit Profile clicked");
    void navigate("/profile");
  };

  const handleManageRBAC = () => {
    console.log("Manage RBAC clicked");
    void navigate("/rbac");
  };

  const handleSignOut = () => {
    console.log("Sign Out clicked");
    void signOut();
  };

  // If the authentication state is still loading, or if the user data is being fetched,
  // we can show a skeleton or loading state.
  if (isLoading || (isAuthenticated && userProfile === undefined)) {
    return (
      <header className="sticky top-0 z-10 bg-background border-b border-border">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to="/"
            className="text-xl font-semibold text-foreground hover:text-primary"
          >
            BugCake
          </Link>
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 bg-background border-b border-border">
      <div className="flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          className="text-xl font-semibold text-foreground hover:text-primary"
        >
          BugCake
        </Link>
        {isAuthenticated && userProfile && (
          <UserProfileDropdown
            user={{
              name: userProfile.name || "User",
              email: userProfile.email || "N/A",
              phone: userProfile.phone || "N/A",
              role: userProfile.role || "N/A", // Using verificationStatus as a stand-in for role
              avatar: userProfile.image || undefined,
            }}
            onEditProfile={handleEditProfile}
            onManageRBAC={handleManageRBAC}
            onSignOut={handleSignOut}
          />
        )}
      </div>
    </header>
  );
}
