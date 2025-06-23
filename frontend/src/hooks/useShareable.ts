import { useState } from 'react';
import { useAppDispatch } from './reduxHooks';
import { enableRoadmapSharing, disableRoadmapSharing, updateRoadmapSharing } from '../features/plans/planThunks';
import { Shareable } from '../types/plan';
import { addNotification } from '../features/ui/uiSlice';

interface ShareableHookResult {
  // State
  isShareModalOpen: boolean;
  sharingItem: Shareable | null;
  sharingOption: 'public' | 'private';
  copySuccess: boolean;
  
  // Actions
  openShareModal: (item: Shareable) => void;
  closeShareModal: () => void;
  setSharingOption: (option: 'public' | 'private') => void;
  handleSaveSharing: () => Promise<boolean>;
  handleCopyLink: () => void;
  handleSocialShare: (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => void;
  handleRegenerateLink: (itemId: string) => Promise<void>;
}

/**
 * Custom hook for managing shareable items
 * 
 * Provides state and actions for sharing functionality including
 * modal state, copy link functionality, and API interactions
 */
export function useShareable(): ShareableHookResult {
  const dispatch = useAppDispatch();
  
  // State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingItem, setSharingItem] = useState<Shareable | null>(null);
  const [sharingOption, setSharingOption] = useState<'public' | 'private'>('private');
  const [copySuccess, setCopySuccess] = useState(false);
  
  // Open share modal with a specific item
  const openShareModal = (item: Shareable) => {
    setSharingItem(item);
    setSharingOption(item.isPublic ? 'public' : 'private');
    setIsShareModalOpen(true);
    setCopySuccess(false);
  };
  
  // Close share modal and reset state
  const closeShareModal = () => {
    setIsShareModalOpen(false);
    setTimeout(() => {
      setSharingItem(null);
      setCopySuccess(false);
    }, 300);
  };
  
  // Handle saving sharing settings
  const handleSaveSharing = async () => {
    if (!sharingItem) return false;
    
    try {
      // Only make API calls if the sharing option has changed
      if (sharingOption === 'public' && !sharingItem.isPublic) {
        // Enable sharing if switching from private to public
        const result = await dispatch(enableRoadmapSharing(sharingItem.id));
        
        // Update the sharing item with the new data from backend response
        const responseData = result.payload as { isPublic: boolean, shareableLink: string } | undefined;
        if (responseData && responseData.shareableLink) {
          // Force a re-render by creating a new object reference
          const updatedItem = { 
            ...sharingItem, 
            isPublic: true, 
            shareableLink: responseData.shareableLink 
          };
          
          // Update local state with the link returned from the backend
          setSharingItem(updatedItem);
          
          // Show a success notification
          dispatch(addNotification({
            type: 'success',
            message: 'Share link has been generated successfully!'
          }));
          
          // Reset copy state when a new link is generated
          setCopySuccess(false);
          
          return true; // Return success status
        } else {
          console.error('No sharable link returned from the backend');
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to generate share link. Please try again.'
          }));
          return false;
        }
      } else if (sharingOption === 'private' && sharingItem.isPublic) {
        // Disable sharing if switching from public to private
        await dispatch(disableRoadmapSharing(sharingItem.id));
        
        // Force a re-render by creating a new object reference
        const updatedItem = {
          ...sharingItem,
          isPublic: false,
          shareableLink: undefined
        };
        
        setSharingItem(updatedItem);
        
        dispatch(addNotification({
          type: 'success',
          message: 'Plan is now private'
        }));
        
        return true;
      }
      
      return false; // No changes were made
    } catch (error) {
      console.error('Error updating sharing settings:', error);
      // Show an error message or toast here if you have one
      return false;
    }
  };
  
  // Handle copying share link
  const handleCopyLink = () => {
    if (!sharingItem?.shareableLink) return;
    
    const baseUrl = window.location.origin;
    const fullShareLink = `${baseUrl}/shared/${sharingItem.shareableLink}`;
    
    navigator.clipboard.writeText(fullShareLink)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        // Show a success notification
        dispatch(addNotification({
          type: 'success',
          message: 'Link copied to clipboard!'
        }));
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to copy link. Please try again.'
        }));
      });
  };
  
  // Share to social media platforms
  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => {
    if (!sharingItem?.shareableLink) return;
    
    const shareUrl = `${window.location.origin}/shared/${sharingItem.shareableLink}`;
    const shareTitle = `Check out my "${sharingItem.title}" plan on PlanIt`;
    const shareText = `I created a plan "${sharingItem.title}" that I want to share with you.`;
    
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`;
        break;
      case 'email':
        url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };
  
  // Regenerate link for a shared item
  const handleRegenerateLink = async (itemId: string) => {
    try {
      const result = await dispatch(updateRoadmapSharing({
        planId: itemId,
        shareSettings: {
          isPublic: true,
          regenerateLink: true
        }
      }));
      
      // Update local state with the new link
      const responseData = result.payload as { isPublic: boolean, shareableLink: string } | undefined;
      if (responseData && responseData.shareableLink) {
        // Create a completely new object to ensure React re-renders
        setSharingItem(prev => prev ? { 
          ...prev, 
          shareableLink: responseData.shareableLink 
        } : null);
        
        setCopySuccess(false);
        
        // Show a success notification
        dispatch(addNotification({
          type: 'success',
          message: 'Share link has been regenerated successfully!'
        }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to regenerate share link. Please try again.'
        }));
      }
    } catch (error) {
      console.error('Error regenerating link:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to regenerate share link. Please try again.'
      }));
    }
  };
  
  return {
    // State
    isShareModalOpen,
    sharingItem,
    sharingOption,
    copySuccess,
    
    // Actions
    openShareModal,
    closeShareModal,
    setSharingOption,
    handleSaveSharing,
    handleCopyLink,
    handleSocialShare,
    handleRegenerateLink
  };
}
