import { motion, AnimatePresence } from 'framer-motion';
import { XCircle, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { removeNotification } from '../../store/uiSlice';
import { useEffect } from 'react';

const NotificationIcon = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertCircle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

export const Notifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  const handleClose = (id: string) => {
    dispatch(removeNotification(id));
  };

  // Auto-dismiss notifications after their duration
  useEffect(() => {
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [notifications, dispatch]);

  return (
    <div className="fixed inset-0 flex flex-col items-end pointer-events-none p-4 space-y-4 z-50">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            className="bg-white rounded-lg shadow-lg p-4 max-w-md pointer-events-auto border border-gray-200 dark:bg-gray-800 dark:border-gray-700"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {NotificationIcon[notification.type]}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-gray-900 dark:text-gray-100">{notification.message}</p>
              </div>
              <button
                className="ml-4 inline-flex text-gray-400 focus:outline-none hover:text-gray-500"
                onClick={() => handleClose(notification.id)}
              >
                <span className="sr-only">Close</span>
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
