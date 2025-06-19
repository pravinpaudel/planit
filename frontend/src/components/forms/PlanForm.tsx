import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { createPlan, updatePlan } from '../../features/plans/planThunks';
import { Button } from '../ui/Button';
import type { Plan } from '../../types';

interface PlanFormProps {
  onClose: () => void;
  existingPlan?: Plan;
}

const PlanForm: React.FC<PlanFormProps> = ({ onClose, existingPlan }) => {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(existingPlan?.title || '');
  const [description, setDescription] = useState(existingPlan?.description || '');
  const [errors, setErrors] = useState({ title: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = { title: '', description: '' };
    let isValid = true;

    if (!title.trim()) {
      newErrors.title = 'Title is required';
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
      if (existingPlan) {
        // Update existing plan
        await dispatch(updatePlan({ 
          planId: existingPlan.id, 
          planData: { title, description }
        })).unwrap();
      } else {
        // Create new plan
        await dispatch(createPlan({ title, description })).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Error saving plan:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Plan Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter plan title"
          className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
            errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
        />
        {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter plan description"
          rows={4}
          className={`mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border ${
            errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent`}
        />
        {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
      </div>

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
          {isSubmitting ? 'Saving...' : existingPlan ? 'Update Plan' : 'Create Plan'}
        </Button>
      </div>
    </form>
  );
};

export default PlanForm;
