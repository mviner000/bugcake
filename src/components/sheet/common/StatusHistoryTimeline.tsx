// src/components/sheet/common/StatusHistoryTimeline.tsx

import { Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// Dummy static data
const DUMMY_STATUS_HISTORY = [
  {
    id: "1",
    status: "Approved",
    previousStatus: "Waiting for QA Lead Approval",
    timestamp: new Date("2024-01-15T14:30:00"),
    changedBy: "Sarah Johnson",
    changedByRole: "QA Lead",
    comment: "All test cases passed successfully. Ready for deployment.",
  },
  {
    id: "2",
    status: "Waiting for QA Lead Approval",
    previousStatus: "In Progress",
    timestamp: new Date("2024-01-15T10:15:00"),
    changedBy: "Mike Chen",
    changedByRole: "QA Tester",
    comment: "Completed testing. All scenarios covered.",
  },
  {
    id: "3",
    status: "In Progress",
    previousStatus: "Needs revision",
    timestamp: new Date("2024-01-14T16:45:00"),
    changedBy: "Mike Chen",
    changedByRole: "QA Tester",
    comment: "Addressing feedback from previous review.",
  },
  {
    id: "4",
    status: "Needs revision",
    previousStatus: "Waiting for QA Lead Approval",
    timestamp: new Date("2024-01-14T11:20:00"),
    changedBy: "Sarah Johnson",
    changedByRole: "QA Lead",
    comment: "Please add more edge case scenarios and update expected results.",
  },
  {
    id: "5",
    status: "Waiting for QA Lead Approval",
    previousStatus: "In Progress",
    timestamp: new Date("2024-01-13T15:00:00"),
    changedBy: "Mike Chen",
    changedByRole: "QA Tester",
    comment: "Initial test case submission.",
  },
  {
    id: "6",
    status: "In Progress",
    previousStatus: null,
    timestamp: new Date("2024-01-13T09:00:00"),
    changedBy: "Mike Chen",
    changedByRole: "QA Tester",
    comment: "Test case created and assigned.",
  },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "Approved":
      return <CheckCircle2 className="w-4 h-4 text-green-600" />
    case "Declined":
      return <XCircle className="w-4 h-4 text-red-600" />
    case "Needs revision":
      return <AlertCircle className="w-4 h-4 text-amber-600" />
    default:
      return <Clock className="w-4 h-4 text-blue-600" />
  }
}

function getStatusColor(status: string): string {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-800 border-green-200"
    case "Declined":
      return "bg-red-100 text-red-800 border-red-200"
    case "Needs revision":
      return "bg-amber-100 text-amber-800 border-amber-200"
    case "Waiting for QA Lead Approval":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "In Progress":
      return "bg-purple-100 text-purple-800 border-purple-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }
}

export default function StatusHistoryTimeline() {
  return (
    <div className="w-full space-y-3 -mt-3">
      <Accordion type="single" collapsible className="w-full">
        {DUMMY_STATUS_HISTORY.map((item, index) => (
          <AccordionItem key={item.id} value={item.id} className="border-none relative pl-8">
            {index !== DUMMY_STATUS_HISTORY.length - 1 && (
              <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-border" />
            )}

            <div className="absolute left-0 top-3 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center z-10">
              {getStatusIcon(item.status)}
            </div>

            <AccordionTrigger className="hover:no-underline py-3 hover:bg-muted/50 rounded-md px-3 -ml-3">
              <div className="flex items-center justify-between w-full gap-4 pr-2">
                <div className="flex flex-col items-start gap-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">{item.changedBy}</span>
                    <span className="text-xs text-muted-foreground">· {item.changedByRole}</span>
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(item.status)} text-xs`}>
                    {item.status}
                  </Badge>
                </div>
                <time className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                  {formatTimestamp(item.timestamp)}
                </time>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 pt-1 pl-3">
              <div className="space-y-2">
                {item.previousStatus && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Changed from:</span>
                    <Badge
                      variant="outline"
                      className="bg-muted text-muted-foreground border-muted-foreground/20 text-xs"
                    >
                      {item.previousStatus}
                    </Badge>
                  </div>
                )}
                {item.comment && (
                  <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-3 border">{item.comment}</p>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
