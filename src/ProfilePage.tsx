import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

export function ProfilePage() {
  return (
    <div className="container mx-auto p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">Profile</CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32">
                <AvatarImage src="/professional-headshot.png" alt="John Doe" />
                <AvatarFallback className="text-2xl">JD</AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Full Name
                </p>
                <p className="text-sm">John Doe</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Mobile Number
                </p>
                <p className="text-sm">+1 (000) 000-0000</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Email Address
                </p>
                <p className="text-sm">superadmin@sample.com</p>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Password
                </p>
                <p className="text-sm font-mono">••••••••••</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Role</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Badge variant="secondary" className="text-sm font-medium">
                Super Admin
              </Badge>
            </div>

            <div className="space-y-3">
              {[
                "View all innovations (List & Card View)",
                "Add new innovations",
                "Edit all innovations",
                "Delete all innovations",
                "Share all innovations",
                "Add progress updates",
                "Change innovation status",
                "Archive / Unarchive innovations",
                "Add Line of Business (LoB)",
              ].map((permission, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                  <span className="text-sm text-foreground">{permission}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
