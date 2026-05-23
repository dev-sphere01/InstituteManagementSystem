import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * ErrorBanner Component
 * Displays an error message with optional retry button
 */
const ErrorBanner = ({ 
  error, 
  onRetry, 
  title = 'Error Loading Data',
  className = '' 
}) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 rounded-lg ${className}`}>
      <div className="flex items-center">
        <AlertCircle size={24} className="text-red-500 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-red-800 font-medium">{title}</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorBanner;
