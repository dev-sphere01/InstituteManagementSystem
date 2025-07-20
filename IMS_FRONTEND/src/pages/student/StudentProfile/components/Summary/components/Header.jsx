import React from 'react'

const Header = ({student}) => {
    return (
        <>
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-4 text-white">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-xl font-bold mb-3">
                    {student.fullName?.charAt(0)?.toUpperCase() || "S"}
                </div>
                <h2 className="text-lg font-bold mb-1">
                    {student.fullName || "Student Name"}
                </h2>
                <p className="text-indigo-100 text-xs">
                    ID: {student.generatedRegNo}
                </p>
            </div>
        </>
    )
}

export default Header