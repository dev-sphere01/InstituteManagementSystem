import { useNavigate, useLocation } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import useCallingStore from '@/store/callingStore';
import { useEffect, useState } from 'react';

const CallStatusIndicator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isCallSessionActive, callingRoute, currentLead } = useCallingStore();
  const [callDuration, setCallDuration] = useState(0);

  // Calculate call duration
  useEffect(() => {
    if (!isCallSessionActive) {
      setCallDuration(0);
      return;
    }

    const interval = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallSessionActive]);

  // Format duration as MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't show if no active call or already on the calling page
  if (!isCallSessionActive || !callingRoute) {
    return null;
  }

  // Check if we're already on the calling page
  const isOnCallingPage = location.pathname + location.search === callingRoute;

  // Don't show indicator if already on the calling page
  if (isOnCallingPage) {
    return null;
  }

  const handleNavigateToCall = () => {
    if (callingRoute) {
      navigate(callingRoute);
    }
  };

  return (
    <div 
      onClick={handleNavigateToCall}
      className="flex items-center space-x-1.5 sm:space-x-2 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg cursor-pointer hover:from-green-600 hover:to-emerald-700 transition-all shadow-sm animate-pulse-subtle"
      title="Click to return to active call"
    >
      <div className="flex items-center space-x-1.5 sm:space-x-2">
        <div className="relative">
          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] sm:text-xs font-semibold leading-tight">Call Active</span>
          <span className="text-[9px] sm:text-[10px] opacity-90 leading-tight">{formatDuration(callDuration)}</span>
        </div>
      </div>
      <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 opacity-75 hidden sm:block" />
    </div>
  );
};

export default CallStatusIndicator;
