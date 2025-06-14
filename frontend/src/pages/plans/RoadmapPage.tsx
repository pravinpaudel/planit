import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { useEffect, useState } from 'react';
import { Milestone } from '../../types/plan';
import D3TreeVisualization from '../../components/plans/D3TreeVisualization';
import transformToFrontendState from '../../utils/transformToFrontendState';
import { getAllMilestones } from './PlanDetailPage';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById } from '../../features/plans/planSlice';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import MilestoneForm from '../../components/forms/MilestoneForm';

const RoadmapPage = () => {
  const navigate = useNavigate();
  const { planId } = useParams<{ planId: string }>();
  const dispatch = useAppDispatch();
  const { activePlan, isLoading, error } = useAppSelector(state => state.plan);
  const [milestones, setMilestones] = useState<Record<string, Milestone>>({});
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  
  // Fetch plan data when component mounts
  useEffect(() => {
    if (!planId) return;
    
    // Fetch the latest plan data from the server
    dispatch(fetchPlanById(planId));
  }, [dispatch, planId]);

  // Process milestone data when activePlan changes
  useEffect(() => {
    if (activePlan && activePlan.milestones) {
      // Get all milestones including nested ones
      const flattenMilestones = getAllMilestones(activePlan.milestones);
      // Transform data to the format expected by the D3 visualization
      const transformedData = transformToFrontendState(flattenMilestones);
      setMilestones(transformedData);
    }
  }, [activePlan]);

  // Handle milestone click
  const handleMilestoneClick = (id: string) => {
    setSelectedMilestone(id);
    console.log('Selected milestone:', id);
  };

  // Handle edit milestone click
  const handleEditMilestone = (id: string) => {
    console.log('Edit milestone:', id);
    
    // For now, we'll navigate to the plan detail page with the milestone to edit
    // In a more advanced implementation, you could show a modal dialog here
    if (planId) {
      navigate(`/plans/${planId}?edit=${id}`);
    }
  };
  
  // Handle opening the milestone modal
  const handleOpenMilestoneModal = () => {
    setShowMilestoneModal(true);
  };
  
  // Handle closing the milestone modal
  const handleCloseMilestoneModal = () => {
    setShowMilestoneModal(false);
  };
  
  // Handle successful milestone creation
  const handleMilestoneSuccess = () => {
    // Refresh the plan data to include the new milestone
    if (planId) {
      dispatch(fetchPlanById(planId));
    }
  };
  
  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold">Plan Roadmap</h1>
            {activePlan && (
              <Button 
                variant="default" 
                onClick={handleOpenMilestoneModal}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add Milestone
              </Button>
            )}
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-96">
              <p className="text-gray-500">Loading roadmap...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          ) : !activePlan ? (
            <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
              Plan not found.
            </div>
          ) : Object.keys(milestones).length === 0 ? (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md flex flex-col items-center py-8">
              <p className="text-blue-700 mb-4">
                No milestones found for this plan. Create some milestones to visualize your roadmap.
              </p>
              <Button 
                variant="outline" 
                onClick={handleOpenMilestoneModal}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Create First Milestone
              </Button>
            </div>
          ) : (
            <div className="h-[80vh] w-full border rounded-md shadow-sm bg-white relative overflow-hidden">
              <D3TreeVisualization 
                milestones={milestones}
                onMilestoneClick={handleMilestoneClick}
                selectedMilestone={selectedMilestone}
                onEditMilestone={handleEditMilestone}
              />
            </div>
          )}
          
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
        </div>
      </MainLayout>
    </>
  );
};

export default RoadmapPage;
