// store/authStore.js
import { create } from 'zustand';
import { isTokenExpired } from '@/services/authService';
import PositionService from '@/services/Positions/positions';
import { encryptData, decryptData } from '@/utils/encryptionUtils';

// Token check interval (check every 30 seconds)
const TOKEN_CHECK_INTERVAL = 30 * 1000;
let tokenCheckInterval = null;

const useAuthStore = create((set, get) => ({
  isAuthenticated: false,
  user: null,
  userPermissions: [], // Store user permissions
  isLoading: true, // Start with loading true
  isInitialized: false, // Track if auth has been initialized

  // Initialize auth state from localStorage
  initializeAuth: () => {
    set({ isLoading: true });

    const storedUser = localStorage.getItem('user');
    // console.log(storedUser)
    const token = localStorage.getItem('authToken');

    if (storedUser && token) {
      try {
        const user = JSON.parse(storedUser);

        // Check if token is expired
        if (user.exp && !isTokenExpired(user.exp)) {
          // Load permissions from encrypted storage
          const encryptedPermissions = localStorage.getItem('user-permissions');
          const permissions = encryptedPermissions ? decryptData(encryptedPermissions) : [];
          
          set({ isAuthenticated: true, user, userPermissions: permissions || [], isLoading: false, isInitialized: true });
          // Start token monitoring for existing session
          get().startTokenMonitoring();
        } else {
          // Token expired, clear storage
          localStorage.removeItem('user');
          localStorage.removeItem('authToken');
          localStorage.removeItem('emp-data-storage');
          localStorage.removeItem('user-permissions');
          set({ isAuthenticated: false, user: null, userPermissions: [], isLoading: false, isInitialized: true });
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('emp-data-storage');
        localStorage.removeItem('user-permissions');
        set({ isAuthenticated: false, user: null, userPermissions: [], isLoading: false, isInitialized: true });
      }
    } else {
      // No stored auth data
      set({ isAuthenticated: false, user: null, userPermissions: [], isLoading: false, isInitialized: true });
    }
  },

  // Start token monitoring
  startTokenMonitoring: () => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
    }

    tokenCheckInterval = setInterval(() => {
      const { user, isAuthenticated } = get();
      
      if (isAuthenticated && user?.exp) {
        // Check if token will expire in the next 5 minutes
        const timeUntilExpiry = (user.exp * 1000) - Date.now();
        const fiveMinutes = 5 * 60 * 1000;
        
        if (timeUntilExpiry <= 0) {
          // Token has expired
          console.warn('Token expired - logging out');
          
          // Use centralized logout utility
          import('../utils/logoutUtils').then(({ handleTokenExpiration }) => {
            handleTokenExpiration();
          });
        } else if (timeUntilExpiry <= fiveMinutes) {
          // Token will expire soon - show warning
          console.warn(`Token will expire in ${Math.round(timeUntilExpiry / 1000 / 60)} minutes`);
          
          // Import notification service dynamically
          import('@/services/NotificationService').then(({ default: notification }) => {
            notification().warning('Your session will expire soon. Please save your work.');
          });
        }
      }
    }, TOKEN_CHECK_INTERVAL);
  },

  // Stop token monitoring
  stopTokenMonitoring: () => {
    if (tokenCheckInterval) {
      clearInterval(tokenCheckInterval);
      tokenCheckInterval = null;
    }
  },

  login: async (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    set({ isAuthenticated: true, user: userData });
    
    // Load user permissions
    await get().loadUserPermissions(userData.empId || userData.id);
    
    // Start monitoring token expiration
    get().startTokenMonitoring();
  },

  logout: () => {
    // Stop token monitoring
    get().stopTokenMonitoring();
    
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('emp-data-storage');
    localStorage.removeItem('user-permissions'); // Clear encrypted permissions
    set({ isAuthenticated: false, user: null, userPermissions: [] });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  // Update user data (useful after password change)
  updateUser: (updatedData) => {
    const currentUser = get().user;
    if (currentUser) {
      const newUser = { ...currentUser, ...updatedData };
      console.log('Updating user data:', { currentUser, updatedData, newUser });
      localStorage.setItem('user', JSON.stringify(newUser));
      set({ user: newUser });
    }
  },

  // Check if user needs to change password
  needsPasswordChange: () => {
    const user = get().user;
    const needsChange = user?.isAutoGenPass === true;
    // console.log('needsPasswordChange check:', { user, isAutoGenPass: user?.isAutoGenPass, needsChange });
    return needsChange;
  },

  // Get user role for layout determination
  getUserRole: () => {
    const user = get().user;
    return user?.roleId || null;
    // return 1;
  },

  // Load user permissions from API
  loadUserPermissions: async (empId) => {
    if (!empId) return;
    
    try {
      const positionData = await PositionService.getPositionByEmpId(empId);
      const permissions = positionData?.Permissions || [];
      
      // Store in state
      set({ userPermissions: permissions });
      
      // Store encrypted in localStorage
      const encrypted = encryptData(permissions);
      if (encrypted) {
        localStorage.setItem('user-permissions', encrypted);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      set({ userPermissions: [] });
    }
  },

  // Get user permissions
  getUserPermissions: () => {
    return get().userPermissions;
  },
}));

export default useAuthStore;
