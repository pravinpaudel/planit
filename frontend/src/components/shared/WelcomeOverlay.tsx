import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { CheckCircle } from 'lucide-react';
import { useAppDispatch } from '../../hooks/reduxHooks';
import { addNotification } from '../../store/uiSlice';

interface WelcomeProps {
  userName: string;
  onComplete: () => void;
}

const WELCOME_STEPS = [
  {
    title: 'Welcome to PlanIt!',
    description: 'Your personal productivity planner that helps you stay organized and achieve your goals.',
    icon: '👋',
  },
  {
    title: 'Set Clear Goals',
    description: 'Break down your ambitious goals into manageable milestones and tasks.',
    icon: '🎯',
  },
  {
    title: 'Track Progress',
    description: 'Monitor your progress and celebrate achievements along the way.',
    icon: '📊',
  },
  {
    title: 'You\'re All Set!',
    description: 'Get started by exploring your dashboard and creating your first goal.',
    icon: '🚀',
  },
];

const WelcomeOverlay = ({ userName, onComplete }: WelcomeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const dispatch = useAppDispatch();
  const step = WELCOME_STEPS[currentStep];
  const isLastStep = currentStep === WELCOME_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
      dispatch(
        addNotification({
          type: 'success',
          title: 'Getting Started',
          message: 'Welcome to PlanIt! Start by creating your first goal.',
        })
      );
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-lg w-full mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl">
              {step.icon}
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {currentStep === 0 ? `${step.title} ${userName}` : step.title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
        </div>

        <div className="flex justify-between items-center mt-8">
          <div className="flex space-x-2">
            {WELCOME_STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full ${
                  i === currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep((prev) => prev - 1)}
              >
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {isLastStep ? 'Get Started' : 'Next'}
              <CheckCircle size={16} className="ml-2" />
            </Button>
          </div>
        </div>

        {currentStep === 0 && (
          <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-start">
            <CheckCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              PlanIt helps you organize your goals into achievable milestones and tasks, so you can 
              track your progress and celebrate your wins along the way.
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WelcomeOverlay;
