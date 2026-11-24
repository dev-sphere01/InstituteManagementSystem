import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const DatePicker = ({ name = 'dob', value, onChange, placeholder = 'Select date', error, className, isDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewDate, setViewDate] = useState(new Date());
  
  const containerRef = useRef(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Load initial value
  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewDate(d);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDayClick = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    setSelectedDate(newDate);
    setIsOpen(false);

    // Format as YYYY-MM-DD
    const yyyy = newDate.getFullYear();
    const mm = String(newDate.getMonth() + 1).padStart(2, '0');
    const dd = String(newDate.getDate()).padStart(2, '0');
    onChange({ target: { name: name || 'dob', value: `${yyyy}-${mm}-${dd}` } });
  };

  const changeMonth = (offset) => {
    setViewDate(prev => {
      const newDate = new Date(prev.getFullYear(), prev.getMonth() + offset, 1);
      return newDate;
    });
  };

  const handleMonthChange = (e) => {
    const m = parseInt(e.target.value, 10);
    setViewDate(prev => new Date(prev.getFullYear(), m, 1));
  };

  const handleYearChange = (e) => {
    const y = parseInt(e.target.value, 10);
    setViewDate(prev => new Date(y, prev.getMonth(), 1));
  };

  const yearOptions = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear; y >= currentYear - 100; y--) {
    yearOptions.push(y);
  }

  const renderDays = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    // Previous month padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-8 w-8" />);
    }

    // Days in current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === month &&
        selectedDate.getFullYear() === year;

      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === month &&
        new Date().getFullYear() === year;

      days.push(
        <button
          key={`day-${day}`}
          type="button"
          onClick={() => handleDayClick(day)}
          className={`h-8 w-8 rounded-full text-xs font-semibold flex items-center justify-center transition-all duration-150 ${
            isSelected
              ? 'bg-blue-600 text-white shadow-md'
              : isToday
              ? 'border border-blue-500 text-blue-500 font-bold'
              : isDarkMode
              ? 'text-gray-200 hover:bg-gray-700'
              : 'text-gray-800 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formattedDisplayDate = selectedDate
    ? `${String(selectedDate.getDate()).padStart(2, '0')}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${selectedDate.getFullYear()}`
    : '';

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          readOnly
          value={formattedDisplayDate}
          onClick={() => setIsOpen(prev => !prev)}
          placeholder={placeholder}
          className={`${className} cursor-pointer pr-10`}
        />
        <Calendar
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer transition-colors ${
            isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
          }`}
          onClick={() => setIsOpen(prev => !prev)}
        />
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 p-4 w-72 rounded-2xl shadow-xl border select-none transition-all duration-200 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-200 text-gray-800'
          }`}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Selects */}
            <div className="flex gap-1.5">
              <select
                value={viewDate.getMonth()}
                onChange={handleMonthChange}
                className={`text-xs font-semibold py-1 px-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent ${
                  isDarkMode ? 'border-gray-700 text-white [&>option]:bg-gray-800' : 'border-gray-200 text-gray-800'
                }`}
              >
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              <select
                value={viewDate.getFullYear()}
                onChange={handleYearChange}
                className={`text-xs font-semibold py-1 px-1.5 rounded-lg border focus:outline-none focus:ring-1 focus:ring-blue-500 bg-transparent ${
                  isDarkMode ? 'border-gray-700 text-white [&>option]:bg-gray-800' : 'border-gray-200 text-gray-800'
                }`}
              >
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => changeMonth(1)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDarkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200 hover:bg-gray-100'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] uppercase mb-2 text-gray-400">
            <div>Su</div>
            <div>Mo</div>
            <div>Tu</div>
            <div>We</div>
            <div>Th</div>
            <div>Fr</div>
            <div>Sa</div>
          </div>

          {/* Grid of days */}
          <div className="grid grid-cols-7 gap-1 justify-items-center">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
