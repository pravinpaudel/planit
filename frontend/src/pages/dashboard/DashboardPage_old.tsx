import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { Card, CardContent, CardHeader, CardTitle, GlassCard } from '../../components/ui/Card';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  Clock, 
  Target, 
  Plus, 
  Folders,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Zap,
  ArrowRight,
  BarChart3,
  Activity
} from 'lucide-react';
import WelcomeOverlay from '../../components/shared/WelcomeOverlay';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import type { AuthState } from '../../types';
import PlanForm from '../../components/forms/PlanForm';
import { CompletionTrendChart } from '../../components/charts/CompletionTrendChart';
import { StatusPieChart } from '../../components/charts/StatusPieChart';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { 
  fetchDashboardStats, 
  fetchCompletionTrends, 
  fetchStatusDistribution,
  fetchActivityFeed 
} from '../../features/analytics/analyticsSlice';
import {
  selectDashboardStats,
  selectCompletionTrends,
  selectStatusDistribution,
  selectActivityFeed,
  selectAnalyticsLoading
} from '../../features/analytics/analyticsSelectors';
import { formatDate, formatRelativeTime } from '../../utils/dateUtils';
import { statusConfig } from '../../utils/milestoneUtils';
import { 
  fetchDashboardStats, 
  fetchCompletionTrends, 
  fetchStatusDistribution,
  fetchActivityFeed 
} from '../../features/analytics/analyticsSlice';
import { 
  selectDashboardStats, 
  selectCompletionTrends,
  selectStatusDistribution,
  selectActivityFeed,
  selectAnalyticsLoading 
} from '../../features/analytics/analyticsSelectors';
import { CompletionTrendChart } from '../../components/charts/CompletionTrendChart';
import { StatusPieChart } from '../../components/charts/StatusPieChart';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { formatDate } from '../../utils/dateUtils';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth as AuthState);
  const user = auth.user;
  const [showWelcome, setShowWelcome] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Analytics data
  const dashboardStats = useAppSelector(selectDashboardStats);
  const trends = useAppSelector(selectCompletionTrends);
  const statusDistribution = useAppSelector(selectStatusDistribution);
  const activities = useAppSelector(selectActivityFeed);
  const isLoadingAnalytics = useAppSelector(selectAnalyticsLoading);
  
  // Check if this is the user's first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  // Fetch analytics data on mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchCompletionTrends(30));
    dispatch(fetchStatusDistribution());
    dispatch(fetchActivityFeed(10));
  }, [dispatch]);

  const handleCompleteWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleOpenModal = () => {
    // For now, we'll use a placeholder task ID
    // In a real application, you would need to either:
    // 1. Get the selected task ID from the UI
    // 2. Create a new task first, then create a milestone for it
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const statsItems = [
    {
      title: 'Active Plans',
      value: dashboardStats?.activePlans?.toString() || '0',
      icon: <Target className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Completed Milestones',
      value: dashboardStats?.completedMilestones?.toString() || '0',
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Due This Week',
      value: dashboardStats?.dueThisWeek?.toString() || '0',
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Completion Rate',
      value: `${dashboardStats?.completionRate || 0}%`,
      icon: <Clock className="h-8 w-8 text-amber-500" />,
      color: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-6">
          <div className="mb-8">
            <motion.h1 
              className="text-2xl font-semibold text-gray-900 dark:text-white"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome, {user?.firstName || 'User'}!
            </motion.h1>
            <motion.p 
              className="mt-1 text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Here's an overview of your productivity planning.
            </motion.p>
          </div>
          
          {/* Stats Section */} 
          <motion.div 
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {statsItems.map((item, i) => (
              <motion.div key={i} variants={itemVariants}>
                <GlassCard className="overflow-hidden hover:shadow-md transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-lg ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="ml-5">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                          {item.title}
                        </p>
                        <p className="text-3xl font-semibold text-gray-900 dark:text-white">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {/* Upcoming Milestones */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Milestones</CardTitle>
                <Link to="/plans">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Folders className="h-4 w-4" />
                    View All Plans
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>Loading upcoming milestones...</p>
                  </div>
                ) : dashboardStats && dashboardStats.upcomingMilestones.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardStats.upcomingMilestones.slice(0, 5).map((milestone) => (
                      <AnimatedMilestoneCard key={milestone.id} priority={2} className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{milestone.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              {milestone.description.length > 80
                                ? `${milestone.description.substring(0, 80)}...`
                                : milestone.description}
                            </p>
                          </div>
                          <Badge variant="secondary" className="ml-3 shrink-0">{milestone.status}</Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {formatDate(milestone.deadline)}</span>
                          </div>
                          <Link to={`/plans/${milestone.taskId}`}>
                            <Button variant="ghost" size="sm" className="h-7">View Plan</Button>
                          </Link>
                        </div>
                      </AnimatedMilestoneCard>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p className="mb-6 font-medium">Ready to add your first goal?</p>
                    <div className="flex justify-center mb-4">
                      <Badge 
                        variant="outline" 
                        className="mx-auto cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={handleOpenModal}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Create a new plan
                      </Badge>
                    </div>
                    <p className="text-sm">
                      Start building your roadmap by creating your first plan
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Feed */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <p>Loading activity...</p>
                  </div>
                ) : (
                  <ActivityFeed activities={activities} />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Charts Section */}
          <motion.div 
            className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            {/* Completion Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Completion Trends (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>Loading trends...</p>
                  </div>
                ) : trends && trends.length > 0 ? (
                  <CompletionTrendChart data={trends} height={300} />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No trend data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Milestone Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingAnalytics ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>Loading distribution...</p>
                  </div>
                ) : statusDistribution ? (
                  <StatusPieChart data={statusDistribution} size={280} />
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    <p>No status data available yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <AnimatePresence>
          {showWelcome && user && (
            <WelcomeOverlay
              userName={user.firstName}
              onComplete={handleCompleteWelcome}
            />
          )}
        </AnimatePresence>

        {/* Milestone Form Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Create New Goal"
        >
          <PlanForm
            onClose={handleCloseModal}
          />
        </Modal>
      </MainLayout>
    </>
  );
};

export default DashboardPage;
