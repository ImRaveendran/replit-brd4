import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, History, CloudUpload, FileCheck } from "lucide-react";
import { useFileUpload } from "@/hooks/use-file-upload";

interface UploadSectionProps {
  onUploadSuccess: (generationId: number) => void;
}

export function UploadSection({ onUploadSuccess }: UploadSectionProps) {
  const { uploadFile, isUploading, uploadedFile, resetUpload } = useFileUpload();

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const result = await uploadFile(file);
      if (result) {
        onUploadSuccess(result.generationId);
      }
    }
  }, [uploadFile, onUploadSuccess]);

  const handleDropZoneClick = () => {
    const input = document.getElementById('fileInput') as HTMLInputElement;
    input?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const result = await uploadFile(file);
      if (result) {
        onUploadSuccess(result.generationId);
      }
    }
  };

  const handleNewUpload = () => {
    resetUpload();
    const input = document.getElementById('fileInput') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-8">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Upload Business Requirements Document
          </h2>
          <p className="text-gray-600 mb-8">
            Upload your BRD in PDF, Word, or text format to generate Epics and User Stories
          </p>
          
          <div
            className={`border-2 border-dashed rounded-xl p-12 transition-colors cursor-pointer ${
              uploadedFile
                ? "border-green-300 bg-green-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50"
            }`}
            onClick={!isUploading ? handleDropZoneClick : undefined}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center">
              {uploadedFile ? (
                <>
                  <div className="bg-green-100 rounded-full p-4 mb-4">
                    <FileCheck className="text-green-600 h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {uploadedFile.name}
                  </p>
                  <p className="text-gray-500 mb-4">File ready for processing</p>
                </>
              ) : (
                <>
                  <div className="bg-blue-100 rounded-full p-4 mb-4">
                    <CloudUpload className="text-blue-600 h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your BRD file here
                  </p>
                  <p className="text-gray-500 mb-4">or click to browse</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      PDF
                    </span>
                    <span className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      DOC/DOCX
                    </span>
                    <span className="flex items-center">
                      <FileText className="mr-1 h-4 w-4" />
                      TXT
                    </span>
                  </div>
                </>
              )}
            </div>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {uploadedFile && !isUploading && (
              <Button onClick={handleNewUpload} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Document
              </Button>
            )}
            
            <Button variant="outline" className="bg-gray-100 hover:bg-gray-200">
              <History className="mr-2 h-4 w-4" />
              View Previous Generations
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
