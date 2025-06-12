import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import API from '../services/API';

const useRoleStore = create(
  devtools(
    (set, get) => ({
      // State
      roles: [],
      currentRole: null,
      loading: false,
      error: null,
      
      // Available permissions
      availablePermissions: [
        // User permissions
        'user.create', 'user.read', 'user.update', 'user.delete', 'user.export', 'user.import',
        // Role permissions
        'role.create', 'role.read', 'role.update', 'role.delete', 'role.export',
        // Admin permissions
        'admin.create', 'admin.read', 'admin.update', 'admin.delete',
        // Dashboard permissions
        'dashboard.read',
        // Settings permissions
        'settings.read', 'settings.update',
        // Reports permissions
        'reports.create', 'reports.read', 'reports.export',
        // Log permissions
        'log.read', 'log.delete', 'log.export',
        // Profile permissions
        'profile.read', 'profile.update'
      ],
      
      // Permission modules for organization
      permissionModules: {
        user: ['create', 'read', 'update', 'delete', 'export', 'import'],
        role: ['create', 'read', 'update', 'delete', 'export'],
        admin: ['create', 'read', 'update', 'delete'],
        dashboard: ['read'],
        settings: ['read', 'update'],
        reports: ['create', 'read', 'export'],
        log: ['read', 'delete', 'export'],
        profile: ['read', 'update']
      },
      
      // Actions
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),
      
      // Fetch all roles
      fetchRoles: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.get('/roles');
          
          if (response.success) {
            set({
              roles: response.data || response.roles || [],
              loading: false
            });
          } else {
            throw new Error(response.message || 'Failed to fetch roles');
          }
        } catch (error) {
          console.error('Fetch roles error:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch roles',
            loading: false
          });
        }
      },
      
      // Fetch role by ID
      fetchRoleById: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.get(`/roles/${id}`);
          
          if (response.success) {
            set({
              currentRole: response.role,
              loading: false
            });
            return response.role;
          } else {
            throw new Error(response.message || 'Failed to fetch role');
          }
        } catch (error) {
          console.error('Fetch role error:', error);
          set({
            error: error.response?.data?.message || error.message || 'Failed to fetch role',
            loading: false
          });
          return null;
        }
      },
      
      // Create new role
      createRole: async (roleData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.post('/roles', roleData);
          
          if (response.success) {
            // Add new role to the list
            const roles = [...get().roles, response.role];
            
            set({
              roles,
              loading: false
            });
            
            return { success: true, role: response.role };
          } else {
            throw new Error(response.message || 'Failed to create role');
          }
        } catch (error) {
          console.error('Create role error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to create role';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Update role
      updateRole: async (id, roleData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.put(`/roles/${id}`, roleData);
          
          if (response.success) {
            // Update role in the list
            const roles = get().roles.map(role => 
              role._id === id ? { ...role, ...response.role } : role
            );
            
            set({
              roles,
              currentRole: response.role,
              loading: false
            });
            
            return { success: true, role: response.role };
          } else {
            throw new Error(response.message || 'Failed to update role');
          }
        } catch (error) {
          console.error('Update role error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to update role';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Delete role
      deleteRole: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await API.delete(`/roles/${id}`);
          
          if (response.success) {
            // Remove role from the list
            const roles = get().roles.filter(role => role._id !== id);
            
            set({
              roles,
              loading: false
            });
            
            return { success: true };
          } else {
            throw new Error(response.message || 'Failed to delete role');
          }
        } catch (error) {
          console.error('Delete role error:', error);
          const errorMessage = error.response?.data?.message || error.message || 'Failed to delete role';
          set({
            error: errorMessage,
            loading: false
          });
          return { success: false, error: errorMessage };
        }
      },
      
      // Get permissions by module
      getPermissionsByModule: (module) => {
        const actions = get().permissionModules[module] || [];
        return actions.map(action => `${module}.${action}`);
      },
      
      // Get all permissions grouped by module
      getGroupedPermissions: () => {
        const modules = get().permissionModules;
        const grouped = {};
        
        Object.keys(modules).forEach(module => {
          grouped[module] = modules[module].map(action => ({
            name: `${module}.${action}`,
            label: `${action.charAt(0).toUpperCase() + action.slice(1)} ${module.charAt(0).toUpperCase() + module.slice(1)}`
          }));
        });
        
        return grouped;
      },
      
      // Check if role has permission
      roleHasPermission: (role, permission) => {
        if (!role || !role.permissions) return false;
        return role.permissions.includes(permission);
      },
      
      // Get role by name
      getRoleByName: (roleName) => {
        return get().roles.find(role => 
          role.RoleName.toLowerCase() === roleName.toLowerCase()
        );
      },
      
      // Get roles for dropdown
      getRolesForDropdown: () => {
        return get().roles.map(role => ({
          value: role._id,
          label: role.RoleName,
          description: role.description,
          level: role.level
        }));
      },
      
      // Reset store
      reset: () => {
        set({
          roles: [],
          currentRole: null,
          loading: false,
          error: null
        });
      }
    }),
    {
      name: 'role-store'
    }
  )
);

export default useRoleStore;
