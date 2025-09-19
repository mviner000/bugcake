// src/rbac-page.tsx

import { useState } from "react";
import { Search, Edit, Check, X, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Doc } from "../convex/_generated/dataModel";

export function RBACPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [errorMessage, setErrorMessage] = useState("");

  // Get current user profile to check role
  const currentUser = useQuery(api.myFunctions.getMyProfile);

  // Use the mutation hook
  const updateUserStatus = useMutation(
    api.myFunctions.updateUserVerificationStatus,
  );

  // Check if current user is super_admin
  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleUpdateStatus = (
    user: Doc<"users">,
    newStatus: "approved" | "declined" | "pending",
  ) => {
    // Clear any previous error messages
    setErrorMessage("");

    // Double check on frontend (backend will also validate)
    if (!isSuperAdmin) {
      setErrorMessage(
        "Access denied. Only super administrators can update user verification status.",
      );
      return;
    }

    updateUserStatus({ userId: user._id, newStatus })
      .then(() => {
        console.log(`User ${user._id} status updated to ${newStatus}`);
      })
      .catch((error) => {
        console.error("Failed to update user status:", error);
        setErrorMessage(error.message || "Failed to update user status");
      });
  };

  // Dynamically fetch all users from Convex
  const allUsers = useQuery(api.myFunctions.listAllUsers);

  // Show a loading state if the data is not yet available
  if (allUsers === undefined || currentUser === undefined) {
    return <div>Loading...</div>;
  }

  const filteredUsers = allUsers.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || user.verificationStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    if (status === "approved") {
      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 hover:bg-green-100"
        >
          APPROVED
        </Badge>
      );
    }
    if (status === "declined") {
      return (
        <Badge
          variant="destructive"
          className="bg-red-100 text-red-800 hover:bg-red-100"
        >
          DECLINED
        </Badge>
      );
    }
    return <Badge variant="outline">{status.toUpperCase()}</Badge>;
  };

  const getRoleBadge = (role?: string) => {
    if (role === "super_admin") {
      return (
        <Badge className="bg-purple-100 text-purple-800">SUPER ADMIN</Badge>
      );
    }
    if (role === "admin") {
      return <Badge className="bg-blue-100 text-blue-800">ADMIN</Badge>;
    }
    return <Badge variant="outline">USER</Badge>;
  };

  // Pagination logic
  const totalUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalUsers / pageSize);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-semibold">
                Role Based Access Control
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Enables you to personalize your experience in managing accounts
                in your organization, adjusting preferences, and configuring
                application features seamlessly.
              </CardDescription>
            </div>
            {currentUser && (
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Your Role:
                </span>
                {getRoleBadge(currentUser.role)}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full max-w-[200px]">
              <TabsTrigger value="users" className="text-sm">
                Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              {/* Access Control Warning */}
              {!isSuperAdmin && (
                <Alert className="border-amber-200 bg-amber-50">
                  <Shield className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Limited Access:</strong> Only Super Administrators
                    can approve or decline user verification requests. You can
                    view user information but cannot modify verification status.
                  </AlertDescription>
                </Alert>
              )}

              {/* Error Message */}
              {errorMessage && (
                <Alert variant="destructive">
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Search and Filter Controls */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Status: All</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Name</TableHead>
                      <TableHead className="font-semibold">
                        Email Address
                      </TableHead>
                      <TableHead className="font-semibold">
                        Contact Number
                      </TableHead>
                      <TableHead className="font-semibold">Role</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user._id} className="hover:bg-muted/50">
                        <TableCell className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={user.image || "/placeholder.svg"}
                              alt={user.name}
                            />
                            <AvatarFallback>
                              {user.name
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {user.phone}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {user.verificationStatus &&
                            getStatusBadge(user.verificationStatus)}
                        </TableCell>
                        <TableCell>
                          {user.verificationStatus === "pending" &&
                          isSuperAdmin ? (
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 border border-green-500 hover:bg-green-50"
                                      onClick={() =>
                                        handleUpdateStatus(user, "approved")
                                      }
                                    >
                                      <Check className="h-4 w-4 text-green-500" />
                                      <span className="sr-only">
                                        Approve user
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Approve user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 border border-red-500 hover:bg-red-50"
                                      onClick={() =>
                                        handleUpdateStatus(user, "declined")
                                      }
                                    >
                                      <X className="h-4 w-4 text-red-500" />
                                      <span className="sr-only">
                                        Decline user
                                      </span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Decline user</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          ) : user.verificationStatus === "pending" &&
                            !isSuperAdmin ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 border border-gray-300 opacity-50 cursor-not-allowed"
                                      disabled
                                    >
                                      <Check className="h-4 w-4 text-gray-400" />
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-8 w-8 p-0 border border-gray-300 opacity-50 cursor-not-allowed"
                                      disabled
                                    >
                                      <X className="h-4 w-4 text-gray-400" />
                                    </Button>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Super Admin access required</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={!isSuperAdmin}
                                  >
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit user</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {isSuperAdmin
                                      ? "Edit user"
                                      : "Super Admin access required"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {`Showing ${paginatedUsers.length} of ${totalUsers} users`}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i + 1}
                      variant={currentPage === i + 1 ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
