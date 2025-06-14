import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, ArrowLeft, CheckCircle, Edit, Trash, Plus, Target, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById, deletePlan } from '../../features/plans/planSlice';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import MilestoneForm from '../../components/forms/MilestoneForm';
import { Milestone } from '../../types';

// Helper function to flatten milestone hierarchy
const getAllMilestones = (milestones: Milestone[] = []): Milestone[] => {
    // Initialize an empty array to hold all milestones
    let allMilestones: Milestone[] = [];
    
    // Function to recursively gather milestones and their children
    const gatherMilestones = (items: Milestone[]) => {
        items.forEach(milestone => {
            // Add the current milestone
            allMilestones.push(milestone);
            
            // If this milestone has children, recursively gather them
            if (milestone.children && milestone.children.length > 0) {
                gatherMilestones(milestone.children);
            }
        });
    };
    
    // Start the recursion with the top-level milestones
    gatherMilestones(milestones);
    
    // Return the flattened array of all milestones
    return allMilestones;
};

const PlanDetailPage = () => {
    const { planId } = useParams<{ planId: string }>();
    const dispatch = useAppDispatch();
    const { activePlan, isLoading, error } = useAppSelector(state => state.plan);
    const navigate = useNavigate();
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    
    const handleOpenMilestoneModal = () => {
        setShowMilestoneModal(true);
    };
    
    const handleCloseMilestoneModal = () => {
        setShowMilestoneModal(false);
    };
    
    const handleMilestoneSuccess = () => {
        // Refresh plan data after milestone creation
        if (planId) {
            dispatch(fetchPlanById(planId));
        }
    };

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
                        <div className="flex justify-between items-start">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-4xl font-semibold bg-clip-text text-gray-900 dark:text-white mb-1">
                                    {activePlan.title}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {activePlan.description || 'No description'}
                                </p>
                            </motion.div>

                            <div className="flex space-x-2">
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => navigate(`/plans/${activePlan.id}/roadmap`)}
                                    className="flex items-center gap-2"
                                >
                                    <Target size={16} />
                                    View Roadmap
                                </Button>
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
                            <div className="absolute top-2 right-2">
                                <Badge variant="outline" className="text-green-600 border-green-200">
                                    10% from last month
                                </Badge>
                            </div>
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                        <Calendar className="w-5 h-5 text-blue-500" />
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mb-0.5">{formatDate(activePlan.createdAt)}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Plan creation date</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="milestone-card animate-fade-in hover:shadow-xl transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                                        <Clock className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                                        Updated
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mb-0.5">{formatDate(activePlan.updatedAt)}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Last modified</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="milestone-card animate-fade-in hover:shadow-xl transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                                        <div className="w-5 h-5 flex items-center justify-center text-purple-500">
                                            <span className="text-md font-semibold">#</span>
                                        </div>
                                    </div>
                                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                                        Total
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mb-0.5">{getAllMilestones(activePlan.milestones).length}</p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Milestones</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="milestone-card animate-fade-in hover:shadow-xl transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                        Completed
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xl font-bold mb-0.5">
                                        {getAllMilestones(activePlan.milestones).filter(m => m.isComplete).length} / {getAllMilestones(activePlan.milestones).length}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
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
                                onClick={handleOpenMilestoneModal}
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
                                        onClick={handleOpenMilestoneModal}
                                        className="flex items-center gap-2 mx-auto"
                                    >
                                        <Plus size={16} />
                                        Create First Milestone
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {/* Flatten the milestone structure to include both top-level and children */}
                                {getAllMilestones(activePlan.milestones).map((milestone) => (
                                    <Card key={milestone.id} className={`transition-all ${milestone.isComplete ? 'bg-green-50 dark:bg-green-900/20' : ''}`}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className={`font-medium ${milestone.isComplete ? 'text-green-700 dark:text-green-400' : ''}`}>
                                                        {milestone.parentId && <span className="mr-2 text-xs text-gray-500">↳</span>}
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
                
                {/* Milestone Modal */}
                <Modal 
                    isOpen={showMilestoneModal} 
                    onClose={handleCloseMilestoneModal}
                    title="Add New Milestone"
                >
                    {planId && activePlan && (
                        <MilestoneForm 
                            taskId={planId}
                            onClose={handleCloseMilestoneModal}
                            onSuccess={handleMilestoneSuccess}
                            parentOptions={getAllMilestones(activePlan.milestones).map(milestone => ({
                                id: milestone.id,
                                title: milestone.parentId ? `↳ ${milestone.title}` : milestone.title
                            }))}
                        />
                    )}
                </Modal>
            </MainLayout>
        </>
    );
};

export default PlanDetailPage;
