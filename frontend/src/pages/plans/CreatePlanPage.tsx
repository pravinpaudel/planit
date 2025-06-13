import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { motion } from 'framer-motion';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { createPlan } from '../../features/plans/planSlice';
import type { CreatePlanData } from '../../types';

const CreatePlanPage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { isLoading } = useAppSelector(state => state.plan);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const planData: CreatePlanData = {
      title: title.trim(),
      description: description.trim() || undefined,
    };

    const resultAction = await dispatch(createPlan(planData));
    if (createPlan.fulfilled.match(resultAction)) {
      navigate('/plans');
    }
  };

  return (
    <>
      <Navigation />
      <MainLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-6"
        >
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Plan</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create a new plan to organize your tasks and milestones.
            </p>
          </div>

          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Plan Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-roadmap-primary focus:outline-none focus:ring-roadmap-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter plan title"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-roadmap-primary focus:outline-none focus:ring-roadmap-primary dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Enter plan description (optional)"
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => navigate('/plans')}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    type="submit"
                    disabled={!title.trim() || isLoading}
                    isLoading={isLoading}
                  >
                    Create Plan
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </MainLayout>
    </>
  );
};

export default CreatePlanPage;
