import { useParams, useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { useEffect, useState, useMemo } from 'react';
import { Milestone } from '../../types/plan';
import D3TreeVisualization from '../../components/plans/D3TreeVisualization';
import { TimelineView } from '../../components/roadmap/TimelineView';
import { KanbanView } from '../../components/roadmap/KanbanView';
import { RoadmapControls, ViewMode, SortBy, GroupBy, FilterOptions } from '../../components/roadmap/RoadmapControls';
import transformToFrontendState from '../../utils/transformToFrontendState';
import { getAllMilestones, statusConfig } from '../../utils/milestoneUtils';
import { formatDate } from '../../utils/dateUtils';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById, getSharedRoadmap, cloneRoadmap } from '../../features/plans/planThunks';
import { selectActivePlan, selectPlanLoading, selectPlanError } from '../../features/plans/planSelectors';
import { Button } from '../../components/ui/Button';
import { Plus, Copy, Edit } from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import MilestoneForm from '../../components/forms/MilestoneForm';
import { useAuth } from '../../hooks/useAuth';
import { addNotification } from '../../features/ui/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // New state for Fortune 500 features
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [groupBy, setGroupBy] = useState<GroupBy>('none');
  const [filters, setFilters] = useState<FilterOptions>({
    statuses: [],
    searchQuery: '',
    dateRange: { start: null, end: null }
  });
  
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
  
  // Filter, sort, and group milestones
  const filteredAndSortedMilestones = useMemo(() => {
    // Convert to array
    let milestonesArray = Object.values(milestones);
    
    // Apply status filter
    if (filters.statuses.length > 0) {
      milestonesArray = milestonesArray.filter(m => 
        filters.statuses.includes(m.status || 'NOT_STARTED')
      );
    }
    
    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      milestonesArray = milestonesArray.filter(m =>
        m.title.toLowerCase().includes(query) ||
        (m.description && m.description.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    milestonesArray.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case 'status':
          const statusOrder = ['NOT_STARTED', 'IN_PROGRESS', 'AT_RISK', 'DELAYED', 'COMPLETED'];
          return statusOrder.indexOf(a.status || 'NOT_STARTED') - statusOrder.indexOf(b.status || 'NOT_STARTED');
        case 'title':
          return a.title.localeCompare(b.title);
        case 'createdAt':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        default:
          return 0;
      }
    });
    
    return milestonesArray;
  }, [milestones, filters, sortBy]);

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
    // Close modal immediately for better UX
    handleCloseMilestoneModal();
    // Refresh plan data efficiently via Redux (no full page re-render)
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
        {/* Premium Header with breadcrumb navigation */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 text-sm mb-4">
            <button
              onClick={() => navigate(`/plans/${planId || activePlan?.id}`)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition-colors group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Plan</span>
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Roadmap</span>
          </div>

          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                {/* Icon removed for cleaner look */}
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    {activePlan?.title || 'Project Roadmap'}
                  </h1>
                  {activePlan?.description && (
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-base max-w-3xl">
                      {activePlan.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Right aligned, visually separated */}
            <div className="flex items-center gap-3">
              {activePlan && !sharedId && (
                <Button 
                  variant="default" 
                  onClick={handleOpenMilestoneModal}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all rounded-lg shadow-md hover:shadow-lg"
                >
                  <Plus size={18} />
                  <span className="font-medium">Add Milestone</span>
                </Button>
              )}

              {sharedId && (
                <Button
                  variant="default"
                  onClick={handleOpenCloneConfirmation}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transition-all rounded-lg shadow-md hover:shadow-lg"
                  disabled={isCloning}
                >
                  {isCloning ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Cloning...</span>
                    </>
                  ) : (
                    <>
                      <Copy size={18} />
                      <span className="font-medium">Clone Roadmap</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main Content Area - Two column layout for better UX */}
        <div className="flex gap-6 h-[calc(100vh-16rem)]">
          {/* Left: Primary Visualization Area (takes 70% on desktop) */}
          <div className="flex-1 flex flex-col gap-4 min-w-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading roadmap...</p>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
                <h3 className="font-semibold mb-2">Error Loading Roadmap</h3>
                <p>{error}</p>
              </div>
            ) : !activePlan ? (
              <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-xl border border-yellow-200 dark:border-yellow-800">
                <h3 className="font-semibold mb-2">Plan Not Found</h3>
                <p>The requested plan could not be found.</p>
              </div>
            ) : Object.keys(milestones).length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-700"
              >
                <div className="text-center max-w-md px-8">
                  <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Start Your Journey</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Create your first milestone to visualize your project roadmap and track progress effectively.
                  </p>
                  <Button 
                    variant="default" 
                    onClick={handleOpenMilestoneModal}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl rounded-lg mx-auto"
                  >
                    <Plus size={20} />
                    <span className="font-semibold">Create First Milestone</span>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Controls Bar - Now more compact and integrated */}
                <RoadmapControls
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                  sortBy={sortBy}
                  onSortByChange={setSortBy}
                  groupBy={groupBy}
                  onGroupByChange={setGroupBy}
                  filters={filters}
                  onFiltersChange={setFilters}
                  totalMilestones={Object.keys(milestones).length}
                  filteredCount={filteredAndSortedMilestones.length}
                />
                
                {/* Visualization Container - Full height, responsive */}
                <div className="flex-1 min-h-0">
                  <AnimatePresence mode="wait">
                    {viewMode === 'tree' && (
                      <motion.div
                        key="tree"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-xl shadow-xl bg-gradient-to-br from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden"
                      >
                        <D3TreeVisualization 
                          milestones={Object.fromEntries(
                            filteredAndSortedMilestones.map(m => [m.id, m])
                          )}
                          onMilestoneClick={handleMilestoneClick}
                          selectedMilestone={selectedMilestone}
                          onEditMilestone={handleEditMilestone}
                          planTitle={activePlan.title}
                        />
                      </motion.div>
                    )}
                    
                    {viewMode === 'timeline' && (
                      <motion.div
                        key="timeline"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <TimelineView
                          milestones={filteredAndSortedMilestones}
                          onMilestoneClick={handleMilestoneClick}
                          selectedMilestone={selectedMilestone}
                        />
                      </motion.div>
                    )}
                    
                    {viewMode === 'kanban' && (
                      <motion.div
                        key="kanban"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="h-full"
                      >
                        <KanbanView
                          milestones={filteredAndSortedMilestones}
                          onMilestoneClick={handleMilestoneClick}
                          selectedMilestone={selectedMilestone}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          {/* Right: Milestone Details Sidebar (30% on desktop, collapses on mobile) */}
          {selectedMilestone && !sharedId && Object.keys(milestones).length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="w-96 hidden lg:block"
            >
              <div className="h-full bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                {/* Sidebar Header */}
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Milestone Details</h3>
                    <button
                      onClick={() => setSelectedMilestone(null)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  {milestones[selectedMilestone] && (
                    <>
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {milestones[selectedMilestone].title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusConfig[milestones[selectedMilestone].status || 'NOT_STARTED'].color
                        }`}>
                          {statusConfig[milestones[selectedMilestone].status || 'NOT_STARTED'].label}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Sidebar Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {milestones[selectedMilestone] && (
                    <>
                      {/* Description */}
                      {milestones[selectedMilestone].description && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Description
                          </label>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            {milestones[selectedMilestone].description}
                          </p>
                        </div>
                      )}

                      {/* Deadline */}
                      {milestones[selectedMilestone].deadline && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Deadline
                          </label>
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(milestones[selectedMilestone].deadline)}</span>
                          </div>
                        </div>
                      )}

                      {/* Sub-milestones count */}
                      {milestones[selectedMilestone].children && milestones[selectedMilestone].children!.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Sub-milestones
                          </label>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {milestones[selectedMilestone].children!.length} sub-milestone{milestones[selectedMilestone].children!.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Sidebar Footer - Actions */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <Button
                    variant="default"
                    onClick={() => handleEditMilestone(selectedMilestone)}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                    <span className="font-medium">Edit Milestone</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

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
