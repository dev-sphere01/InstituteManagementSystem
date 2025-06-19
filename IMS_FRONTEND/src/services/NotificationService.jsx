import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

const icons = {
  success: (
    <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
  ),
  warning: (
    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01" /></svg>
  ),
  pending: (
    <svg className="w-5 h-5 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
  ),
};

const typeStyles = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error: 'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  info: 'bg-blue-50 border-blue-400 text-blue-800',
  pending: 'bg-gray-50 border-gray-300 text-gray-700',
};

let id = 0;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, type = 'info', options = {}) => {
    const toast = {
      id: ++id,
      message,
      type,
      ...options,
    };
    setNotifications((prev) => [...prev, toast]);
    if (!options.sticky) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== toast.id));
      }, options.duration || 3500);
    }
  }, []);

  const remove = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <NotificationService notifications={notifications} remove={remove} />
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);

const NotificationService = ({ notifications, remove }) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col space-y-3">
    {notifications.map((n) => (
      <div
        key={n.id}
        className={`w-80 max-w-full border-l-4 shadow-lg rounded-md px-4 py-3 flex items-start gap-3 animate-slide-in ${typeStyles[n.type]}`}
        style={{ animation: 'slide-in 0.3s' }}
      >
        <div className="mt-0.5">{icons[n.type]}</div>
        <div className="flex-1 text-sm font-medium">{n.message}</div>
        <button
          className="ml-2 text-lg text-gray-400 hover:text-gray-700 focus:outline-none"
          onClick={() => remove(n.id)}
          aria-label="Dismiss notification"
        >
          ×
        </button>
      </div>
    ))}
    <style>{`
      @keyframes slide-in {
        from { opacity: 0; transform: translateX(40px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `}</style>
  </div>
);

export default NotificationService;