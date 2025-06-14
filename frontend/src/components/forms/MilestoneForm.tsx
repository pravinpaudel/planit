import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { createMilestone, updateMilestone } from '../../features/plans/planSlice';
import { Button } from '../ui/Button';
import type { Milestone } from '../../types';

interface MilestoneFormProps {
  onClose: () => void;
  onSuccess?: () => void;
  taskId: string;
  existingMilestone?: Milestone;
  parentOptions?: Array<{ id: string; title: string }>;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({ 
  onClose, 
  onSuccess,
  taskId, 
  existingMilestone,
  parentOptions = []
}) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(existingMilestone?.title || '');
  const [description, setDescription] = useState(existingMilestone?.description || '');
  const [deadline, setDeadline] = useState(
    existingMilestone?.deadline 
      ? new Date(existingMilestone.deadline).toISOString().substring(0, 10) 
      : ''
  );
  const [parentId, setParentId] = useState<string | null>(existingMilestone?.parentId || null);
  const [isComplete, setIsComplete] = useState(existingMilestone?.isComplete || false);
  const [errors, setErrors] = useState({ title: '', description: '', deadline: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = { title: '', description: '', deadline: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }

    if (!deadline.trim()) {
      newErrors.deadline = 'Deadline is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      if (existingMilestone) {
        // Update existing milestone
        await dispatch(updateMilestone({ 
          milestoneId: existingMilestone.id, 
          milestoneData: { 
            title, 
            description, 
            deadline, 
            isComplete,
            parentId
          }
        })).unwrap();
      } else {
        // Create new milestone
        await dispatch(createMilestone({ 
          title, 
          description, 
          deadline, 
          taskId,
          parentId: parentId || undefined
        })).unwrap();
      }
      
      // Call onSuccess if provided
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving milestone:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Milestone Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter milestone title"
          className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      {parentOptions.length > 0 && (
        <div>
          <label htmlFor="parent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Parent Milestone (Optional)
          </label>
          <select
            id="parent"
            value={parentId || ''}
            onChange={(e) => setParentId(e.target.value || null)}
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent"
          >
            <option value="">None (Top Level)</option>
            {parentOptions.map(option => (
              // Don't include self as a parent option when editing
              existingMilestone && option.id === existingMilestone.id ? null : (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              )
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter milestone description"
          rows={3}
          className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Deadline
        </label>
        <input
          id="deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
            errors.deadline ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
        />
        {errors.deadline && <p className="mt-1 text-sm text-red-500">{errors.deadline}</p>}
      </div>

      {existingMilestone && (
        <div className="flex items-center">
          <input
            id="isComplete"
            type="checkbox"
            checked={isComplete}
            onChange={(e) => setIsComplete(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="isComplete" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Mark as complete
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : existingMilestone ? 'Update Milestone' : 'Create Milestone'}
        </Button>
      </div>
    </form>
  );
};

export default MilestoneForm;
