import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, AlertCircle } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Services
import LeavesService from '@/services/Leaves/leavesService';
import HolidaysService from '@/services/Leaves/holidaysService';
import useAuthStore from '@/store/authStore';
import { notification } from '@/services';

// Moment setup for calendar
const localizer = momentLocalizer(moment);

// Color configuration for leave types
const LEAVE_TYPE_COLORS = {
  'Sick': '#dc2626',           // Red
  'Earned': '#3b82f6',           // Blue
  'On-Duty': '#10b981',        // Green
  'Unpaid': '#6b7280',           // Gray
  'Holiday': '#ec4899',        // Pink
};

const LeaveCalender = () => {
  const { user } = useAuthStore();
  const notify = notification();

  // State management
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [empId, setEmpId] = useState(null);
  const [showSubordinateLeaves, setShowSubordinateLeaves] = useState(false);
  const [viewType] = useState('month');

  // Get current month and year
  const currentMonth = currentDate.getMonth();
  const currentYearFromDate = currentDate.getFullYear();
  const monthName = moment(currentDate).format('MMMM');

  // Fetch holidays for a specific year
  const fetchHolidaysForYear = useCallback(async (year) => {
    try {
      const holidaysData = await HolidaysService.getHolidaysByYear(year);
      if (Array.isArray(holidaysData)) {
        const holidayEvents = holidaysData.map((holiday) => {
          const holidayDate = new Date(holiday.Date);
          return {
            id: `holiday-${holiday.HID}`,
            title: `🏠 ${holiday.HolidayName}`,
            start: holidayDate,
            end: holidayDate,
            resource: {
              type: 'holiday',
              name: holiday.HolidayName,
              date: holiday.Date,
            },
          };
        });
        return holidayEvents;
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    }
    return [];
  }, []);

  // Fetch leaves data
  const fetchLeaves = useCallback(async () => {
    try {
      setLoading(true);
      const currentEmpId = user?.empId || user?.EmpID;
      setEmpId(currentEmpId);

      let leavesData = [];
      
      // If showing subordinate leaves, fetch those; otherwise fetch personal leaves
      if (showSubordinateLeaves) {
        leavesData = await LeavesService.getLeavesOfSubordinates(currentEmpId);
      } else {
        leavesData = await LeavesService.getLeaves(currentEmpId);
      }

      if (Array.isArray(leavesData)) {
        // Debug: Log the first item to see actual structure
        if (leavesData.length > 0) {
          console.log('Subordinate leave data structure:', leavesData[0]);
        }
        
        // Transform leave data to calendar events
        const leaveEvents = leavesData.map((leave) => {
          const startDate = new Date(leave.StartDate);
          const endDate = new Date(leave.EndDate);
          const status = leave.IsApproved === true ? 'Approved' : leave.IsApproved === false ? 'Rejected' : 'Pending';
          
          // Handle different possible field names for employee name
          let employeeName = leave.EmployeeName 
            || leave.Employee_Name 
            || leave.empName 
            || leave.EmployeeFName
            || leave.firstName
            || leave.FirstName
            || `Employee #${leave.EmpID}` 
            || 'Unknown';

          return {
            id: `leave-${leave.LeaveID}`,
            title: `${employeeName} - ${leave.LeaveType}`,
            start: startDate,
            end: endDate,
            resource: {
              type: 'leave',
              leaveId: leave.LeaveID,
              leaveType: leave.LeaveType,
              reason: leave.LeaveReason,
              status: status,
              employeeName: employeeName,
              empId: leave.EmpID,
              approvedBy: leave.ApproverName,
            },
          };
        });

        setEvents(leaveEvents);
      }
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
      notify.error('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  }, [user?.empId, user?.EmpID, showSubordinateLeaves]);

  // Fetch holidays when year changes
  useEffect(() => {
    const fetchAllHolidays = async () => {
      const holidayEvents = await fetchHolidaysForYear(selectedYear);
      setHolidays(holidayEvents);
    };
    if (empId !== null || user?.empId || user?.EmpID) {
      fetchAllHolidays();
    }
  }, [selectedYear, fetchHolidaysForYear, empId, user?.empId, user?.EmpID]);

  // Fetch leaves on component mount and when dependencies change
  useEffect(() => {
    if (user?.empId || user?.EmpID) {
      fetchLeaves();
    }
  }, [user?.empId, user?.EmpID, showSubordinateLeaves, fetchLeaves]);

  // Combine leaves and holidays for calendar display
  const calendarEvents = useMemo(() => {
    return [...events, ...holidays];
  }, [events, holidays]);

  // Style events based on type and status
  const eventStyleGetter = (event) => {
    const resource = event.resource;
    let backgroundColor = '#6b7280';
    let borderColor = '#4b5563';

    if (resource.type === 'holiday') {
      backgroundColor = LEAVE_TYPE_COLORS.Holiday;
      borderColor = '#be185d';
    } else if (resource.type === 'leave') {
      backgroundColor = LEAVE_TYPE_COLORS[resource.leaveType] || '#6b7280';
      borderColor = backgroundColor;

      // Adjust opacity based on status
      if (resource.status === 'Pending') {
        backgroundColor = backgroundColor + '80'; // 50% opacity
      } else if (resource.status === 'Rejected') {
        backgroundColor = '#9ca3af'; // Gray for rejected
      }
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        borderRadius: '8px',
        opacity: resource.status === 'Rejected' ? 0.6 : 1,
        color: 'white',
        border: `2px solid ${borderColor}`,
        display: 'block',
        fontWeight: 500,
        fontSize: '0.85rem',
      },
    };
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
    if (newDate.getFullYear() !== selectedYear) {
      setSelectedYear(newDate.getFullYear());
    }
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
    if (newDate.getFullYear() !== selectedYear) {
      setSelectedYear(newDate.getFullYear());
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedYear(today.getFullYear());
  };

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    setSelectedYear(year);
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  // Statistics
  const stats = useMemo(() => {
    return {
      total: events.filter(e => e.resource.type === 'leave').length,
      approved: events.filter(e => e.resource.type === 'leave' && e.resource.status === 'Approved').length,
      pending: events.filter(e => e.resource.type === 'leave' && e.resource.status === 'Pending').length,
      rejected: events.filter(e => e.resource.type === 'leave' && e.resource.status === 'Rejected').length,
      holidays: holidays.length,
    };
  }, [events, holidays]);

  if (loading && events.length === 0 && holidays.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Year options for select dropdown
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="bg-gray-50 min-h-screen p-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto max-w-full overflow-x-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <CalendarIcon className="h-8 w-8 text-blue-600" />
            Leave Calendar
          </h1>
          <p className="text-gray-600">
            {showSubordinateLeaves ? 'Track your team members\' leave requests' : 'Track your leave requests and company holidays'}
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-200 overflow-x-auto"
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-between min-w-min">
            {/* Month/Year Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="min-w-48 text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {monthName} {currentYearFromDate}
                </h2>
              </div>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next month"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
              <button
                onClick={handleToday}
                className="px-3 py-2 text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Today
              </button>
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Year:</label>
              <select
                value={selectedYear}
                onChange={handleYearChange}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {yearOptions.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Subordinates Toggle (for managers/admins) */}
            <button
              onClick={() => setShowSubordinateLeaves(!showSubordinateLeaves)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                showSubordinateLeaves
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Toggle between personal and team leaves"
            >
              <Users className="h-4 w-4" />
              {showSubordinateLeaves ? 'Team Leaves' : 'My Leaves'}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 overflow-x-hidden">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <style>{`
                .rbc-calendar {
                  font-family: inherit;
                }
                .rbc-header {
                  padding: 8px 2px;
                  font-weight: 600;
                  font-size: 0.75rem;
                  color: #1f2937;
                  background-color: #f3f4f6;
                  border-color: #e5e7eb;
                  text-align: center;
                }
                .rbc-today {
                  background-color: #fef3c7;
                }
                .rbc-off-range-bg {
                  background-color: #fafafa;
                }
                .rbc-date-cell {
                  padding: 2px;
                  height: 100%;
                }
                .rbc-day-bg {
                  border-color: #e5e7eb;
                  height: 100%;
                }
                .rbc-month-row {
                  border-color: #e5e7eb;
                  height: 80px;
                }
                .rbc-month-view {
                  border-color: #e5e7eb;
                  height: 100%;
                }
                .rbc-month-header {
                  height: 40px;
                }
                .rbc-date-cell > a,
                .rbc-date-cell > span {
                  color: #1f2937;
                  font-weight: 500;
                  font-size: 0.75rem;
                }
                .rbc-event {
                  padding: 2px 4px;
                  margin: 1px 0;
                  cursor: pointer;
                  transition: all 0.2s;
                  font-size: 0.65rem;
                }
                .rbc-event:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .rbc-event-label {
                  font-size: 0.65rem;
                  display: none;
                }
                .rbc-event-content {
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  font-size: 0.65rem;
                }
                .rbc-toolbar {
                  display: none;
                }
              `}</style>
              <Calendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 500 }}
                onSelectEvent={handleSelectEvent}
                selectable
                popup
                eventPropGetter={eventStyleGetter}
                view="month"
                views={['month']}
                date={currentDate}
                onNavigate={(date) => {
                  setCurrentDate(date);
                  if (date.getFullYear() !== selectedYear) {
                    setSelectedYear(date.getFullYear());
                  }
                }}
              />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Legend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Legend</h2>
              <div className="space-y-3">
                {Object.entries(LEAVE_TYPE_COLORS).map(([type, color]) => (
                  <div key={type} className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="text-sm text-gray-700">{type}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Event Details */}
            {selectedEvent && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Details</h2>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {selectedEvent.resource.type === 'leave' ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Type:</span>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium`}
                          style={{
                            backgroundColor: LEAVE_TYPE_COLORS[selectedEvent.resource.leaveType],
                            color: 'white'
                          }}>
                          {selectedEvent.resource.leaveType}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Status:</span>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          selectedEvent.resource.status === 'Approved' ? 'bg-green-100 text-green-800' :
                          selectedEvent.resource.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {selectedEvent.resource.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Employee:</span>
                      <div className="text-gray-800 font-medium mt-1">
                        {selectedEvent.resource.employeeName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Duration:</span>
                      <div className="text-gray-800 mt-1">
                        <div>{moment(selectedEvent.start).format('MMM DD, YYYY')} -{' '}</div>
                        <div>{moment(selectedEvent.end).format('MMM DD, YYYY')}</div>
                      </div>
                    </div>
                    {selectedEvent.resource.reason && (
                      <div>
                        <span className="text-gray-600 font-medium">Reason:</span>
                        <p className="text-gray-800 mt-1 break-words text-xs">
                          {selectedEvent.resource.reason}
                        </p>
                      </div>
                    )}
                    {selectedEvent.resource.approvedBy && (
                      <div>
                        <span className="text-gray-600 font-medium">Approved by:</span>
                        <div className="text-gray-800 font-medium mt-1">
                          {selectedEvent.resource.approvedBy}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-gray-600 font-medium">Holiday:</span>
                      <div className="text-gray-800 font-medium mt-1">
                        {selectedEvent.resource.name}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 font-medium">Date:</span>
                      <div className="text-gray-800 font-medium mt-1">
                        {moment(selectedEvent.start).format('dddd, MMMM DD, YYYY')}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Summary Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-lg shadow-lg p-6 border border-gray-200"
            >
              <h2 className="text-lg font-bold text-gray-800 mb-4">Summary</h2>
              <div className="space-y-3">
                {/* Total Leaves */}
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Total Leaves:</span>
                  <span className="font-bold text-blue-600 text-lg">{stats.total}</span>
                </div>

                {/* Approved */}
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Approved:</span>
                  <span className="font-bold text-green-600 text-lg">{stats.approved}</span>
                </div>

                {/* Pending */}
                <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Pending:</span>
                  <span className="font-bold text-yellow-600 text-lg">{stats.pending}</span>
                </div>

                {/* Rejected */}
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Rejected:</span>
                  <span className="font-bold text-red-600 text-lg">{stats.rejected}</span>
                </div>

                <hr className="my-3" />

                {/* Holidays */}
                <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                  <span className="text-gray-700 font-medium">Holidays:</span>
                  <span className="font-bold text-pink-600 text-lg">{stats.holidays}</span>
                </div>
              </div>
            </motion.div>

            {/* Info Box */}
            {showSubordinateLeaves && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-50 border border-blue-200 rounded-lg p-4"
              >
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800">
                      You're viewing leave requests from your team members. Switch to "My Leaves" to see your personal requests.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaveCalender;