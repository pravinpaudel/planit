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
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center mb-2">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-4 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-5 h-5">
                    <path fillRule="evenodd" d="M2 11.75a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0 6a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zm0-12a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Project Roadmap</h1>
              </div>
              {activePlan && <p className="text-gray-600 ml-14">{activePlan.description || 'Visualize your project milestones and track progress'}</p>}
            </div>
            {activePlan && (
              <Button 
                variant="default" 
                onClick={handleOpenMilestoneModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors rounded-xl shadow-md"
              >
                <Plus size={18} />
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
            <div className="p-8 bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 shadow-xl flex flex-col items-center py-14">
              <div className="bg-blue-100 p-5 rounded-full mb-5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">No milestones yet</h3>
              <p className="text-gray-600 mb-7 text-center max-w-md">
                Create your first milestone to start building your project roadmap and visualize progress.
              </p>
              <Button 
                variant="default" 
                onClick={handleOpenMilestoneModal}
                className="flex items-center gap-2 px-7 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-lg rounded-full"
              >
                <Plus size={20} />
                Create First Milestone
              </Button>
            </div>
          ) : (
            <div className="h-[80vh] w-full border rounded-xl shadow-lg bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
              <D3TreeVisualization 
                milestones={milestones}
                onMilestoneClick={handleMilestoneClick}
                selectedMilestone={selectedMilestone}
                onEditMilestone={handleEditMilestone}
                planTitle={activePlan.title}
              />
              <div className="absolute top-4 right-32 text-xs text-gray-500 bg-white/90 backdrop-blur-sm py-1.5 px-3.5 rounded-full shadow-sm">
                Tip: Use fullscreen button for better viewing experience
              </div>
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
