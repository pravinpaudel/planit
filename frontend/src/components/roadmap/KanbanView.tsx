import React from 'react';
import { Milestone, MilestoneStatus } from '../../types/plan';
import { motion } from 'framer-motion';
import { statusConfig } from '../../utils/milestoneUtils';
import { formatDate } from '../../utils/dateUtils';
import { Calendar, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface KanbanViewProps {
  milestones: Milestone[];
  onMilestoneClick: (id: string) => void;
  selectedMilestone: string | null;
}

const statusColumns: { status: MilestoneStatus; title: string }[] = [
  { status: 'NOT_STARTED', title: 'Not Started' },
  { status: 'IN_PROGRESS', title: 'In Progress' },
  { status: 'COMPLETED', title: 'Completed' },
  { status: 'AT_RISK', title: 'At Risk' },
  { status: 'DELAYED', title: 'Delayed' }
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  milestones,
  onMilestoneClick,
  selectedMilestone
}) => {
  const getMilestonesByStatus = (status: MilestoneStatus) => {
    return milestones.filter(m => (m.status || 'NOT_STARTED') === status);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 overflow-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 min-h-[600px]">
        {statusColumns.map(({ status, title }) => {
          const columnMilestones = getMilestonesByStatus(status);
          const config = statusConfig[status];

          return (
            <div key={status} className="flex flex-col">
              {/* Column Header */}
              <div className={`px-4 py-3 rounded-t-lg border-b-4 ${config.color}`}
                style={{ borderBottomColor: config.ribbonColor }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-sm">{config.icon}</span>
                    {title}
                  </h3>
                  <span className="text-sm font-medium px-2 py-0.5 bg-white dark:bg-gray-800 rounded-full">
                    {columnMilestones.length}
                  </span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-3 space-y-3 min-h-[400px]">
                {columnMilestones.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                    No milestones
                  </div>
                ) : (
                  columnMilestones.map((milestone, index) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => onMilestoneClick(milestone.id)}
                      className={`p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm border cursor-pointer transition-all hover:shadow-md ${
                        milestone.id === selectedMilestone
                          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {/* Card Title */}
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2">
                        {milestone.title}
                      </h4>

                      {/* Card Description */}
                      {milestone.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {milestone.description}
                        </p>
                      )}

                      {/* Card Footer */}
                      <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        {milestone.deadline ? (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(milestone.deadline)}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">No deadline</span>
                        )}

                        {/* Progress indicator for IN_PROGRESS */}
                        {milestone.status === 'IN_PROGRESS' && (
                          <div className="flex items-center gap-1">
                            <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full"
                                style={{ width: '50%' }}
                              />
                            </div>
                            <span className="text-gray-500 text-xs">50%</span>
                          </div>
                        )}

                        {/* Checkmark for completed */}
                        {milestone.status === 'COMPLETED' && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>

                      {/* Sub-milestones count */}
                      {milestone.children && milestone.children.length > 0 && (
                        <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                          <span>📋</span>
                          <span>{milestone.children.length} sub-milestone{milestone.children.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
