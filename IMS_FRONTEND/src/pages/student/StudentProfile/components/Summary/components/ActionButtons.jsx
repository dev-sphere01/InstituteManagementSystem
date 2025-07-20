import React from 'react'

const ActionButtons = () => {
    return (
        <div className="px-4 pb-4 space-y-2">
            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
                Edit Profile
            </button>
            <button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
                Print Profile
            </button>
        </div>
    )
}

export default ActionButtons