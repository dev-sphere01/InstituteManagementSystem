import React from 'react'
import EnquiryTable from './components/EnquiryTable'
import EnquiryDetails from './components/EnquiryDetails';
import { useLocation } from 'react-router-dom';

const ViewEnquiry = () => {
  // Only render nested routes, not a new <Routes> tree
  const location = useLocation();
  // If the current path is exactly /enquiry/view, show the table
  // If the current path is /enquiry/view/details/:id, show the details
  // This avoids nested routers and works with parent route
  if (location.pathname.endsWith('/enquiry/view')) {
    return <EnquiryTable />;
  }
  if (location.pathname.includes('/enquiry/view/details/')) {
    return <EnquiryDetails />;
  }
  // fallback
  return null;
}

export default ViewEnquiry