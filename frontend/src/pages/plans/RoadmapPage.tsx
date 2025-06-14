import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { useEffect, useState } from 'react';
import { Milestone } from '../../types/plan';
import D3TreeVisualization from '../../components/plans/D3TreeVisualization';
import transformToFrontendState from '../../utils/transformToFrontendState';
import { getAllMilestones } from './PlanDetailPage';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { fetchPlanById } from '../../features/plans/planSlice';

const RoadmapPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const dispatch = useAppDispatch();
  const { activePlan, isLoading, error } = useAppSelector(state => state.plan);
  const [milestones, setMilestones] = useState<Record<string, Milestone>>({});
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);

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
    // You can add additional logic here like showing a detail panel
  };
  
  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-4">Plan Roadmap</h1>
          
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
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
              No milestones found for this plan. Create some milestones to visualize your roadmap.
            </div>
          ) : (
            <div className="h-[80vh] w-full border rounded-md shadow-sm bg-white relative overflow-hidden">
              <D3TreeVisualization 
                milestones={milestones}
                onMilestoneClick={handleMilestoneClick}
                selectedMilestone={selectedMilestone}
              />
            </div>
          )}
        </div>
      </MainLayout>
    </>
  );
};

export default RoadmapPage;
