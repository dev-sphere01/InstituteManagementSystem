import { useThemeStore } from '../../store';

export const getAdmissionStyleClasses = () => {
  const { isDarkMode } = useThemeStore.getState();
  const accent = isDarkMode ? 'text-purple-300' : 'text-purple-700';
  const accentBg = isDarkMode ? 'bg-purple-700' : 'bg-purple-600';
  const accentBgHover = isDarkMode ? 'hover:bg-purple-800' : 'hover:bg-purple-700';

  return {
    cardClass: `p-8 rounded-2xl shadow-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'}`,
    titleClass: `text-4xl font-extrabold mb-8 text-center tracking-tight ${accent}`,
    sectionTitleClass: `text-2xl font-bold mb-6 ${accent}`,
    labelClass: `block text-base font-medium mb-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`,
    inputClass: `mt-1 block w-full border rounded-lg shadow-sm p-3 text-base transition focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-500 ${
      isDarkMode
        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
    }`,
    buttonClass: `px-6 py-2 rounded-lg font-semibold text-white ${accentBg} ${accentBgHover} transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400` ,
    prevButtonClass: `px-6 py-2 rounded-lg font-semibold transition-colors duration-200 shadow-sm focus:outline-none ${
      isDarkMode
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    }`,
    clearButtonClass: `px-6 py-2 rounded-lg font-semibold text-white transition-colors duration-200 shadow-sm focus:outline-none ${
      isDarkMode
        ? 'bg-red-700 hover:bg-red-800'
        : 'bg-red-600 hover:bg-red-700'
    }`,
    submitButtonClass: `px-8 py-2 rounded-lg font-semibold text-white transition-colors duration-200 shadow-lg focus:outline-none ${
      isDarkMode
        ? 'bg-green-600 hover:bg-green-700'
        : 'bg-green-600 hover:bg-green-700'
    }`
  };
}; 