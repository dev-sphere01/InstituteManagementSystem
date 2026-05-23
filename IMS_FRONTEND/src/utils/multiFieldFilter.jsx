/**
 * Multi-Field Filter Configuration
 * Maps column IDs to their searchable fields for backend filtering
 */

export const MULTI_FIELD_FILTERS = {
  // Applications (removed dateOfBirth as it's a Date field)
  applicantDetails: ['fullName', 'panNumber'],
  contactInfo: ['mobileNumber', 'location', 'aadhaarNumber'],
  
  // Leads
  leadDetails: ['name', 'contactNo', 'email'],
  
  // Users
  userDetails: ['firstName', 'lastName', 'email', 'username'],
  
  // Add more as needed
};

/**
 * Check if a column uses multi-field filtering
 */
export const isMultiFieldColumn = (columnId) => {
  return Object.keys(MULTI_FIELD_FILTERS).includes(columnId);
};

/**
 * Get searchable fields for a column
 */
export const getSearchableFields = (columnId) => {
  return MULTI_FIELD_FILTERS[columnId] || [];
};

/**
 * Create a multi-field filter component for TableService
 */
export const createMultiFieldFilter = (columnId, placeholder = 'Filter...') => {
  return ({ value, onChange }) => (
    <input
      type="text"
      value={value || ''}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-2 py-1 pr-6 rounded border border-slate-300 bg-white w-full text-xs"
      title={`Search across: ${getSearchableFields(columnId).join(', ')}`}
    />
  );
};
