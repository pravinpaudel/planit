import { FC, useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Globe, Lock, Eye, Copy, CheckCircle, RefreshCw, Share } from 'lucide-react';
import { Shareable } from '../../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  sharingItem: Shareable | null;
  sharingOption: 'public' | 'private';
  copySuccess: boolean;
  onSharingOptionChange: (option: 'public' | 'private') => void;
  onSave: () => Promise<boolean>;
  onCopyLink: () => void;
  onSocialShare: (platform: 'twitter' | 'facebook' | 'linkedin' | 'email') => void;
  onRegenerateLink: (itemId: string) => Promise<void>;
}

export const ShareModal: FC<ShareModalProps> = ({
  isOpen,
  onClose,
  sharingItem,
  sharingOption,
  copySuccess,
  onSharingOptionChange,
  onSave,
  onCopyLink,
  onSocialShare,
  onRegenerateLink
}) => {
  const [saving, setSaving] = useState(false);
  const [localCopySuccess, setLocalCopySuccess] = useState(copySuccess);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Sync the external copySuccess prop with the internal state
  useEffect(() => {
    setLocalCopySuccess(copySuccess);
  }, [copySuccess]);
  
  if (!sharingItem) return null;
  
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  // Check if changes have been made to the sharing option
  const hasChanges = sharingItem.isPublic !== (sharingOption === 'public');
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${sharingItem?.isPublic ? 'Manage Sharing' : 'Share'} "${sharingItem?.title || 'Item'}"`}
      size="md"
    >
      <div className="p-4 space-y-4">
        {/* Compact visibility toggle */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <button
            type="button"
            className={`group flex items-center p-3 rounded-lg border cursor-pointer transition-all
              ${sharingOption === 'private' 
                ? 'bg-white border-gray-300 dark:bg-gray-800 dark:border-gray-600 ring-1 ring-gray-200 dark:ring-gray-700' 
                : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}
            onClick={() => onSharingOptionChange('private')}
          >
            <div className={`p-2 rounded-full mr-3 transition-colors
              ${sharingOption === 'private' 
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
              <Lock className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Private</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Only you can access</div>
            </div>
            {sharingOption === 'private' && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-gray-500 dark:bg-gray-300 rounded-full"></div>
              </div>
            )}
          </button>

          <button
            type="button"
            className={`group flex items-center p-3 rounded-lg border cursor-pointer transition-all
              ${sharingOption === 'public' 
                ? 'bg-white border-blue-400 dark:bg-gray-800 dark:border-blue-600 ring-1 ring-blue-200 dark:ring-blue-900/50' 
                : 'bg-gray-50 border-gray-200 dark:bg-gray-900 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'}`}
            onClick={() => onSharingOptionChange('public')}
          >
            <div className={`p-2 rounded-full mr-3 transition-colors
              ${sharingOption === 'public' 
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-300' 
                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
              <Globe className="h-5 w-5" />
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">Public</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Anyone with link</div>
            </div>
            {sharingOption === 'public' && (
              <div className="ml-auto">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
              </div>
            )}
          </button>
        </div>

        {/* Collapsible info section */}
        <div>
          <button 
            type="button"
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center mb-2"
            onClick={() => setShowInfoPanel(!showInfoPanel)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {showInfoPanel ? 'Hide sharing details' : 'What does sharing do?'}
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className={`h-3.5 w-3.5 ml-1 transition-transform ${showInfoPanel ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
          
          {showInfoPanel && (
            <div className="grid grid-cols-2 gap-2 mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-md text-blue-600 dark:text-blue-300 mr-2 flex-shrink-0">
                  <Eye className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium">View-only access</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Others can see but not edit</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-green-100 dark:bg-green-900/40 p-1.5 rounded-md text-green-600 dark:text-green-300 mr-2 flex-shrink-0">
                  <Copy className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-medium">Clone option</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Others can make a copy</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shareable link section - only show if item is actually public and has a link */}
        {(sharingItem.isPublic && sharingItem.shareableLink) && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 p-3">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium flex items-center">
                  <span className="mr-2">Shareable link</span>
                  <span className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                    Active
                  </span>
                </h4>
              </div>
              
              <div className="relative">
                <div className="flex items-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                  <div className="flex-1 py-1.5 px-2 text-sm truncate">
                    <span className="text-gray-700 dark:text-gray-300 select-all text-sm">
                      {sharingItem.shareableLink && `${window.location.origin}/shared/${sharingItem.shareableLink}`}
                    </span>
                  </div>
                  <div className="pr-2 relative">
                    <Button
                      variant={localCopySuccess ? "success" : "default"}
                      size="sm"
                      className="rounded-md min-w-[70px] py-1 px-2 shadow-sm transition-colors h-[30px]"
                      onClick={() => {
                        onCopyLink();
                        setLocalCopySuccess(true);
                        setTimeout(() => setLocalCopySuccess(false), 2000);
                      }}
                      disabled={!sharingItem.shareableLink}
                    >
                      {localCopySuccess ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span className="font-medium">Copied</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="h-3.5 w-3.5" />
                          <span className="font-medium">Copy</span>
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Social sharing options - more compact */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <button 
                type="button"
                onClick={() => onSocialShare('twitter')}
                className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-blue-500 dark:text-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                disabled={!sharingItem.shareableLink}
                title="Share on Twitter"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </button>
              
              <button 
                type="button"
                onClick={() => onSocialShare('facebook')}
                className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                disabled={!sharingItem.shareableLink}
                title="Share on Facebook"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              
              <button 
                type="button"
                onClick={() => onSocialShare('linkedin')}
                className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-blue-700 dark:text-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                disabled={!sharingItem.shareableLink}
                title="Share on LinkedIn"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </button>
              
              <button 
                type="button"
                onClick={() => onSocialShare('email')}
                className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                disabled={!sharingItem.shareableLink}
                title="Share via Email"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </button>
              
              <div className="relative ml-auto group">
                <button 
                  type="button"
                  onClick={() => onRegenerateLink(sharingItem.id)}
                  className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-300 transition-colors"
                  disabled={!sharingItem.shareableLink}
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                  Generate a new link and invalidate the current one
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Message when toggled to public but not saved yet - compact version */}
        {!sharingItem.isPublic && sharingOption === 'public' && (
          <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-md text-sm flex items-center">
            <Globe className="h-4 w-4 text-blue-500 dark:text-blue-400 mr-2" />
            <span className="text-blue-700 dark:text-blue-300">Save changes to generate a shareable link</span>
          </div>
        )}
        
        {/* Footer actions - more compact and visually distinct */}
        <div className="border-t pt-3 mt-2">
          {hasChanges ? (
            <div className="flex items-center justify-between">
              {hasChanges && (
                <div className="text-xs text-amber-600 dark:text-amber-400 flex items-center">
                  <svg className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Unsaved changes</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-700 dark:text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className={`bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white`}
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {sharingOption === 'public' ? 'Generating...' : 'Saving...'}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      {sharingOption === 'public' && !sharingItem.isPublic ? (
                        <>
                          <Globe className="h-4 w-4 mr-1" />
                          Generate Link
                        </>
                      ) : sharingOption === 'private' && sharingItem.isPublic ? (
                        <>
                          <Lock className="h-4 w-4 mr-1" />
                          Make Private
                        </>
                      ) : (
                        'Apply Changes'
                      )}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                variant="default"
                size="sm"
                onClick={onClose}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-100"
              >
                Done
              </Button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
