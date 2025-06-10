import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, Circle, Edit, User } from "lucide-react";
import type { UserStory } from "@/lib/types";

interface UserStoryCardProps {
  story: UserStory;
  onEdit?: () => void;
}

export function UserStoryCard({ story, onEdit }: UserStoryCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ready":
        return "bg-green-100 text-green-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "done":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLabelColor = (label: string) => {
    const colors = [
      "bg-purple-100 text-purple-800",
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-orange-100 text-orange-800",
    ];
    return colors[label.length % colors.length];
  };

  return (
    <Card className="bg-gray-50 border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 rounded p-1.5">
            <User className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{story.story_name}</h4>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={getStatusColor(story.status)}>{story.status}</Badge>
              <Badge className={getLabelColor(story.label)}>{story.label}</Badge>
            </div>
          </div>
        </div>
        {onEdit && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-sm text-gray-600 mb-4">{story.description}</p>

      <div className="space-y-3 text-sm">
        <div>
          <h5 className="font-medium text-gray-700 mb-2">Acceptance Criteria</h5>
          <ul className="space-y-1">
            {story.acceptance_criteria.map((criteria, index) => (
              <li key={index} className="flex items-start text-gray-600">
                <CheckCircle className="h-3 w-3 text-green-600 mt-1 mr-2 flex-shrink-0" />
                {criteria}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Definition of Ready</h5>
            <ul className="space-y-1">
              {story.definition_of_ready.map((item, index) => (
                <li key={index} className="flex items-center text-gray-600 text-xs">
                  <Circle className="h-2 w-2 text-green-600 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-2">Definition of Done</h5>
            <ul className="space-y-1">
              {story.definition_of_done.map((item, index) => (
                <li key={index} className="flex items-center text-gray-600 text-xs">
                  <Circle className="h-2 w-2 text-gray-400 mr-2 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {story.nfrs && story.nfrs.length > 0 && (
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Non-Functional Requirements</h5>
            <ul className="space-y-1">
              {story.nfrs.map((nfr, index) => (
                <li key={index} className="flex items-start text-gray-600 text-xs">
                  <Circle className="h-2 w-2 text-blue-600 mt-1 mr-2 flex-shrink-0" />
                  {nfr}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
