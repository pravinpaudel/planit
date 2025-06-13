import { useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';

const RoadmapPage = () => {
  const { planId } = useParams<{ planId: string }>();
  
  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-4">Plan Roadmap</h1>
          <p>Plan ID: {planId}</p>
          <p>Hello World! This is the Roadmap page.</p>
        </div>
      </MainLayout>
    </>
  );
};

export default RoadmapPage;
