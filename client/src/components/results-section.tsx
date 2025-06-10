import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  Edit, 
  Layers, 
  List, 
  Clock, 
  CheckCircle, 
  BarChart3 
} from "lucide-react";
import { EpicCard } from "./epic-card";
import type { Epic } from "@/lib/types";

interface ResultsSectionProps {
  epics: Epic[];
  generatedTime?: string;
  onExport?: () => void;
  onEditAll?: () => void;
}

export function ResultsSection({ 
  epics, 
  generatedTime = "2 minutes ago", 
  onExport, 
  onEditAll 
}: ResultsSectionProps) {
  const totalUserStories = epics.reduce((sum, epic) => sum + epic.user_stories.length, 0);
  const avgStoriesPerEpic = epics.length > 0 ? (totalUserStories / epics.length).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Generated Results</h2>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span className="flex items-center">
                  <Layers className="mr-1 h-4 w-4 text-blue-600" />
                  {epics.length} Epics
                </span>
                <span className="flex items-center">
                  <List className="mr-1 h-4 w-4 text-green-600" />
                  {totalUserStories} User Stories
                </span>
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4 text-gray-400" />
                  Generated {generatedTime}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              {onEditAll && (
                <Button variant="outline" onClick={onEditAll}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit All
                </Button>
              )}
              {onExport && (
                <Button onClick={onExport} className="bg-green-600 hover:bg-green-700 text-white">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Epic Cards */}
      {epics.map((epic, index) => (
        <EpicCard 
          key={index} 
          epic={epic} 
          initialExpanded={index === 0} // Expand first epic by default
        />
      ))}

      {/* Summary Stats */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Generation Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <Layers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{epics.length}</div>
              <div className="text-sm text-gray-600">Total Epics</div>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <List className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{totalUserStories}</div>
              <div className="text-sm text-gray-600">User Stories</div>
            </div>
            <div className="text-center">
              <div className="bg-yellow-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{avgStoriesPerEpic}</div>
              <div className="text-sm text-gray-600">Avg Stories/Epic</div>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">100%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
