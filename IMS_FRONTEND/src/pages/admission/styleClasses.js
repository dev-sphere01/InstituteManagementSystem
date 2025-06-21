import { useThemeStore } from '../../store';

export const getAdmissionStyleClasses = () => {
  const { isDarkMode } = useThemeStore.getState();

  return {
    cardClass: `p-6 rounded-lg shadow-md ${isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'}`,
    titleClass: `text-2xl font-bold mb-6 text-center ${isDarkMode ? 'text-purple-400' : 'text-purple-800'}`,
    sectionTitleClass: `text-xl font-semibold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-700'}`,
    labelClass: `block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`,
    inputClass: `mt-1 block w-full border rounded-md shadow-sm p-2 ${
      isDarkMode
        ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
        : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
    }`,
    buttonClass: `px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${
        isDarkMode 
        ? 'bg-purple-600 hover:bg-purple-700' 
        : 'bg-purple-600 hover:bg-purple-700'
    }`,
    prevButtonClass: `px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
        isDarkMode 
        ? 'bg-gray-600 hover:bg-gray-700 text-white' 
        : 'bg-gray-300 hover:bg-gray-400 text-gray-800'
    }`,
    clearButtonClass: `px-4 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${
        isDarkMode 
        ? 'bg-red-700 hover:bg-red-800' 
        : 'bg-red-600 hover:bg-red-700'
    }`,
    submitButtonClass: `px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 ${
        isDarkMode 
        ? 'bg-green-600 hover:bg-green-700' 
        : 'bg-green-600 hover:bg-green-700'
    }`
  };
}; 