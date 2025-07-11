import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../store';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "YES",
  cancelText = "NO",
  confirmButtonColor = "red", // red, blue, green, yellow
  icon = "❓",
  loading = false
}) => {
  const { isDarkMode } = useThemeStore();

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8, 
      y: -50 
    },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8, 
      y: -50,
      transition: {
        duration: 0.2
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    }
  };

  const getConfirmButtonStyles = (color) => {
    const styles = {
      red: `bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-red-500/25`,
      blue: `bg-blue-500 hover:bg-blue-600 text-white shadow-lg hover:shadow-blue-500/25`,
      green: `bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/25`,
      yellow: `bg-yellow-500 hover:bg-yellow-600 text-white shadow-lg hover:shadow-yellow-500/25`
    };
    return styles[color] || styles.red;
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (!loading) {
      onClose();
    }
  };

  // Prevent closing when clicking outside during loading
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          onClick={handleOverlayClick}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          {/* Modal */}
          <motion.div
            className={`relative w-full max-w-md mx-auto rounded-2xl shadow-2xl ${
              isDarkMode 
                ? 'bg-gray-800 border border-gray-700' 
                : 'bg-white border border-gray-200'
            }`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <motion.div
                  className="text-2xl"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                >
                  {icon}
                </motion.div>
                <h3 className={`text-lg font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {title}
                </h3>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-6">
              <motion.p
                className={`text-base leading-relaxed ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {message}
              </motion.p>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end gap-3">
                {/* Cancel Button */}
                <motion.button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                  variants={buttonVariants}
                  whileHover={!loading ? "hover" : {}}
                  whileTap={!loading ? "tap" : {}}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {cancelText}
                </motion.button>

                {/* Confirm Button */}
                <motion.button
                  type="button"
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${getConfirmButtonStyles(confirmButtonColor)} disabled:opacity-50 disabled:cursor-not-allowed`}
                  variants={buttonVariants}
                  whileHover={!loading ? "hover" : {}}
                  whileTap={!loading ? "tap" : {}}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    confirmText
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;