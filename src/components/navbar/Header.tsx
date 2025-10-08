// components/header.tsx or wherever your Header component is located

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";

import { Skeleton } from "@/components/ui/skeleton";
import { api } from "../../../convex/_generated/api";
import { UserProfileDropdown } from "./user-profile-dropdown";
import { Button } from "../ui/button";
import { ListChecks } from "lucide-react";

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
          className="flex items-center gap-1 text-xl font-semibold text-foreground hover:text-primary"
        >
          <img
            src="/bugcake-favicon.ico"
            alt="bugcake logo"
            className="w-6 h-6"
          />
          BugCake
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="relative"
          >
            <ListChecks className="w-4 h-4 mr-2" />
            Notifications
            <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-red-500 rounded-full">
              1
            </span>
          </Button>
          
          {isAuthenticated && userProfile && (
            <UserProfileDropdown
              user={{
                name: userProfile.name || "User",
                email: userProfile.email || "N/A",
                phone: userProfile.phone || "N/A",
                role: userProfile.role || "N/A",
                avatar: userProfile.image || undefined,
              }}
              onEditProfile={handleEditProfile}
              onManageRBAC={handleManageRBAC}
              onSignOut={handleSignOut}
            />
          )}
        </div>
      </div>
    </header>
  );
}