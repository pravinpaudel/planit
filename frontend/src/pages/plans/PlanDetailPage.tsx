import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, ArrowLeft, CheckCircle, Edit, Trash, Plus, Target, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById, deletePlan, updateMilestone } from '../../features/plans/planSlice';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import MilestoneForm from '../../components/forms/MilestoneForm';
import MilestoneDetailCard from '../../components/plans/MilestoneDetailCard';
import { Milestone } from '../../types';
import { formatDate } from '../../utils/dateUtils';

// Helper function to flatten milestone hierarchy
export const getAllMilestones = (milestones: Milestone[] = []): Milestone[] => {
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

// Function to get upcoming milestones along with the not completed ones
const getUpcomingMilestones = (milestones: Milestone[]): Milestone[] => {
    return milestones.filter(milestone => milestone.status !== "COMPLETED")
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
};  

const PlanDetailPage = () => {
    const { planId } = useParams<{ planId: string }>();
    const dispatch = useAppDispatch();
    const { activePlan, isLoading, error } = useAppSelector(state => state.plan);
    const navigate = useNavigate();
    const [showMilestoneModal, setShowMilestoneModal] = useState(false);
    const [showMilestoneDetailsModal, setShowMilestoneDetailsModal] = useState(false);
    const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
    const [viewingMilestone, setViewingMilestone] = useState<Milestone | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Handle creating a new milestone
    const handleOpenMilestoneModal = () => {
        setIsEditing(false);
        setSelectedMilestone(null);
        setViewingMilestone(null);
        setShowMilestoneModal(true);
    };
    
    // Handle closing the milestone create/edit modal
    const handleCloseMilestoneModal = () => {
        setShowMilestoneModal(false);
        setIsEditing(false);
        if (!isEditing) {
            setSelectedMilestone(null);
            setViewingMilestone(null);
        }
    };
    
    // Handle milestone creation/edit success
    const handleMilestoneSuccess = () => {
        // Refresh plan data after milestone creation
        if (planId) {
            dispatch(fetchPlanById(planId));
        }
        setShowMilestoneModal(false);
        setShowMilestoneDetailsModal(false);
        setSelectedMilestone(null);
        setViewingMilestone(null);
        setIsEditing(false);
    };

    // Handle clicking on a milestone to view details in modal
    const handleMilestoneClick = (milestoneId: string) => {
        setSelectedMilestone(milestoneId);
        
        // Find the milestone details from the active plan - use getAllMilestones to find in hierarchy
        const allMilestones = getAllMilestones(activePlan?.milestones);
        const milestoneDetails = allMilestones.find(m => m.id === milestoneId);
        
        if (milestoneDetails) {
            setViewingMilestone(milestoneDetails);
            setShowMilestoneDetailsModal(true);
        }
    };
    
    // Handle editing a milestone
    const handleEditMilestone = (milestoneId: string) => {
        setSelectedMilestone(milestoneId);
        setIsEditing(true);
        setShowMilestoneDetailsModal(false);
        setShowMilestoneModal(true);
    };
    
    // Handle toggling milestone complete status
    const handleToggleComplete = (milestoneId: string, isComplete: boolean) => {
        if (!activePlan) return;
        
        // Find the milestone in the hierarchy
        const allMilestones = getAllMilestones(activePlan.milestones);
        const milestone = allMilestones.find(m => m.id === milestoneId);
        
        if (milestone) {
            // Update the milestone status
            const newStatus = isComplete ? 'COMPLETED' : milestone.status;
            dispatch(updateMilestone({
                milestoneId,
                milestoneData: {
                    status: newStatus,
                    isComplete
                }
            })).then(() => {
                // Refresh plan data
                if (planId) {
                    dispatch(fetchPlanById(planId));
                }
            });
        }
    };
    
    // Handle closing milestone details modal
    const handleCloseMilestoneDetailsModal = () => {
        setShowMilestoneDetailsModal(false);
        setSelectedMilestone(null);
        setViewingMilestone(null);
    };

    useEffect(() => {
        if (planId) {
            dispatch(fetchPlanById(planId));
        }
    }, [dispatch, planId]);

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

                    {/* Quick Stats Section */}
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

                    {/* Upcoming Milestones Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                <Calendar className="inline-block mr-2" />
                                Upcoming Milestones
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
                                {getUpcomingMilestones(getAllMilestones(activePlan.milestones)).slice(0, 5).map((milestone) => (
                                    <div key={milestone.id}>
                                        <Card 
                                            className={`transition-all ${milestone.isComplete ? 'bg-green-50 dark:bg-green-900/20' : ''} hover:shadow-md hover:border-roadmap-primary/50`}
                                            hover={true}
                                            clickable
                                            variant="elevated"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleMilestoneClick(milestone.id);
                                            }}
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className={`font-medium flex items-center gap-1 ${milestone.isComplete ? 'text-green-700 dark:text-green-400' : ''}`}>
                                                            {milestone.parentId && <span className="mr-1 text-xs text-gray-500">↳</span>}
                                                            {milestone.title}
                                                            <span className="ml-1 text-xs text-blue-500 font-normal">(View details)</span>
                                                        </h3>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                            {milestone.description.length > 60 
                                                                ? `${milestone.description.substring(0, 60)}...` 
                                                                : milestone.description}
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
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleToggleComplete(milestone.id, !milestone.isComplete);
                                                            }}
                                                        >
                                                            <CheckCircle size={14} />
                                                            {milestone.isComplete ? 'Completed' : 'Complete'}
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="xs"
                                                            className="text-gray-500 hover:text-roadmap-primary"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditMilestone(milestone.id);
                                                            }}
                                                        >
                                                            <Edit size={14} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
                
                {/* Milestone Modal - For Adding or Editing */}
                <Modal 
                    isOpen={showMilestoneModal} 
                    onClose={handleCloseMilestoneModal}
                    title={isEditing ? "Edit Milestone" : "Add New Milestone"}
                >
                    {planId && activePlan && (
                        <MilestoneForm 
                            taskId={planId}
                            onClose={handleCloseMilestoneModal}
                            onSuccess={handleMilestoneSuccess}
                            existingMilestone={isEditing && selectedMilestone ? 
                                getAllMilestones(activePlan.milestones).find(m => m.id === selectedMilestone) : 
                                undefined
                            }
                            parentOptions={getAllMilestones(activePlan.milestones)
                                .filter(milestone => {
                                    // Don't include self as parent option when editing
                                    if (isEditing && selectedMilestone && milestone.id === selectedMilestone) {
                                        return false;
                                    }
                                    // Don't include children of the milestone being edited as parent options
                                    if (isEditing && selectedMilestone && milestone.parentId === selectedMilestone) {
                                        return false;
                                    }
                                    return true;
                                })
                                .map(milestone => ({
                                    id: milestone.id,
                                    title: milestone.parentId ? `↳ ${milestone.title}` : milestone.title
                                }))
                            }
                        />
                    )}
                </Modal>
                
                {/* Milestone Details Modal */}
                <Modal 
                    isOpen={showMilestoneDetailsModal} 
                    onClose={handleCloseMilestoneDetailsModal}
                    title={viewingMilestone?.title || "Milestone Details"}
                    size="lg"
                    className="md:min-w-[900px]"
                >
                    {viewingMilestone && (
                        <div className="py-2">
                            <MilestoneDetailCard
                                milestone={viewingMilestone}
                                onClose={handleCloseMilestoneDetailsModal}
                                onEdit={handleEditMilestone}
                                onToggleComplete={handleToggleComplete}
                            />
                        </div>
                    )}
                </Modal>
            </MainLayout>
        </>
    );
};

export default PlanDetailPage;
