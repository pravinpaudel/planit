import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Calendar, Clock, ArrowLeft, CheckCircle, Edit, Trash, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById, deletePlan } from '../../features/plans/planSlice';
import { Badge } from '../../components/ui/Badge';

const PlanDetailPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const dispatch = useAppDispatch();
  const { activePlan, isLoading, error } = useAppSelector(state => state.plan);
  const navigate = useNavigate();

  useEffect(() => {
    if (planId) {
      dispatch(fetchPlanById(planId));
    }
  }, [dispatch, planId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      if (planId) {
        dispatch(deletePlan(planId)).then(() => {
          navigate('/plans');
        });
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <Navigation />
        <MainLayout>
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-roadmap-primary">Loading plan details...</div>
          </div>
        </MainLayout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <MainLayout>
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            {error}
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/plans')}
            className="mt-4 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Plans
          </Button>
        </MainLayout>
      </>
    );
  }

  if (!activePlan) {
    return (
      <>
        <Navigation />
        <MainLayout>
          <div className="bg-amber-100 text-amber-700 p-4 rounded-md">
            Plan not found.
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/plans')}
            className="mt-4 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Plans
          </Button>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-6">
          <div className="mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/plans')}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft size={16} />
              Back to Plans
            </Button>
            
            <div className="flex justify-between items-start">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-1">
                  {activePlan.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {activePlan.description || 'No description'}
                </p>
              </motion.div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/plans/edit/${activePlan.id}`)}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  className="flex items-center gap-2"
                >
                  <Trash size={16} />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6"
          >
            <Card className="milestone-card animate-fade-in hover:shadow-xl transition-all duration-300">
              <CardContent className="p-6 flex items-center">
                <Calendar className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Created</div>
                  <div className="font-medium">{formatDate(activePlan.createdAt)}</div>
                </div>
                <Badge variant="outline" className={`${'up' === 'up' ? 'text-green-600 border-green-200' : 'text-gray-500 border-gray-200'}`}>
                      100
                    </Badge>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <Clock className="h-5 w-5 text-amber-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Last Updated</div>
                  <div className="font-medium">{formatDate(activePlan.updatedAt)}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <div className="h-5 w-5 flex items-center justify-center text-purple-500 mr-3">
                  <span className="text-lg font-semibold">#</span>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Milestones</div>
                  <div className="font-medium">{activePlan.milestones.length}</div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="font-medium">
                    {activePlan.milestones.filter(m => m.isComplete).length} / {activePlan.milestones.length}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Milestones
              </h2>
              <Button 
                variant="default"
                size="sm"
                onClick={() => navigate(`/milestones/create/${activePlan.id}`)}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Milestone
              </Button>
            </div>

            {activePlan.milestones.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    This plan doesn't have any milestones yet. Add a milestone to get started!
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/milestones/create/${activePlan.id}`)}
                    className="flex items-center gap-2 mx-auto"
                  >
                    <Plus size={16} />
                    Create First Milestone
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activePlan.milestones.map((milestone) => (
                  <Card key={milestone.id} className={`transition-all ${milestone.isComplete ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-medium ${milestone.isComplete ? 'text-green-700 dark:text-green-400' : ''}`}>
                            {milestone.title}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {milestone.description}
                          </p>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Due: {formatDate(milestone.deadline)}
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant={milestone.isComplete ? 'success' : 'outline'}
                            size="xs"
                            className="flex items-center gap-2"
                            onClick={() => {
                              // Handle milestone completion status toggle
                              // This will be implemented in the future
                            }}
                          >
                            <CheckCircle size={14} />
                            {milestone.isComplete ? 'Completed' : 'Complete'}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="xs"
                            className="text-gray-500 hover:text-roadmap-primary"
                            onClick={() => navigate(`/milestones/edit/${milestone.id}`)}
                          >
                            <Edit size={14} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </MainLayout>
    </>
  );
};

export default PlanDetailPage;
