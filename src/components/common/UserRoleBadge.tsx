// src/components/common/UserRoleBadge.tsx

/**
 * Defines the possible roles that can be displayed by the badge.
 * 'guest' and null roles are intentionally hidden by the component.
 */
export type UserRole = "owner" | "qa_lead" | "qa_tester" | "viewer" | "guest";

interface UserRoleBadgeProps {
  /** The current user's role for the resource. Can be null while loading. */
  role: UserRole | null;
}

/**
 * Map of role IDs to their display label and Tailwind CSS style.
 */
const roleMap: Record<UserRole, { label: string; style: string }> = {
  owner: {
    label: "Owner",
    style: "bg-red-600 text-white", // Owner gets a distinct color
  },
  qa_lead: {
    label: "QA Lead",
    style: "bg-purple-600 text-white", // QA Lead color
  },
  qa_tester: {
    label: "QA Tester",
    style: "bg-indigo-600 text-white", // QA Tester color
  },
  viewer: {
    label: "Viewer",
    style: "bg-gray-600 text-white", // Viewer color
  },
  guest: {
    label: "Guest",
    style: "bg-yellow-500 text-gray-800", // Guest role is usually hidden, but defined for completeness
  },
};

/**
 * A generic, presentational component to display a user's role in a styled badge.
 * The styling is centralized here.
 * @param role - The determined role (e.g., 'owner', 'qa_lead').
 * @returns A styled badge component or null.
 */
export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  // 1. Hide the badge if the role is null (loading) or 'guest' (not a member/owner)
  if (!role || role === "guest") {
    return null;
  }

  const roleInfo = roleMap[role];

  // 2. Ensure roleInfo exists (should always be true with correct typing)
  if (!roleInfo) {
    return null;
  }

  // 3. Render the badge with the role-specific style and label
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.style}`}
    >
      {roleInfo.label}
    </span>
  );
}