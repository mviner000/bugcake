import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface TeamMember {
  name: string
  avatar: string
  fallback: string
}

interface AssignedToProps {
  members?: TeamMember[]
}

export function AssignedTo({ members }: AssignedToProps) {
  const defaultMembers: TeamMember[] = [
    {
      name: "Team Member 1",
      avatar: "/professional-avatar-1.png",
      fallback: "TM",
    },
    {
      name: "Team Member 2",
      avatar: "/professional-avatar-2.png",
      fallback: "JD",
    },
    {
      name: "Team Member 3",
      avatar: "/professional-avatar-3.png",
      fallback: "SK",
    },
    {
      name: "Team Member 4",
      avatar: "/professional-avatar-4.png",
      fallback: "AL",
    },
    {
      name: "Team Member 5",
      avatar: "/professional-avatar-5.png",
      fallback: "MR",
    },
  ]

  const teamMembers = members || defaultMembers

  return (
    <span className="sticky left-28 top-3/4 -translate-y-[65%] z-10">
      <span className="text-sm text-muted-foreground">assigned to</span>
      <span className="flex items-center -space-x-2">
        {teamMembers.map((member, index) => (
          <Avatar key={index} className="h-8 w-8 border-2 border-background">
            <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
            <AvatarFallback>{member.fallback}</AvatarFallback>
          </Avatar>
        ))}
      </span>
    </span>
  )
}
