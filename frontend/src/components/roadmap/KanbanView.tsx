import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Milestone, MilestoneStatus } from '../../types/plan';
import { motion, AnimatePresence } from 'framer-motion';
import { statusConfig } from '../../utils/milestoneUtils';
import { formatDate } from '../../utils/dateUtils';
import { Calendar, CheckCircle, Fullscreen, Minimize, X } from 'lucide-react';
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
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<Milestone | null>(null);

  const getMilestonesByStatus = (status: MilestoneStatus) => {
    return milestones.filter(m => (m.status || 'NOT_STARTED') === status);
  };

  // Fullscreen handling
  const toggleFullScreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!isFullScreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullScreen]);

  // Track fullscreen state
  useEffect(() => {
    const handleChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  const handleMilestoneClick = (milestone: Milestone) => {
    if (isFullScreen) {
      setExpandedMilestone(milestone);
    } else {
      onMilestoneClick(milestone.id);
    }
  };

  const closeExpandedView = () => {
    setExpandedMilestone(null);
  };

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 flex flex-col overflow-hidden relative">
      {/* Fullscreen Button */}
      <button
        onClick={toggleFullScreen}
        className="absolute top-4 right-4 z-10 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700"
        title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
      >
        {isFullScreen ? (
          <Minimize className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <Fullscreen className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 flex-1 min-h-0 overflow-hidden">
        {statusColumns.map(({ status, title }) => {
          const columnMilestones = getMilestonesByStatus(status);
          const config = statusConfig[status];

          return (
            <div key={status} className="flex flex-col h-full min-h-0 overflow-hidden">
              {/* Column Header */}
              <div className={`px-4 py-3 rounded-t-lg border-b-4 flex-shrink-0 ${config.color}`}
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
              <div className="flex-1 min-h-0 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg p-3 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 dark:hover:scrollbar-thumb-gray-500">
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
                      onClick={() => handleMilestoneClick(milestone)}
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

      {/* Expanded Milestone Modal */}
      <AnimatePresence>
        {expandedMilestone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeExpandedView}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-start justify-between z-10">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {expandedMilestone.title}
                  </h2>
                  <Badge className={`${statusConfig[expandedMilestone.status || 'NOT_STARTED'].color} flex items-center gap-2 w-fit`}>
                    {statusConfig[expandedMilestone.status || 'NOT_STARTED'].icon}
                    <span>{statusConfig[expandedMilestone.status || 'NOT_STARTED'].label}</span>
                  </Badge>
                </div>
                <button
                  onClick={closeExpandedView}
                  className="ml-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {expandedMilestone.description || 'No description available'}
                  </p>
                </div>

                {/* Deadline */}
                {expandedMilestone.deadline && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Deadline</h3>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(expandedMilestone.deadline)}</span>
                    </div>
                  </div>
                )}

                {/* Completion Status */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</h3>
                  <div className="flex items-center gap-2">
                    {expandedMilestone.isComplete ? (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 font-medium">Completed</span>
                      </>
                    ) : (
                      <span className="text-gray-600 dark:text-gray-400">In Progress</span>
                    )}
                  </div>
                </div>

                {/* Sub-milestones */}
                {expandedMilestone.children && expandedMilestone.children.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Sub-milestones ({expandedMilestone.children.length})
                    </h3>
                    <div className="space-y-2">
                      {expandedMilestone.children.map((child) => (
                        <div
                          key={child.id}
                          className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900 dark:text-white">{child.title}</span>
                            <Badge size="sm" className={statusConfig[child.status || 'NOT_STARTED'].color}>
                              {statusConfig[child.status || 'NOT_STARTED'].label}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Created/Updated info */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 space-y-1">
                    {expandedMilestone.createdAt && (
                      <div>Created: {formatDate(expandedMilestone.createdAt)}</div>
                    )}
                    {expandedMilestone.updatedAt && (
                      <div>Updated: {formatDate(expandedMilestone.updatedAt)}</div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
