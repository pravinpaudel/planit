import React from 'react';
import { motion } from 'framer-motion';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Clock, Calendar, CheckCircle, X, Target, Edit } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/dateUtils';
import { Milestone, MilestoneStatus } from '../../types';

interface MilestoneDetailCardProps {
  milestone: Milestone;
  onClose: () => void;
  onEdit?: (milestoneId: string) => void;
  onToggleComplete?: (milestoneId: string, isComplete: boolean) => void;
}

const statusConfig: Record<MilestoneStatus, { icon: React.ReactNode; color: string; label: string }> = {
  NOT_STARTED: { 
    icon: <Target className="h-5 w-5" />, 
    color: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800', 
    label: 'Not Started' 
  },
  IN_PROGRESS: { 
    icon: <Edit className="h-5 w-5" />, 
    color: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800', 
    label: 'In Progress' 
  },
  COMPLETED: { 
    icon: <CheckCircle className="h-5 w-5" />, 
    color: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800', 
    label: 'Completed' 
  },
  AT_RISK: { 
    icon: <Clock className="h-5 w-5" />, 
    color: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800', 
    label: 'At Risk' 
  },
  DELAYED: { 
    icon: <X className="h-5 w-5" />, 
    color: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800', 
    label: 'Delayed' 
  }
};

const MilestoneDetailCard: React.FC<MilestoneDetailCardProps> = ({ 
  milestone, 
  onClose,
  onEdit,
  onToggleComplete
}) => {
  const status = statusConfig[milestone.status];
  const isCompleted = milestone.status === 'COMPLETED' || milestone.isComplete;
  const daysUntilDeadline = Math.ceil((new Date(milestone.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDeadline < 0 && !isCompleted;
  const creationDate = formatDate(milestone.createdAt);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="milestone-detail-card"
    >
      {/* Top ribbon based on status */}
      <div className={`h-2 w-full ${status.color.split(' ')[0]} rounded-t-lg`}></div>
      
      <CardHeader>
        <div className="flex justify-between items-center">
          <Badge variant="outline" className={`${status.color} status-badge`}>
            <span className="flex items-center gap-1.5">
              {status.icon}
              {status.label}
            </span>
          </Badge>
          
          {isOverdue && (
            <Badge variant="destructive" className="animate-pulse">
              <span className="flex items-center gap-1.5">
                <X className="h-3.5 w-3.5" />
                Overdue by {Math.abs(daysUntilDeadline)} days
              </span>
            </Badge>
          )}
        </div>
        
        <CardTitle className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">{milestone.title}</CardTitle>
        
        {/* {milestone.parentId && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Part of a larger milestone
          </div>
        )} */}
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="prose dark:prose-invert">
          <p className="text-gray-700 dark:text-gray-300">{milestone.description}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Deadline</div>
              <div className="font-medium">
                {formatDate(milestone.deadline)}
                {!isCompleted && daysUntilDeadline > 0 && (
                  <span className="text-sm text-gray-500 ml-2">({daysUntilDeadline} days left)</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Created on</div>
              <div className="font-medium">{creationDate}</div>
            </div>
          </div>
        </div>
        
        {milestone.children && milestone.children.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Target className="h-4 w-4 text-roadmap-primary" />
              Sub-Milestones ({milestone.children.length})
            </h4>
            <div className="space-y-2">
              {milestone.children.map(child => (
                <div 
                  key={child.id}
                  className="p-2 bg-gray-50 dark:bg-gray-800 rounded border-l-2 border-roadmap-primary flex justify-between items-center"
                >
                  <div>
                    <div className="font-medium text-sm">{child.title}</div>
                    <div className="text-xs text-gray-500">{formatDate(child.deadline)}</div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[child.status].color}
                  >
                    {statusConfig[child.status].label}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        
        <div className="space-x-2 flex items-center">
          {onEdit && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => onEdit(milestone.id)}
              className="flex items-center gap-1"
            >
              <Edit size={16} />
              Edit
            </Button>
          )}
          
          {onToggleComplete && (
            <Button 
              variant={isCompleted ? "outline" : "default"}
              size="sm"
              onClick={() => onToggleComplete(milestone.id, !isCompleted)}
              className={`flex items-center gap-1 ${isCompleted ? "border-green-500 text-green-600" : ""}`}
            >
              <CheckCircle size={16} />
              {isCompleted ? "Mark Incomplete" : "Mark Complete"}
            </Button>
          )}
        </div>
      </CardFooter>
    </motion.div>
  );
};

export default MilestoneDetailCard;
