import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Edit, Layers, List } from "lucide-react";
import { UserStoryCard } from "./user-story-card";
import type { Epic } from "@/lib/types";

interface EpicCardProps {
  epic: Epic;
  onEdit?: () => void;
  initialExpanded?: boolean;
}

export function EpicCard({ epic, onEdit, initialExpanded = false }: EpicCardProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  return (
    <Card className="border border-gray-200 shadow-sm overflow-hidden">
      <CardContent className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Layers className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{epic.epic_name}</h3>
                <Badge className="bg-blue-100 text-blue-800">Epic</Badge>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed">{epic.epic_description}</p>
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
          </div>
        </div>
      </CardContent>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleContent>
          {isExpanded ? (
            <div className="p-6 space-y-4">
              {epic.user_stories.map((story, index) => (
                <UserStoryCard key={index} story={story} />
              ))}
            </div>
          ) : (
            <div className="p-6 bg-gray-50">
              <p className="text-sm text-gray-600 text-center py-4 flex items-center justify-center">
                <List className="h-4 w-4 text-gray-400 mr-2" />
                {epic.user_stories.length} User Stories - Click to expand and view details
              </p>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
