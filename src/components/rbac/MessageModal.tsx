// src/components/MessageModal.tsx

import { useEffect, useRef } from "react";
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNowStrict } from "date-fns";

// [Tooltip Imports]
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// [Convex Imports]
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";
import { Id } from "convex/_generated/dataModel";

// [Types]
export interface UserSummary {
  _id: Id<"users">; // Use Convex ID type
  name: string;
  email: string; // MUST BE PRESENT for the Tooltip to work
  image?: string;
}

interface FetchedUserDetails extends UserSummary {
    email: string; // Ensure email is present
}


interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserSummary | null;
}

interface MessageBubbleProps {
  message: Doc<"supportMessages">; // Use the raw Doc type
  senderName: string;
  senderAvatar: string;
}

const MessageBubble = ({ message, senderName, senderAvatar }: MessageBubbleProps) => {
  // Always align to start, as this is a support ticket log
  const alignClass = "justify-start";
  // Background for the message bubble
  const bubbleClass = message.isResolved
    ? "bg-green-100 text-green-800 rounded-tl-none border border-green-300"
    : "bg-gray-100 text-gray-800 rounded-tl-none";

  const avatar = (
    <Avatar className="h-8 w-8 min-w-[32px]">
      <AvatarImage src={senderAvatar} alt={senderName} />
      <AvatarFallback>{senderName.substring(0, 2).toUpperCase()}</AvatarFallback>
    </Avatar>
  );

  const formattedDate = formatDistanceToNowStrict(message.dateCreated, {
    addSuffix: true,
  });

  return (
    <div className={`flex w-full mb-4 ${alignClass}`}>
      <div className={`flex max-w-[80%] items-start gap-2 flex-row`}>
        {avatar}
        <div className="flex flex-col">
          <div className={`px-4 py-2 shadow-sm ${bubbleClass} rounded-xl`}>
            {/* Display Sender and Subject */}
            <p className="font-semibold text-xs text-muted-foreground mb-1">
              {senderName} - Subject: {message.subject}
            </p>
            {/* Display Message Content */}
            <p className="text-sm break-words whitespace-pre-wrap">
              {message.message}
            </p>
            {/* Display Resolution Status */}
            {message.isResolved && (
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600 font-medium">
                <CheckCircle className="h-3 w-3" />
                Resolved
              </div>
            )}
          </div>
          <p className={`text-xs text-muted-foreground mt-1 text-left`}>
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export function MessageModal({ isOpen, onClose, targetUser }: MessageModalProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the new Convex query to fetch support messages for the target user
  const queryResult = useQuery(
    api.myFunctions.listSupportMessagesByUserId,
    // Only run the query if targetUser is not null
    targetUser ? { targetUserId: targetUser._id } : "skip",
  );

  // Use a TypeScript directive to ignore the type error for the string literal
  // @ts-ignore
  const markMessageAsSeen = useMutation("myFunctions:markMessageAsSeen"); 
  
  const isLoading = queryResult === undefined;
  const displayedMessages = queryResult?.supportMessages || [];
  
  // Get the details of the user who is the subject of the thread (the sender)
  const targetUserDetails = queryResult?.targetUser as (FetchedUserDetails | null);
  
  // Get the array of seen admins from the query result
  const seenByAdmins = (queryResult?.seenByAdmins || []) as FetchedUserDetails[];
  
  // Get the ID of the last message in the list
  const lastMessageId = displayedMessages.length > 0 
    ? displayedMessages[displayedMessages.length - 1]._id 
    : null;

  // Scroll to bottom and mark the message as seen when the modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Scroll to bottom
    if (!isLoading && messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      
      // Attempt to mark the last message as seen by the current admin
      if (lastMessageId) {
        // The mutation function is called with its correct arguments
        markMessageAsSeen({ messageId: lastMessageId })
          .catch(err => console.error("Failed to mark message as seen:", err));
      }
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, displayedMessages.length, lastMessageId, markMessageAsSeen]);

  // Early return if no target user is set
  if (!targetUser) {
    return null;
  }

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:bg-transparent"
                onClick={onClose}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <span>Messages with {targetUser.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div
            // Scrollable chat container
            className="flex-1 overflow-y-auto p-6 space-y-4"
          >
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            ) : (
              displayedMessages.length === 0 ? (
                <div className="flex justify-center items-center h-full text-muted-foreground">
                  No support messages found for this user.
                </div>
              ) : (
                displayedMessages.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    // The sender for a support ticket is always the target user
                    senderName={targetUserDetails?.name || "Support User"}
                    senderAvatar={targetUserDetails?.image || "/placeholder.svg"}
                  />
                ))
              )
            )}
            
            {/* Static "Seen by" Element (All Admins as Seener) */}
            {/* Condition: Messages loaded, there are messages, AND we have at least one seen admin */}
            {!isLoading && displayedMessages.length > 0 && seenByAdmins.length > 0 && (
              <div className="flex justify-end items-center mt-2 pr-2 text-xs text-muted-foreground">
                <span className="mr-1">seen by:</span>
                
                {/* Mapped Avatars for Multiple Seen Admins (Stacked display) */}
                <div className="flex -space-x-2 rtl:space-x-reverse">
                    {seenByAdmins.map((admin, index) => (
                        <Tooltip key={admin._id}>
                            <TooltipTrigger asChild>
                                <Avatar 
                                    className="h-4 w-4 border-2 border-white"
                                    // Use zIndex for proper stacking (latest on top if needed)
                                    style={{ zIndex: seenByAdmins.length - index }} 
                                >
                                    <AvatarImage 
                                        src={admin.image || "/placeholder.svg"} 
                                        alt={admin.name} 
                                    />
                                    <AvatarFallback className="text-[10px] bg-purple-500 text-white">
                                        {/* Use first letter of the admin's name */}
                                        {admin.name.substring(0, 1).toUpperCase()} 
                                    </AvatarFallback>
                                </Avatar>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-sm font-semibold">
                                    {admin.name} (Admin)
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {admin.email} 
                                </p>
                            </TooltipContent>
                        </Tooltip>
                    ))}
                </div>
                {/* ----------------------------------------------- */}

              </div>
            )}

            {/* Ref to scroll to the bottom */}
            <div ref={messagesEndRef} />
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}