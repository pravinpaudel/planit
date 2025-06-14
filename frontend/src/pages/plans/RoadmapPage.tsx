import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { useEffect, useState } from 'react';
import { Milestone } from '../../types/plan';
import milestoneService from '../../services/milestoneService';
import D3TreeVisualization from '../../components/plans/D3TreeVisualization';
import transformToFrontendState from '../../utils/transformToFrontendState';
import { getAllMilestones } from './PlanDetailPage';

const RoadmapPage = () => {
  const { planId } = useParams<{ planId: string }>();
  const [milestones, setMilestones] = useState<Record<string, Milestone>>({});
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch milestones when component mounts
  useEffect(() => {
    if (!planId) return;

    const fetchMilestones = async () => {
      try {
        setIsLoading(true);
        const data = await milestoneService.getMilestones(planId);
        const flattenMilestones = getAllMilestones(data);
        // Transform data to the format expected by the D3 visualization
        const transformedData = transformToFrontendState(flattenMilestones);
        setMilestones(transformedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch milestones:', err);
        setError('Failed to load milestone data. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchMilestones();
  }, [planId]);

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
          ) : Object.keys(milestones).length === 0 ? (
            <div className="p-4 bg-blue-50 text-blue-700 rounded-md">
              No milestones found for this plan. Create some milestones to visualize your roadmap.
            </div>
          ) : (
            <div className="h-[75vh] w-full border rounded-md shadow-sm bg-white">
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
