import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { UploadSection } from "@/components/upload-section";
import { ProcessingStatus } from "@/components/processing-status";
import { ResultsSection } from "@/components/results-section";
import { useToast } from "@/hooks/use-toast";
import type { Generation, Epic } from "@/lib/types";

export default function Home() {
  const [currentGenerationId, setCurrentGenerationId] = useState<number | null>(null);
  const { toast } = useToast();

  const { data: generation, isLoading, error } = useQuery({
    queryKey: ["/api/generations", currentGenerationId],
    queryFn: () => fetch(`/api/generations/${currentGenerationId}`).then(res => res.json()),
    enabled: !!currentGenerationId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 2000;
    },
    refetchIntervalInBackground: false,
  });

  useEffect(() => {
    if (generation?.status === "completed") {
      toast({
        title: "Processing completed",
        description: "Your Epics and User Stories have been generated successfully!",
      });
    } else if (generation?.status === "failed") {
      toast({
        title: "Processing failed",
        description: "There was an error processing your document. Please try again.",
        variant: "destructive",
      });
    }
  }, [generation?.status, toast]);

  const handleUploadSuccess = (generationId: number) => {
    setCurrentGenerationId(generationId);
  };

  const handleExport = () => {
    if (!generation?.epics) return;

    const dataStr = JSON.stringify(generation.epics, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `epics-and-stories-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export successful",
      description: "Your Epics and User Stories have been downloaded as JSON.",
    });
  };

  const showProcessingStatus = currentGenerationId && (
    generation?.status === "processing" || isLoading
  );

  const showResults = generation?.status === "completed" && generation.epics;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 rounded-lg p-2">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">BRD Generator</h1>
                <p className="text-sm text-gray-500">Business Requirements to Epics & User Stories</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 transition-colors">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Upload Section */}
          <UploadSection onUploadSuccess={handleUploadSuccess} />

          {/* Processing Status */}
          {showProcessingStatus && (
            <ProcessingStatus
              isVisible={true}
              status={generation?.status || "processing"}
            />
          )}

          {/* Results Section */}
          {showResults && (
            <ResultsSection
              epics={generation.epics as Epic[]}
              generatedTime={generation.completedAt ? 
                new Date(generation.completedAt).toLocaleString() : 
                "Just now"
              }
              onExport={handleExport}
            />
          )}

          {/* Failed Generation */}
          {generation?.status === "failed" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-red-100 rounded-full p-2">
                  <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-900">Processing Failed</h3>
              </div>
              <p className="text-red-700 mb-4">
                {generation.epics?.error?.includes("API key") 
                  ? "Groq API key is required to process documents. Please provide your API key to continue."
                  : generation.epics?.error || "An error occurred while processing your document."
                }
              </p>
              <button 
                onClick={() => setCurrentGenerationId(null)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-8">
              <p className="text-red-600">
                Error loading generation: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
