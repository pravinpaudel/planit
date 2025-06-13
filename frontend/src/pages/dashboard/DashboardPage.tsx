import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/reduxHooks';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { MainLayout } from '../../components/layout/MainLayout';
import { Navigation } from '../../components/layout/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle, Clock, Target, Plus } from 'lucide-react';
import WelcomeOverlay from '../../components/shared/WelcomeOverlay';
import { Button } from '../../components/ui/Button';
import type { AuthState } from '../../types';

const DashboardPage = () => {
  const auth = useAppSelector((state) => state.auth as AuthState);
  const user = auth.user;
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Check if this is the user's first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  const handleCompleteWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
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
      title: 'Active Goals',
      value: '0',
      icon: <Target className="h-8 w-8 text-blue-500" />,
      color: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      title: 'Completed Tasks',
      value: '0',
      icon: <CheckCircle className="h-8 w-8 text-green-500" />,
      color: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      title: 'Upcoming Milestones',
      value: '0',
      icon: <Calendar className="h-8 w-8 text-purple-500" />,
      color: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      title: 'Hours Tracked',
      value: '0',
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

          <motion.div 
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {statsItems.map((item, i) => (
              <motion.div key={i} variants={itemVariants}>
                <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
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
                </Card>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Goals & Milestones</CardTitle>
                <Link to="/plans">
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <Plus className="h-4 w-4" />
                    Manage Plans
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <p className="mb-4 font-medium">No upcoming goals or milestones yet</p>
                  <p className="text-sm">
                    Start by creating your first goal to track your progress
                  </p>
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
      </MainLayout>
    </>
  );
};

export default DashboardPage;
