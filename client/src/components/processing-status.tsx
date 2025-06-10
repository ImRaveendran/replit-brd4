import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock, Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  isVisible: boolean;
  status: string;
}

export function ProcessingStatus({ isVisible, status }: ProcessingStatusProps) {
  if (!isVisible) return null;

  const getProgressValue = () => {
    switch (status) {
      case "processing":
        return 45;
      case "completed":
        return 100;
      case "failed":
        return 100;
      default:
        return 0;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-orange-600";
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Processing Document</h3>
          <div className={`flex items-center space-x-2 ${getStatusColor()}`}>
            {status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
            {status === "completed" && <CheckCircle className="h-4 w-4" />}
            {status === "failed" && <Clock className="h-4 w-4" />}
            <span className="text-sm font-medium capitalize">{status}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Parsing BRD Document</span>
            <CheckCircle className="h-3 w-3 text-green-600" />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Generating Epics</span>
            {status === "processing" ? (
              <Loader2 className="h-3 w-3 animate-spin text-orange-600" />
            ) : (
              <CheckCircle className="h-3 w-3 text-green-600" />
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={status === "completed" ? "text-gray-600" : "text-gray-400"}>
              Creating User Stories
            </span>
            {status === "completed" ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Clock className="h-3 w-3 text-gray-400" />
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className={status === "completed" ? "text-gray-600" : "text-gray-400"}>
              Finalizing Output
            </span>
            {status === "completed" ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Clock className="h-3 w-3 text-gray-400" />
            )}
          </div>
        </div>
        
        <div className="mt-4">
          <Progress value={getProgressValue()} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            {status === "processing" && "Estimated time remaining: 2-3 minutes"}
            {status === "completed" && "Processing completed successfully"}
            {status === "failed" && "Processing failed. Please try again."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
