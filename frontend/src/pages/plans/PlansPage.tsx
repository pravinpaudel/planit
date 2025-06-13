import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, Plus, Trash, Edit } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlans, deletePlan } from '../../features/plans/planSlice';

const PlansPage = () => {
  const dispatch = useAppDispatch();
  const { plans, isLoading, error } = useAppSelector((state) => state.plan);
  const navigate = useNavigate();

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
    dispatch(fetchPlans());
  }, [dispatch]);

  // Navigate to plan details
  const handlePlanClick = (planId: string) => {
    navigate(`/plans/${planId}`);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              {plans.map((plan) => (
                <motion.div key={plan.id} variants={itemVariants}>
                  <Card 
                    className="h-full cursor-pointer hover:border-roadmap-primary/50 hover:shadow-lg transition-all" 
                    hover={true}
                    onClick={() => handlePlanClick(plan.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex justify-between">
                        <span className="truncate">{plan.title}</span>
                      </CardTitle>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {plan.description || 'No description'}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col space-y-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>Created: {formatDate(plan.createdAt)}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>Modified: {formatDate(plan.updatedAt)}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">{plan.milestones.length}</span> 
                          <span className="text-gray-500"> milestones</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-500 hover:text-roadmap-primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/plans/edit/${plan.id}`);
                          }}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-gray-500 hover:text-red-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add delete confirmation
                            if (window.confirm('Are you sure you want to delete this plan?')) {
                              dispatch(deletePlan(plan.id));
                            }
                          }}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default PlansPage;
