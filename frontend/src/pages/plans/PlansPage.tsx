import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Plus, Trash, Edit, ChevronRight, CheckCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlans, deletePlan, updatePlan } from '../../features/plans/planThunks';
import { selectAllPlans, selectPlanLoading, selectPlanError } from '../../features/plans/planSelectors';
import { formatDate } from '../../utils/dateUtils';
import { Plan, Milestone } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { DropdownMenu, DropdownItem } from '../../components/ui/DropdownMenu';
import PlanForm from '../../components/forms/PlanForm';
import { getAllMilestones } from '../../utils/milestoneUtils';

const PlansPage = () => {
  const dispatch = useAppDispatch();
  const plans = useAppSelector(selectAllPlans);
  const isLoading = useAppSelector(selectPlanLoading);
  const error = useAppSelector(selectPlanError);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  // Fetch plans when component mounts
  useEffect(() => {
    // Avoid refetching if plans are already loaded
    if( plans.length > 0) return; 
    dispatch(fetchPlans());
  }, [dispatch]);

  // Navigate to plan details
  const handlePlanClick = (planId: string) => {
    navigate(`/plans/${planId}`);
  };
  
  // Handle opening edit modal
  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };
  
  // Handle deleting a plan
  const handleDeletePlan = (planId: string) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      dispatch(deletePlan(planId));
    }
  };
  
  // Close modal and reset editing state
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingPlan(null), 300); // Reset after animation completes
  };
  
  // Calculate plan progress
  const calculatePlanProgress = (plan: Plan): { completed: number; total: number; percentage: number } => {
    const allMilestones = getAllMilestones(plan.milestones);
    const total = allMilestones.length;
    
    if (total === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = allMilestones.filter(milestone => 
      milestone.isComplete || milestone.status === 'COMPLETED'
    ).length;
    
    return {
      completed,
      total,
      percentage: Math.round((completed / total) * 100)
    };
  };

  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-6">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              className="text-2xl font-semibold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Your Plans
            </motion.h1>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="default"
                size="md"
                onClick={() => navigate('/plans/create')}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create New Plan
              </Button>
            </motion.div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-pulse text-roadmap-primary">Loading plans...</div>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : plans.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                You don't have any plans yet. Create your first plan to get started!
              </div>
              <Button 
                variant="default" 
                onClick={() => navigate('/plans/create')} 
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create New Plan
              </Button>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {plans.map((plan) => {
                // Calculate plan progress once per plan render
                const progress = calculatePlanProgress(plan);
                
                return (
                  <motion.div key={plan.id} variants={itemVariants}>
                    <Card 
                      className="h-full cursor-pointer hover:border-roadmap-primary/50 hover:shadow-lg transition-all overflow-hidden" 
                      hover={true}
                      variant="glass"
                      onClick={() => handlePlanClick(plan.id)}
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-roadmap-primary to-roadmap-secondary opacity-70"></div>
                      <div className="absolute top-0 right-0 mt-2 mr-2 z-10">
                        <DropdownMenu align="right">
                          <DropdownItem 
                            icon={<Edit size={16} />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPlan(plan);
                            }}
                          >
                            Edit
                          </DropdownItem>
                          <DropdownItem 
                            icon={<Trash size={16} />}
                            destructive
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan.id);
                            }}
                          >
                            Delete
                          </DropdownItem>
                        </DropdownMenu>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="group flex items-center justify-between">
                          <div className="flex-1 truncate">{plan.title}</div>
                      
                        </CardTitle>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {plan.description || 'No description'}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="h-4 w-4 mr-2 text-roadmap-primary" />
                              <span>{formatDate(plan.createdAt)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <Clock className="h-4 w-4 mr-2 text-roadmap-secondary" />
                              <span>Last updated: {formatDate(plan.updatedAt)}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-center justify-center p-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            {plan.milestones.length > 0 ? (
                              <>
                                <span className="text-xl font-bold text-roadmap-primary">{progress.percentage}%</span>
                                <span className="text-xs text-gray-500">complete</span>
                              </>
                            ) : (
                              <>
                                <span className="text-xl font-bold text-roadmap-primary">0</span>
                                <span className="text-xs text-gray-500">milestones</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Progress Details */}
                        {plan.milestones.length > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-1">
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Milestone Status</div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                              <div 
                                className="bg-gradient-to-r from-roadmap-primary to-roadmap-secondary h-2 rounded-full transition-all duration-500" 
                                style={{ width: `${progress.percentage}%` }}
                                aria-label={`${progress.percentage}% complete`}
                                role="progressbar"
                                aria-valuenow={progress.percentage}
                                aria-valuemin={0}
                                aria-valuemax={100}
                              ></div>
                            </div>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-green-500 mr-1.5"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300">{progress.completed} Complete</span>
                                </div>
                                <div className="flex items-center">
                                  <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600 mr-1.5"></div>
                                  <span className="text-xs text-gray-600 dark:text-gray-300">
                                    {progress.total - progress.completed} Pending
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">{plan.milestones.length}</span> total
                              </div>
                            </div>
                          </div>
                        )}
                      {plan.milestones.length === 0 && (
                        <div className="mt-4 text-sm text-gray-500">
                          No milestones yet. Start by adding your first milestone to track progress.
                        </div>
                      )}

                      <div className="mt-4 flex items-center text-xs font-medium text-roadmap-primary hover:underline">
                        <span>View plan details</span>
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
              })}
            </motion.div>
          )}
        </div>

        {/* Edit Plan Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingPlan ? "Edit Plan" : "Create Plan"}
          size="md"
        >
          {editingPlan && (
            <PlanForm
              onClose={handleCloseModal}
              existingPlan={editingPlan}
            />
          )}
        </Modal>
      </MainLayout>
    </>
  );
};

export default PlansPage;
