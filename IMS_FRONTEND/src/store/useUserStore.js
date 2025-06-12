import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '../services/API';

const useUserStore = create(
  devtools(
    (set, get) => ({
      // State
      users: [],
      currentUser: null,
      loading: false,
      error: null,
      
      // Pagination
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      },
      
      // Filters and Search
      filters: {
        search: '',
        status: '',
        role: '',
        createdFrom: '',
        createdTo: '',
        lastLoginFrom: '',
        lastLoginTo: '',
        locked: null
      },
      
      // Sorting
      sort: {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      },
      
      // Statistics
      stats: {
        total: 0,
        active: 0,
        locked: 0,
        byStatus: [],
        byRole: []
      },
      
      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Fetch all users with pagination and filters
      fetchUsers: async (params = {}) => {
        set({ loading: true, error: null });
        
        try {
          const queryParams = {
            ...get().filters,
            ...get().sort,
            page: get().pagination.page,
            limit: get().pagination.limit,
            ...params
          };
          
          // Remove empty values
          Object.keys(queryParams).forEach(key => {
            if (queryParams[key] === '' || queryParams[key] === null || queryParams[key] === undefined) {
              delete queryParams[key];
            }
          });
          
          const response = await API.get('/users/admin/users', { params: queryParams });
          
          if (response.success) {
            set({
              users: response.data || response.users || [],
              pagination: response.pagination || get().pagination,
              loading: false
            });
          } else {
            throw new Error(response.message || 'Failed to fetch users');
          }
        } catch (error) {
          console.error('Fetch users error:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch users',
            loading: false
          });
        }
      },
      
      // Fetch user by ID
      fetchUserById: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.get(`/users/admin/user/${id}`);
          
          if (response.success) {
            set({
              currentUser: response.user,
              loading: false
            });
            return response.user;
          } else {
            throw new Error(response.message || 'Failed to fetch user');
          }
        } catch (error) {
          console.error('Fetch user error:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch user',
            loading: false
          });
          return null;
        }
      },
      
      // Create new user
      createUser: async (userData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.post('/users/register', userData);
          
          if (response.success || response.user) {
            // Refresh users list
            await get().fetchUsers();
            
            set({ loading: false });
            return { success: true, user: response.user || response };
          } else {
            throw new Error(response.message || 'Failed to create user');
          }
        } catch (error) {
          console.error('Create user error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Update user
      updateUser: async (id, userData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.put(`/users/admin/user/${id}`, userData);
          
          if (response.success) {
            // Update user in the list
            const users = get().users.map(user => 
              user._id === id ? { ...user, ...response.user } : user
            );
            
            set({
              users,
              currentUser: response.user,
              loading: false
            });
            
            return { success: true, user: response.user };
          } else {
            throw new Error(response.message || 'Failed to update user');
          }
        } catch (error) {
          console.error('Update user error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update user';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Delete user
      deleteUser: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.delete(`/users/admin/user/${id}`);
          
          if (response.success) {
            // Remove user from the list
            const users = get().users.filter(user => user._id !== id);
            
            set({
              users,
              loading: false
            });
            
            return { success: true };
          } else {
            throw new Error(response.message || 'Failed to delete user');
          }
        } catch (error) {
          console.error('Delete user error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete user';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Update user status
      updateUserStatus: async (id, isActive) => {
        set({ loading: true, error: null });

        try {
          const response = await API.put(`/users/admin/user/${id}/status`, { isActive });

          if (response.success) {
            // Update user in the list
            const users = get().users.map(user =>
              user._id === id ? { ...user, isActive } : user
            );

            // Also update currentUser if it's the same user
            const currentUser = get().currentUser;
            const updatedCurrentUser = currentUser && currentUser._id === id
              ? { ...currentUser, isActive }
              : currentUser;

            set({
              users,
              currentUser: updatedCurrentUser,
              loading: false
            });

            return { success: true };
          } else {
            throw new Error(response.message || 'Failed to update user status');
          }
        } catch (error) {
          console.error('Update user status error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update user status';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Unlock user
      unlockUser: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.put(`/users/admin/user/${id}/unlock`);
          
          if (response.success) {
            // Update user in the list
            const users = get().users.map(user => 
              user._id === id ? { ...user, lockUntil: null, loginAttempts: 0 } : user
            );
            
            set({
              users,
              loading: false
            });
            
            return { success: true };
          } else {
            throw new Error(response.message || 'Failed to unlock user');
          }
        } catch (error) {
          console.error('Unlock user error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to unlock user';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Fetch user statistics
      fetchUserStats: async () => {
        try {
          const response = await API.get('/users/admin/stats');
          
          if (response.success) {
            set({
              stats: response.stats
            });
          }
        } catch (error) {
          console.error('Fetch user stats error:', error);
        }
      },
      
      // Update filters
      updateFilters: (newFilters) => {
        set({
          filters: { ...get().filters, ...newFilters },
          pagination: { ...get().pagination, page: 1 } // Reset to first page
        });
      },
      
      // Update sorting
      updateSort: (sortBy, sortOrder) => {
        set({
          sort: { sortBy, sortOrder },
          pagination: { ...get().pagination, page: 1 } // Reset to first page
        });
      },
      
      // Update pagination
      updatePagination: (page, limit) => {
        set({
          pagination: { ...get().pagination, page, limit }
        });
      },
      
      // Clear filters
      clearFilters: () => {
        set({
          filters: {
            search: '',
            status: '',
            role: '',
            createdFrom: '',
            createdTo: '',
            lastLoginFrom: '',
            lastLoginTo: '',
            locked: null
          },
          pagination: { ...get().pagination, page: 1 }
        });
      },
      
      // Reset store
      reset: () => {
        set({
          users: [],
          currentUser: null,
          loading: false,
          error: null,
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
          },
          filters: {
            search: '',
            status: '',
            role: '',
            createdFrom: '',
            createdTo: '',
            lastLoginFrom: '',
            lastLoginTo: '',
            locked: null
          },
          sort: {
            sortBy: 'createdAt',
            sortOrder: 'desc'
          }
        });
      }
    }),
    {
      name: 'user-store'
    }
  )
);

export default useUserStore;
