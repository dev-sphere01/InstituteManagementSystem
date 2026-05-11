import React, { useState } from 'react';
import AttendanceDailyRule from './components/AttendanceDailyRule';
import AttendanceMonthlyRule from './components/AttendanceMonthlyRule';
import { Calendar, Clock } from 'lucide-react';

const AttendanceSettings = () => {
    const [activeTab, setActiveTab] = useState('daily');

    const tabs = [
        { id: 'daily', label: 'Daily Rules', icon: <Clock size={18} /> },
        { id: 'monthly', label: 'Monthly Rounding', icon: <Calendar size={18} /> }
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Attendance Configuration</h1>
                <p className="text-gray-600 mt-1">Manage working hour rewards and payroll rounding rules</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors relative ${
                            activeTab === tab.id
                                ? 'text-slate-900'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900" />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {activeTab === 'daily' && <AttendanceDailyRule />}
                {activeTab === 'monthly' && <AttendanceMonthlyRule />}
            </div>
        </div>
    );
};

export default AttendanceSettings;
