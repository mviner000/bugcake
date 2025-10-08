// src/components/dashboard/multi-step-form-page.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MultiStepForm } from "./dashboard/multi-step-form";

export function MultiStepFormPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Template</CardTitle>
          <CardDescription>
            Build your testing template step by step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MultiStepForm />
        </CardContent>
      </Card>
    </div>
  );
}