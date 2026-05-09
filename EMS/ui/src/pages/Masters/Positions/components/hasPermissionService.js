// services/hasPermissionService.js
import useAuthStore from '@/store/authStore';
import { decryptData } from '@/utils/encryptionUtils';

// Get permissions from auth store
const getPermissions = () => {
    // First try to get from auth store state
    const storePermissions = useAuthStore.getState().userPermissions;

    if (storePermissions && storePermissions.length > 0) {
        return storePermissions;
    }

    // Fallback: try to get from encrypted localStorage
    try {
        const encryptedPermissions = localStorage.getItem('user-permissions');
        if (encryptedPermissions) {
            const decryptedPermissions = decryptData(encryptedPermissions);
            console.log('Decrypted permissions:', decryptedPermissions);
            return decryptedPermissions || [];
        }
    } catch (error) {
        console.error('Error decrypting permissions:', error);
    }

    return [];
};
const impliedReadActions = ["create", "update", "delete"]; // any of these → implies read

export function hasPermission(requiredPermission) {
    if (!requiredPermission) return true; // no check means allow

    const permissions = getPermissions();

    if (!permissions || permissions.length === 0) return false; // no permissions loaded

    // direct match
    if (permissions.includes(requiredPermission)) return true;

    const parts = requiredPermission.split("."); // e.g., "employees.read"
    const resource = parts[0];
    const action = parts[1];

    // parent-level check
    for (let i = 1; i <= parts.length; i++) {
        const parentKey = parts.slice(0, i).join(".");
        if (permissions.includes(parentKey)) return true;
    }

    // implied read logic
    if (action === "read") {
        for (const implied of impliedReadActions) {
            if (permissions.includes(`${resource}.${implied}`)) return true;
        }
    }

    return false;
}