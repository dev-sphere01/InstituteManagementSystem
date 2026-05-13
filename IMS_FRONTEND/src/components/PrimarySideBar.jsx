import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebarStore } from '../store';
import { useAuth } from '../context/AuthContext';

const PrimarySideBar = () => {
  const { isPrimarySidebarOpen, isFooterVisible } = useSidebarStore();
  const { user, hasRole, hasPermission } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  const TAB_ROLE_MAP = {
    "Document Verification": ["Verifier"],
    "Registration": ["Admin"],
    "Exam Form": ["Admin"],
    "Admit Card": ["Admin"],
    "Certificate": ["Admin"]
  };
  const TABS = Object.keys(TAB_ROLE_MAP);

  const getVisibleWorkflowTabs = () => {
    const isAdmin = hasRole('Admin') || hasPermission('*') || user?.role?.RoleName?.toLowerCase()?.includes('admin');
    if (isAdmin) return TABS;
    const userRole = user?.role?.RoleName || "";
    return TABS.filter(tab => TAB_ROLE_MAP[tab].some(r => r.toLowerCase() === userRole.toLowerCase()));
  };

  const workflowNavItems = getVisibleWorkflowTabs().map(tab => ({
    path: `/dashboard/workflow/tasks/${tab.toLowerCase().replace(" ", "-")}`,
    icon: 'document',
    label: tab
  }));

  // Main navigation items (remove flat Enquiry)
  const mainNavItems = [
    { path: '/dashboard', icon: 'home', label: 'Dashboard' },
    { path: '/dashboard/admission', icon: 'document-add', label: 'Admission' },
    { path: '/dashboard/fee', icon: 'document-add', label: 'Fee' },
    { path: '/dashboard/workflow/templates', icon: 'collection', label: 'Workflow Templates' },
    { path: '/dashboard/student-details', icon: 'users', label: 'Student Details' },
    { path: '/dashboard/reports', icon: 'document', label: 'Reports' },
    { path: '/dashboard/settings', icon: 'settings', label: 'Settings' },

    // Removed Enquiry from here
  ];
  const callingNavItems = [
    // { path: '/dashboard/applications', icon: 'document', label: 'Applications' },
    { path: '/dashboard/calling-management', icon: 'document-add', label: 'Lead Management' },
    { path: '/dashboard/my-calls', icon: 'users', label: 'My Lead Queue' },
    // { path: '/dashboard/my-application-queue', icon: 'collection', label: 'My Application Queue' },
  ];
  // Masters navigation items
  const mastersNavItems = [
    { path: '/dashboard/users', icon: 'users', label: 'Users' },
    { path: '/dashboard/roles', icon: 'shield', label: 'Roles' },
    { path: '/dashboard/courses', icon: 'book', label: 'Courses' },
    { path: '/dashboard/calling-form-master', icon: 'document-add', label: 'Calling Form Master' },
    { path: '/dashboard/center-code', icon: 'collection', label: 'Center Code' },
    { path: '/dashboard/additional-features', icon: 'collection', label: 'Additional Features' },
    { path: '/dashboard/batches', icon: 'collection', label: 'Batches' },
    { path: '/dashboard/sessions', icon: 'calendar', label: 'Sessions' },
    { path: '/dashboard/institution-type', icon: 'collection', label: 'Institution Type' },
  ];

  // Enquiry navigation items
  const enquiryNavItems = [
    { path: '/dashboard/enquiry/create', icon: 'document-add', label: 'New' },
    { path: '/dashboard/enquiry/view', icon: 'document', label: 'All' },
  ];

  // Function to check if a path is active
  const isActive = (path) => {
    // Exact match for dashboard home
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // For other routes, check if the current path matches or is a sub-path
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  // Function to check if any masters route is active
  const isMastersActive = () => {
    return mastersNavItems.some(item => isActive(item.path));
  };

  // Function to check if any enquiry route is active
  const isEnquiryActive = () => {
    return enquiryNavItems.some(item => isActive(item.path));
  };

  const isCallingActive = () => {
    return callingNavItems.some(item => isActive(item.path));
  };

  const isWorkflowActive = () => {
    return workflowNavItems.some(item => isActive(item.path));
  };

  // Auto-expand correct menu if route is active
  React.useEffect(() => {
    if (isMastersActive()) {
      setOpenMenu('masters');
    } else if (isEnquiryActive()) {
      setOpenMenu('enquiry');
    } else if (isCallingActive()) {
      setOpenMenu('calling');
    } else if (isWorkflowActive()) {
      setOpenMenu('workflow');
    } else {
      setOpenMenu(null);
    }
  }, [location.pathname]);

  // Render icons based on name
  const renderIcon = (iconName) => {
    switch (iconName) {
      case 'home':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        );
      case 'chart':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      case 'document':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'document-add':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        );
      case 'users':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        );
      case 'settings':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      case 'shield':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'book':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'collection':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      case 'calendar':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'chevron':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        );
      case 'folder':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside
      className={`bg-gray-900 text-white transition-all text-sm duration-300 ease-in-out ${isPrimarySidebarOpen ? 'w-60' : 'w-0 md:w-16'} overflow-hidden h-full fixed md:static z-50 top-16 md:top-0 left-0 bottom-0`}
    >
      <div className="h-full flex flex-col">
        {/* Sidebar header */}
        {/* <div className="p-4 border-b border-gray-800">
          <h2 className={`font-bold text-xl ${isPrimarySidebarOpen ? 'block' : 'hidden md:block text-center'}`}>
            {isPrimarySidebarOpen ? 'Navigation' : ''}
          </h2>
        </div> */}

        {/* Navigation links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-2">
            {/* Main navigation items */}
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <span className="inline-flex">{renderIcon(item.icon)}</span>
                  <span className={`ml-3 ${isPrimarySidebarOpen ? 'block' : 'hidden'}`}>{item.label}</span>
                </Link>
              </li>
            ))}

            {/* Enquiry section */}
            {isPrimarySidebarOpen ? (
              <li>
                <button
                  onClick={() => setOpenMenu(openMenu === 'enquiry' ? null : 'enquiry')}
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${isEnquiryActive() ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex">{renderIcon('folder')}</span>
                    <span className="ml-3">Enquiry</span>
                  </div>
                  <span className={`transition-transform duration-200 ${openMenu === 'enquiry' ? 'rotate-180' : ''}`}>
                    {renderIcon('chevron')}
                  </span>
                </button>
                {/* Enquiry submenu for expanded sidebar */}
                {openMenu === 'enquiry' && (
                  <ul className="mt-2 space-y-1">
                    {enquiryNavItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center p-2 pl-8 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                          <span className="inline-flex">{renderIcon(item.icon)}</span>
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              /* Enquiry items as individual icons when sidebar is collapsed */
              enquiryNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <span className="inline-flex">{renderIcon(item.icon)}</span>
                    <span className="ml-3 hidden">{item.label}</span>
                  </Link>
                </li>
              ))
            )}

            {/* Masters section */}
            {isPrimarySidebarOpen ? (
              <li>
                <button
                  onClick={() => setOpenMenu(openMenu === 'masters' ? null : 'masters')}
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${isMastersActive() ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                >
                  <div className="flex items-center">
                    <span className="inline-flex">{renderIcon('folder')}</span>
                    <span className="ml-3">Masters</span>
                  </div>
                  <span className={`transition-transform duration-200 ${openMenu === 'masters' ? 'rotate-180' : ''}`}>
                    {renderIcon('chevron')}
                  </span>
                </button>

                {/* Masters submenu for expanded sidebar */}
                {openMenu === 'masters' && (
                  <ul className="mt-2 space-y-1">
                    {mastersNavItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center p-2 pl-8 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                          <span className="inline-flex">{renderIcon(item.icon)}</span>
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ) : (
              /* Masters items as individual icons when sidebar is collapsed */
              mastersNavItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center p-2 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    <span className="inline-flex">{renderIcon(item.icon)}</span>
                    <span className="ml-3 hidden">{item.label}</span>
                  </Link>
                </li>
              ))
            )}

            {/* Calling section - only show when sidebar is expanded */}
            {isPrimarySidebarOpen && (
              <li>
                <button
                  onClick={() => setOpenMenu(openMenu === 'calling' ? null : 'calling')}
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${callingNavItems.some(item => isActive(item.path)) ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                > 
                  <div className="flex items-center">
                    <span className="inline-flex">{renderIcon('folder')}</span>
                    <span className="ml-3">Calling</span>
                  </div>
                  <span className={`transition-transform duration-200 ${openMenu === 'calling' ? 'rotate-180' : ''}`}>
                    {renderIcon('chevron')}
                  </span>
                </button>

                {/* Calling submenu for expanded sidebar */}
                {openMenu === 'calling' && (
                  <ul className="mt-2 space-y-1">
                    {callingNavItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center p-2 pl-8 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                          <span className="inline-flex">{renderIcon(item.icon)}</span>
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}

            {/* Workflow section */}
            {isPrimarySidebarOpen && workflowNavItems.length > 0 && (
              <li>
                <button
                  onClick={() => setOpenMenu(openMenu === 'workflow' ? null : 'workflow')}
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${isWorkflowActive() ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}`}
                > 
                  <div className="flex items-center">
                    <span className="inline-flex">{renderIcon('folder')}</span>
                    <span className="ml-3">Workflow Tasks</span>
                  </div>
                  <span className={`transition-transform duration-200 ${openMenu === 'workflow' ? 'rotate-180' : ''}`}>
                    {renderIcon('chevron')}
                  </span>
                </button>

                {openMenu === 'workflow' && (
                  <ul className="mt-2 space-y-1">
                    {workflowNavItems.map((item) => (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          className={`flex items-center p-2 pl-8 rounded-md transition-colors ${isActive(item.path) ? 'bg-blue-500 text-white' : 'text-gray-400 hover:bg-gray-700'}`}
                        >
                          <span className="inline-flex">{renderIcon(item.icon)}</span>
                          <span className="ml-3">{item.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default PrimarySideBar;
