import { useAuth } from '@/context/AuthContext';
import { FaEye, FaPlus, FaEdit, FaTrash, FaCog } from 'react-icons/fa';

const actionStyles = {
  read: 'bg-blue-500 hover:bg-blue-600 text-white',
  create: 'bg-green-500 hover:bg-green-600 text-white',
  update: 'bg-yellow-500 hover:bg-yellow-600 text-white',
  delete: 'bg-red-500 hover:bg-red-600 text-white',
  manage: 'bg-purple-500 hover:bg-purple-600 text-white'
};

const defaultIcons = {
  read: FaEye,
  create: FaPlus,
  update: FaEdit,
  delete: FaTrash,
  manage: FaCog
};

const ActionButton = ({
  module = 'general',
  action = 'read',
  label,
  onClick,
  className = '',
  icon,
  disabled = false,
  size = 'md',
  style = {},
  title,
  children
}) => {
  const { hasPermission } = useAuth();

  const permissionKey = module === 'general' ? null : `${module}.${action}`;
  const isAllowed = module === 'general' ? true : hasPermission(permissionKey);

  if (!isAllowed) return null;

  const hasCustomContent = children !== undefined && children !== null;
  const hasText = Boolean(label) || (typeof children === 'string' && children.length > 0);

  const getSizeClasses = (textMode) => {
    if (textMode) {
      return {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
      };
    }
    return {
      sm: 'p-2 text-sm',
      md: 'p-3',
      lg: 'p-4 text-lg'
    };
  };

  const sizeClasses = getSizeClasses(hasText);
  const IconComponent = defaultIcons[action];
  const iconNode = icon || (IconComponent ? <IconComponent /> : null);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={style}
      title={title || label}
      className={`flex items-center justify-center rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${actionStyles[action] || 'bg-gray-500 hover:bg-gray-600 text-white'} ${className}`}
    >
      {hasCustomContent ? (
        children
      ) : (
        <>
          {iconNode ? <span className={label ? 'mr-2' : ''}>{iconNode}</span> : null}
          {label || null}
        </>
      )}
    </button>
  );
};

export default ActionButton;
