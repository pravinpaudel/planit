import { Activity } from '../../services/analyticsService';
import { formatRelativeTime } from '../../utils/dateUtils';
import { CheckCircle, Edit, Plus, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

interface ActivityFeedProps {
  activities: Activity[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'milestone_completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'milestone_started':
        return <Edit className="h-5 w-5 text-blue-500" />;
      case 'milestone_updated':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'task_created':
        return <Plus className="h-5 w-5 text-purple-500" />;
      default:
        return <Target className="h-5 w-5 text-gray-500" />;
    }
  };

  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500 dark:text-gray-400">
          <p>No recent activity</p>
          <p className="text-sm mt-2">Start creating plans and milestones to see activity here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {activity.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatRelativeTime(activity.timestamp)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
