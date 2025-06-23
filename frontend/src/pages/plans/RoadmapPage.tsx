import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { useEffect, useState, useMemo } from 'react';
import { Milestone } from '../../types/plan';
import D3TreeVisualization from '../../components/plans/D3TreeVisualization';
import transformToFrontendState from '../../utils/transformToFrontendState';
import { getAllMilestones } from '../../utils/milestoneUtils';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById, getSharedRoadmap, cloneRoadmap } from '../../features/plans/planThunks';
import { selectActivePlan, selectPlanLoading, selectPlanError } from '../../features/plans/planSelectors';
import { Button } from '../../components/ui/Button';
import { Plus, Copy } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import MilestoneForm from '../../components/forms/MilestoneForm';
import { useAuth } from '../../hooks/useAuth';
import { addNotification } from '../../features/ui/uiSlice';

// Helper function to preserve milestone order by creation date
const sortMilestonesByCreationDate = (milestones: Milestone[]): Milestone[] => {
  return [...milestones].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateA - dateB;
  });
};

const RoadmapPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const { sharedId } = useParams<{ sharedId: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const dispatch = useAppDispatch();
  const activePlan = useAppSelector(selectActivePlan);
  const isLoading = useAppSelector(selectPlanLoading);
  const error = useAppSelector(selectPlanError);
  const [milestones, setMilestones] = useState<Record<string, Milestone>>({});
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState<boolean>(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [isCloning, setIsCloning] = useState<boolean>(false);
  const [showCloneConfirmModal, setShowCloneConfirmModal] = useState<boolean>(false);
  
  // Fetch plan data when component mounts
  useEffect(() => {
    if (!planId && !sharedId) return;
    
    // For regular plans: check if the plan is already loaded
    if (planId && activePlan && activePlan.id === planId) {
      return;
    }
    
    // For shared plans: check if a shared plan is already loaded 
    if (sharedId && activePlan && activePlan.shareableLink?.includes(sharedId)) {
      return;
    }
    
    // Fetch data based on available ID
    if (sharedId) {
      dispatch(getSharedRoadmap(sharedId));
    } else if (planId) {
      dispatch(fetchPlanById(planId));
    }
    
  }, [dispatch, planId, sharedId, activePlan?.id, activePlan?.shareableLink]);

  // Process milestone data when activePlan changes - using useMemo for caching
  const processedMilestones = useMemo(() => {
    if (!activePlan?.milestones) return {};
    
    // Get all milestones including nested ones
    const flattenMilestones = getAllMilestones(activePlan.milestones);
    
    // Sort milestones by creation date before transforming to preserve order
    const sortedMilestones = sortMilestonesByCreationDate(flattenMilestones);
    
    // Transform data to the format expected by the D3 visualization
    // Our enhanced transformToFrontendState will preserve the order
    return transformToFrontendState(sortedMilestones);
  }, [activePlan?.milestones]);
  
  // Update state whenever processed milestones change
  useEffect(() => {
    setMilestones(processedMilestones);
  }, [processedMilestones]);

  // Handle milestone click
  const handleMilestoneClick = (id: string) => {
    setSelectedMilestone(id);
    console.log('Selected milestone:', id);
  };

  // Handle edit milestone click
  const handleEditMilestone = (id: string) => {
    console.log('Edit milestone:', id);
    
    // Find the milestone to edit
    const milestoneToEdit = milestones[id];
    if (milestoneToEdit) {
      setSelectedMilestone(id);
      setEditingMilestone(milestoneToEdit);
      setShowMilestoneModal(true);
    }
  };
  
  // Handle opening the milestone modal for creating a new milestone
  const handleOpenMilestoneModal = () => {
    setEditingMilestone(null);
    setShowMilestoneModal(true);
  };
  
  // Handle closing the milestone modal
  const handleCloseMilestoneModal = () => {
    setShowMilestoneModal(false);
    setEditingMilestone(null);
  };
  
  // Handle successful milestone creation or update
  const handleMilestoneSuccess = () => {
    // Refresh the plan data to include the new/updated milestone
    if (planId) {
      dispatch(fetchPlanById(planId));
    }
  };

  const handleCloneRoadmap = async () => {
    if(!activePlan) 
      return;

    // Check if user is authenticated
    if(!isAuthenticated) {
      // Store the roadmap info to clone after login
      localStorage.setItem('pendingCloneRoadmap', activePlan.id || '');
      dispatch(addNotification({
        type: 'info',
        message: 'Please log in to clone this roadmap'
      }));
      navigate('/login');
      return;
    }

    setIsCloning(true);

    // Clone the roadmap using the task id if authenticated
    if(activePlan.id) {
      try {
        const resultAction = await dispatch(cloneRoadmap(activePlan.id));
        
        if (cloneRoadmap.fulfilled.match(resultAction)) {
          const clonedPlan = resultAction.payload;
          
          // Track successful clone (you can implement analytics here)
          console.log('Roadmap cloned successfully', { 
            originalId: activePlan.id, 
            clonedId: clonedPlan.id 
          });
          
          dispatch(addNotification({
            type: 'success',
            message: 'Roadmap cloned successfully!'
          }));
          
          // Navigate to the cloned roadmap page
          navigate(`/plans/${clonedPlan.id}`);
        } else if (cloneRoadmap.rejected.match(resultAction)) {
          const error = resultAction.error;
          console.error('Failed to clone roadmap:', error);
          dispatch(addNotification({
            type: 'error',
            message: `Failed to clone roadmap: ${error.message || 'Unknown error'}`
          }));
        }
      } catch (error) {
        console.error('Exception while cloning roadmap:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'An unexpected error occurred. Please try again.'
        }));
      } finally {
        setIsCloning(false);
        setShowCloneConfirmModal(false);
      }
    } 
  }
  
  // Function to open the clone confirmation modal
  const handleOpenCloneConfirmation = () => {
    setShowCloneConfirmModal(true);
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
            {activePlan && !sharedId && (
              <Button 
                variant="default" 
                onClick={handleOpenMilestoneModal}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors rounded-xl shadow-md"
              >
                <Plus size={18} />
                Add Milestone
              </Button>
            )}

            {sharedId && (
              <Button
                variant="default"
                onClick={handleOpenCloneConfirmation}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-colors rounded-xl shadow-md"
                disabled={isCloning}
              >
                {isCloning ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cloning...
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Clone Roadmap
                  </>
                )}
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
              <div className="absolute top-4 right-20 text-xs text-gray-500 bg-white/90 backdrop-blur-sm py-1.5 px-3.5 rounded-full shadow-sm">
                Tip: Use fullscreen button for better viewing experience
              </div>
            </div>
          )}
          
          {/* Milestone Modal */}
          <Modal 
            isOpen={showMilestoneModal} 
            onClose={handleCloseMilestoneModal}
            title={editingMilestone ? "Edit Milestone" : "Add New Milestone"}
          >
            {planId && activePlan && (
              <MilestoneForm 
                taskId={planId}
                onClose={handleCloseMilestoneModal}
                onSuccess={handleMilestoneSuccess}
                existingMilestone={editingMilestone || undefined}
                parentOptions={getAllMilestones(activePlan.milestones)
                  .filter(milestone => !editingMilestone || milestone.id !== editingMilestone.id)
                  .map(milestone => ({
                    id: milestone.id,
                    title: milestone.parentId ? `${milestone.title}` : milestone.title
                  }))}
              />
            )}
          </Modal>
        </div>
        
        {/* Clone Confirmation Modal */}
        <Modal 
          isOpen={showCloneConfirmModal} 
          onClose={() => setShowCloneConfirmModal(false)}
          title="Clone Roadmap"
        >
          <div className="p-4">
            <p className="text-gray-600 mb-6">
              Are you sure you want to clone this roadmap? A new copy will be created in your account.
            </p>
            <div className="flex justify-end gap-4">
              <Button 
                variant="outline" 
                onClick={() => setShowCloneConfirmModal(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                onClick={handleCloneRoadmap}
                className="px-4 py-2 bg-green-600 hover:bg-green-700"
                disabled={isCloning}
              >
                {isCloning ? 'Cloning...' : 'Clone Roadmap'}
              </Button>
            </div>
          </div>
        </Modal>
      </MainLayout>
    </>
  );
};

export default RoadmapPage;
