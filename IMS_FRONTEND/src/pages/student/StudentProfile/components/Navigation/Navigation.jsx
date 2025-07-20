import React from 'react'

const Navigation = ({setActiveTab,tabs,activeTab}) => {
    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex items-center space-x-1.5 px-4 py-3 font-medium transition-all duration-200 border-b-2 whitespace-nowrap ${activeTab === tab.key
                                ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                                : "text-slate-600 border-transparent hover:text-slate-800 hover:bg-slate-50"
                                }`}
                        >
                            <span className="text-base">{tab.icon}</span>
                            <span className="text-sm">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Navigation