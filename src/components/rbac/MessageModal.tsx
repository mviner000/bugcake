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

// [New Imports for Convex]
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";

// [Types]
export interface UserSummary {
  _id: Doc<"users">["_id"]; // Use Convex ID type
  name: string;
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

  const isLoading = queryResult === undefined;
  const displayedMessages = queryResult?.supportMessages || [];
  const userDetails = queryResult?.targetUser;
  
  // Scroll to bottom when modal opens or messages change
  useEffect(() => {
    if (!isOpen) return;
    // Scroll only if messages have loaded
    if (!isLoading && messagesEndRef.current) {
      // Use a timeout to ensure the dialog has fully rendered
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isLoading, displayedMessages.length]); // Re-scroll on new messages

  // Early return if no target user is set
  if (!targetUser) {
    return null;
  }

  return (
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
                    senderName={userDetails?.name || "Support User"}
                    senderAvatar={userDetails?.image || "/placeholder.svg"}
                />
              ))
            )
          )}
          {/* Ref to scroll to the bottom */}
          <div ref={messagesEndRef} />
        </div>
      </DialogContent>
    </Dialog>
  );
}