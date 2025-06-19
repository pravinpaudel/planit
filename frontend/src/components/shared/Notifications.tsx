import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { removeNotification } from '../../features/ui/uiSlice';
import { selectNotifications } from '../../features/ui/uiSelectors';
import { Toast, ToastContainer } from '../ui/Toast';

export const Notifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector(selectNotifications);

  // Auto-dismiss notifications after their duration
  useEffect(() => {
    if (!notifications.length) return;

    const timers = notifications.map((notification) => {
      if (!notification.duration || notification.duration <= 0) return undefined;
      
      return window.setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, notification.duration);
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [notifications, dispatch]);

  return (
    <ToastContainer position="bottom-right">
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          variant={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={() => dispatch(removeNotification(notification.id))}
          duration={0} // We're manually handling duration in the effect above
        />
      ))}
    </ToastContainer>
  );
};
