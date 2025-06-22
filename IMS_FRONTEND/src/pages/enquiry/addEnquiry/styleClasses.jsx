// Theme-based classes
export const getEnquiryStyleClasses = (isDarkMode) => ({
    cardClass: `rounded-lg shadow-md p-6 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`,
    formTitleClass: `text-3xl font-bold  bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600`,
    formSubtitleClass: `mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`,
    sectionTitleClass: `text-base font-semibold mb-4 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`,
    labelClass: `block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`,
    inputClass: `block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'}`,
    errorClass: 'mt-1 text-sm text-red-500',
    radioCheckClass: `h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded`,
    buttonClass: `px-6 py-2 rounded-md font-semibold transition-colors duration-150 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isDarkMode ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`,
    resetButtonClass: `px-4 py-2 border rounded-md font-medium transition-colors duration-150 shadow ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`,
    dividerClass: `my-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`,
    toggleBtnClass: (active) => `h-full px-3 py-1 text-sm rounded-l-md border border-r-0 font-medium focus:outline-none transition-colors duration-100 ${active ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`,
    toggleBtnClassRight: (active) => `h-full px-3 py-2 text-sm rounded-r-md border font-medium focus:outline-none transition-colors duration-100 ${active ? 'bg-blue-600 text-white' : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`
});