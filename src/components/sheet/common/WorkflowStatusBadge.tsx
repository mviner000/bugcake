// src/components/sheet/common/WorkflowStatusBadge.tsx

export type WorkflowStatus = 
  | "Open" 
  | "Waiting for QA Lead Approval" 
  | "Needs revision" 
  | "In Progress" 
  | "Approved" 
  | "Declined" 
  | "Reopen" 
  | "Won't Do";

interface WorkflowStatusBadgeProps {
  status: WorkflowStatus;
  className?: string;
}

const getWorkflowStatusColor = (status: WorkflowStatus): string => {
  const colors: Record<WorkflowStatus, string> = {
    "Open": "bg-blue-100 text-blue-800",
    "Waiting for QA Lead Approval": "bg-yellow-100 text-yellow-800",
    "Needs revision": "bg-orange-100 text-orange-800",
    "In Progress": "bg-purple-100 text-purple-800",
    "Approved": "bg-green-100 text-green-800",
    "Declined": "bg-red-100 text-red-800",
    "Reopen": "bg-cyan-100 text-cyan-800",
    "Won't Do": "bg-gray-100 text-gray-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export function WorkflowStatusBadge({ status, className = "" }: WorkflowStatusBadgeProps) {
  return (
    <div 
      className={`w-full px-3 py-1.5 text-sm rounded text-center font-medium ${getWorkflowStatusColor(status)} ${className}`}
    >
      {status}
    </div>
  );
}