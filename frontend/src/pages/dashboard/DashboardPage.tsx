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
  ChevronRight,
  Edit
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
import { formatDate } from '../../utils/dateUtils';
import { statusConfig } from '../../utils/milestoneUtils';

const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth as AuthState);
  const user = auth.user;
  
  // Analytics data
  const dashboardStats = useAppSelector(selectDashboardStats);
  const trends = useAppSelector(selectCompletionTrends);
  const statusDistribution = useAppSelector(selectStatusDistribution);
  const activities = useAppSelector(selectActivityFeed);
  const isLoading = useAppSelector(selectAnalyticsLoading);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedView, setSelectedView] = useState<'7days' | '30days' | '90days'>('30days');
  
  // Fetch all analytics data on component mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchStatusDistribution());
    dispatch(fetchActivityFeed(10));
    
    // Fetch trends based on selected view
    const daysMap = { '7days': 7, '30days': 30, '90days': 90 };
    dispatch(fetchCompletionTrends(daysMap[selectedView]));
  }, [dispatch, selectedView]);
  
  // Check if this is the user's first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome && user) {
      setShowWelcome(true);
    }
  }, [user]);

  const handleCompleteWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Animation variants
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

  // Calculate percentage changes (mock for now - could be calculated from historical data)
  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Stats configuration for KPI cards
  const primaryStats = [
    {
      title: 'Active Plans',
      value: dashboardStats?.activePlans || 0,
      icon: <Folders className="h-6 w-6" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      change: 0, // Would come from historical data
      trend: 'up'
    },
    {
      title: 'Completion Rate',
      value: `${dashboardStats?.completionRate || 0}%`,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      change: 0,
      trend: 'up'
    },
    {
      title: 'Due This Week',
      value: dashboardStats?.dueThisWeek || 0,
      icon: <Calendar className="h-6 w-6" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      change: 0,
      trend: 'neutral'
    },
    {
      title: 'At Risk',
      value: dashboardStats?.atRiskMilestones || 0,
      icon: <Clock className="h-6 w-6" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      change: 0,
      trend: 'down'
    }
  ];

  return (
    <>
      <Navigation />
      <MainLayout>
        <div className="py-6 space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Welcome back, {user?.firstName || 'User'}!
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Here's what's happening with your plans today
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Button 
                variant="default"
                onClick={handleOpenModal}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus size={18} />
                New Plan
              </Button>
            </motion.div>
          </div>

          {/* Primary KPI Cards */}
          <motion.div 
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {primaryStats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants}>
                <GlassCard className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0">
                  {/* Gradient background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                  
                  <CardContent className="p-6 relative">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        {stat.change !== 0 && (
                          <div className="flex items-center mt-2 text-sm">
                            <span className={`${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.trend === 'up' ? '+' : ''}{stat.change}%
                            </span>
                            <span className="text-gray-500 ml-1">vs last period</span>
                          </div>
                        )}
                      </div>
                      <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                        <div className={`bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}>
                          {stat.icon}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts and Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Completion Trends - 2/3 width */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle className="text-lg font-semibold">Completion Trends</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Milestone completion over time</p>
                  </div>
                  <div className="flex gap-2">
                    {(['7days', '30days', '90days'] as const).map((view) => (
                      <button
                        key={view}
                        onClick={() => setSelectedView(view)}
                        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                          selectedView === view
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {view === '7days' ? '7D' : view === '30days' ? '30D' : '90D'}
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-pulse text-gray-500">Loading chart...</div>
                    </div>
                  ) : trends.length > 0 ? (
                    <CompletionTrendChart data={trends} height={280} />
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Start completing milestones to see trends</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Status Distribution - 1/3 width */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Status Overview</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Current milestone distribution</p>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-pulse text-gray-500">Loading...</div>
                    </div>
                  ) : statusDistribution ? (
                    <>
                      <StatusPieChart data={statusDistribution} size={240} />
                      <div className="mt-6 space-y-2">
                        {Object.entries(statusDistribution).map(([status, count]) => (
                          count > 0 && (
                            <div key={status} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: statusConfig[status as keyof typeof statusConfig].ribbonColor }}
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {statusConfig[status as keyof typeof statusConfig].label}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                            </div>
                          )
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-64 text-gray-500">
                      <div className="text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No milestones yet</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Upcoming Milestones & Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Next milestones to focus on</p>
                  </div>
                  <Link to="/plans">
                    <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                      View all
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.upcomingMilestones && dashboardStats.upcomingMilestones.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardStats.upcomingMilestones.slice(0, 5).map((milestone) => (
                        <div
                          key={milestone.id}
                          onClick={() => navigate(`/plans/${milestone.taskId}`)}
                          className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {milestone.title}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
                                {milestone.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3.5 w-3.5" />
                                  {formatDate(milestone.deadline)}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={statusConfig[milestone.status as keyof typeof statusConfig].color}
                                  size="sm"
                                >
                                  {statusConfig[milestone.status as keyof typeof statusConfig].label}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="font-medium mb-2">No upcoming milestones</p>
                      <p className="text-sm">Create a plan to get started</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleOpenModal}
                        className="mt-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <div>
                    <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Latest updates on your plans</p>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-pulse text-gray-500">Loading activities...</div>
                    </div>
                  ) : (
                    <div className="max-h-[400px] overflow-y-auto pr-2 space-y-3">
                      <ActivityFeed activities={activities} />
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-800 border-0">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardStats?.totalPlans || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Plans</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardStats?.totalMilestones || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Milestones</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardStats?.completedMilestones || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {dashboardStats?.dueToday || 0}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Due Today</p>
                  </div>
                </div>
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

        {/* Plan Creation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Create New Plan"
        >
          <PlanForm onClose={handleCloseModal} />
        </Modal>
      </MainLayout>
    </>
  );
};

export default DashboardPage;
