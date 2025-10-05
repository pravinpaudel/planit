import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import { Clock, Calendar, CheckCircle, X, Target, Edit } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatDate } from '../../utils/dateUtils';
import { statusConfig, getStatusBorderColor } from '../../utils/milestoneUtils';
import { Milestone, MilestoneDetailCardProps } from '../../types/plan';

const MilestoneDetailCard: React.FC<MilestoneDetailCardProps> = ({ 
  milestone, 
  onClose,
  onEdit,
  onToggleComplete
}) => {
  // Memoize calculated values to avoid redundant calculations on re-renders
  const { 
    status, 
    isCompleted,
    daysUntilDeadline, 
    isOverdue, 
    creationDate 
  } = useMemo(() => {
    const status = statusConfig[milestone.status];
    const isCompleted = milestone.status === 'COMPLETED' || milestone.isComplete;
    const daysUntilDeadline = milestone.deadline ? Math.ceil((new Date(milestone.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
    const isOverdue = daysUntilDeadline < 0 && !isCompleted;
    const creationDate = formatDate(milestone.createdAt);
    
    return {
      status,
      isCompleted,
      daysUntilDeadline,
      isOverdue,
      creationDate
    };
  }, [milestone.status, milestone.isComplete, milestone.deadline, milestone.createdAt]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.3 }}
      className="milestone-detail-card"
    >
      {/* Top ribbon based on status */}
      <div className={`h-2 w-full ${status.ribbonColor} rounded-t-lg`}
        style={{ backgroundColor: status.ribbonColor }}>
      </div>

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
              {milestone.deadline && (
                <div className="text-xs text-gray-500 dark:text-gray-400">Deadline</div>
              )}
              <div className="font-medium">
                {milestone.deadline && formatDate(milestone.deadline)}
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
              {milestone.children.map(child => {
                // Get border color class using the utility function
                const borderColorClass = getStatusBorderColor(child.status);
                
                return (
                  <div 
                    key={child.id}
                    className={`p-2 bg-gray-50 dark:bg-gray-800 rounded border-l-2 ${borderColorClass} flex justify-between items-center hover:bg-opacity-80 transition-colors`}
                  >
                    <div>
                      <div className="font-medium text-sm">{child.title}</div>
                      <div className="text-xs text-gray-500">{child.deadline && formatDate(child.deadline)}</div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={statusConfig[child.status].color}
                    >
                      {statusConfig[child.status].label}
                    </Badge>
                  </div>
                );
              })}
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
