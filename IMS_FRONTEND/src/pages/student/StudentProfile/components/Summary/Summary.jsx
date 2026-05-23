import React from 'react'
import Header from './components/Header'
import CompactInfo from './components/CompactInfo'
import ActionButtons from './components/ActionButtons'

const Summary = ({student, onUpdate}) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/50 overflow-hidden sticky top-6">
            <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

            {/* Compact Header */}
            <Header student={student} onUpdate={onUpdate} />

            {/* Compact Info */}
            <CompactInfo student={student} />

            {/* Compact Action Buttons */}
            <ActionButtons />
        </div>
    )
}

export default Summary