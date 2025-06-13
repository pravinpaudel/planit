import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { MainLayout } from '../components/layout/MainLayout';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <MainLayout>
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <motion.div
          className="max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="mb-2 text-9xl font-bold text-gray-300">404</h1>
          <h2 className="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">
            Page Not Found
          </h2>
          <p className="mb-8 text-gray-500 dark:text-gray-400">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button onClick={() => window.history.back()}>
              <ArrowLeft size={16} className="mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button variant="outline">
                <Home size={16} className="mr-2" />
                Return Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default NotFoundPage;
