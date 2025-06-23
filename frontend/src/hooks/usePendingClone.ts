import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from './reduxHooks';
import { cloneRoadmap } from '../features/plans/planThunks';
import { addNotification } from '../features/ui/uiSlice';

/**
 * A custom hook to handle pending roadmap clones after login
 * 
 * This hook will check if there's a pending roadmap to clone in localStorage
 * and will initiate the clone process after successful authentication
 */
export const usePendingClone = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const processPendingClone = useCallback(async () => {
    const pendingCloneRoadmapId = localStorage.getItem('pendingCloneRoadmap');
    
    if (!pendingCloneRoadmapId) return;
    
    try {
      // Remove the pending clone from localStorage first to prevent repeated attempts
      localStorage.removeItem('pendingCloneRoadmap');
      
      // Show a notification that cloning is in progress
      dispatch(addNotification({
        type: 'info',
        message: 'Cloning the roadmap you requested...'
      }));
      
      // Execute the clone operation
      const resultAction = await dispatch(cloneRoadmap(pendingCloneRoadmapId));
      
      if (cloneRoadmap.fulfilled.match(resultAction)) {
        const clonedPlan = resultAction.payload;
        
        dispatch(addNotification({
          type: 'success',
          message: 'Roadmap cloned successfully!'
        }));
        
        // Navigate to the cloned roadmap
        navigate(`/plans/${clonedPlan.id}`);
      } else if (cloneRoadmap.rejected.match(resultAction)) {
        const error = resultAction.error;
        console.error('Failed to clone pending roadmap:', error);
        
        dispatch(addNotification({
          type: 'error',
          message: `Failed to clone roadmap: ${error.message || 'Unknown error'}`
        }));
      }
    } catch (error: any) {
      console.error('Exception while processing pending clone:', error);
      
      // Make sure we always clear the localStorage item even if an error occurs
      localStorage.removeItem('pendingCloneRoadmap');
      
      dispatch(addNotification({
        type: 'error',
        message: 'An unexpected error occurred while cloning the roadmap.'
      }));
    }
  }, [dispatch, navigate]);

  // No useEffect here - processPendingClone will be called explicitly where needed
  
  return { processPendingClone };
};
