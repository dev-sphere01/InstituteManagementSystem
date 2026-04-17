/**
 * Shared style classes for EMS (Employee + Payroll) forms.
 * Matches the IMS application's existing Admission / Enquiry styling.
 */
export const getEmsStyles = (isDarkMode) => ({
  // Page wrapper card
  card: `rounded-2xl shadow-lg p-8 w-full ${
    isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
      : 'bg-gradient-to-br from-white via-gray-50 to-blue-50 border border-gray-200'
  }`,

  // Inner section card (e.g. review sections, sub-panels)
  sectionCard: `rounded-2xl shadow-lg p-8 mb-6 border ${
    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
  }`,

  // Section heading inside a card
  sectionTitle: `text-sm font-semibold uppercase tracking-wide mb-4 ${
    isDarkMode ? 'text-gray-400' : 'text-gray-500'
  }`,

  // Step/page title
  stepTitle: `text-2xl font-bold mb-2 tracking-tight ${isDarkMode ? 'text-white' : 'text-blue-900'}`,
  stepSubtitle: `text-sm mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`,

  textMuted: isDarkMode ? 'text-gray-400' : 'text-gray-500',

  // Label
  label: `block text-sm font-semibold mb-2 tracking-wide ${
    isDarkMode ? 'text-gray-200' : 'text-gray-700'
  }`,
  labelSm: `block text-xs font-semibold mb-1 tracking-wide ${
    isDarkMode ? 'text-gray-300' : 'text-gray-600'
  }`,

  // Input (normal + error state)
  input: (hasError = false) =>
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`,

  inputSm: (hasError = false) =>
    `block w-full px-4 py-1.5 text-sm border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`,

  // Select
  select: (hasError = false) =>
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white'
        : 'border-gray-300 bg-gray-50 text-gray-900'
    }`,

  selectSm: (hasError = false) =>
    `block w-full px-4 py-1.5 text-sm border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      hasError
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white'
        : 'border-gray-300 bg-gray-50 text-gray-900'
    }`,

  // Textarea
  textarea: (hasError = false) =>
    `block w-full px-4 py-2 border rounded-lg shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
      hasError
        ? 'border-red-500 focus:ring-red-400'
        : isDarkMode
        ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400'
        : 'border-gray-300 bg-gray-50 text-gray-900 placeholder-gray-400'
    }`,

  // Row card (used in multi-row academic/experience)
  rowCard: `p-4 rounded-xl border mb-3 ${
    isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
  }`,

  // Error text
  error: 'mt-1 text-xs text-red-500',

  // Buttons
  btnPrimary:
    'px-5 py-2 rounded-lg font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
  btnPrimarySm:
    'px-3 py-1.5 rounded-lg font-semibold text-xs bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
  btnSuccess:
    'px-5 py-2 rounded-lg font-semibold text-sm bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1',
  btnSuccessSm:
    'px-3 py-1.5 rounded-lg font-semibold text-xs bg-green-600 hover:bg-green-700 text-white transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1',
  btnWarning:
    'px-5 py-2 rounded-lg font-semibold text-sm bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1',
  btnWarningSm:
    'px-3 py-1.5 rounded-lg font-semibold text-xs bg-yellow-500 hover:bg-yellow-600 text-white transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1',
  btnDanger:
    'px-3 py-1.5 rounded-lg font-semibold text-xs bg-red-500 hover:bg-red-600 text-white transition-colors duration-200',
  btnGhost: (isDark) =>
    `px-5 py-2 rounded-lg font-semibold text-sm border transition-colors duration-200 focus:outline-none ${
      isDark
        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
    }`,
  btnGhostSm: (isDark) =>
    `px-3 py-1.5 rounded-lg font-semibold text-xs border transition-colors duration-200 focus:outline-none ${
      isDark
        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
    }`,
  btnOutline: (isDark) =>
    `px-5 py-2 rounded-lg font-semibold text-sm border-2 transition-colors duration-200 focus:outline-none ${
      isDark
        ? 'border-blue-500 text-blue-400 hover:bg-blue-900/30'
        : 'border-blue-500 text-blue-600 hover:bg-blue-50'
    }`,
  btnOutlineSm: (isDark) =>
    `px-3 py-1.5 rounded-lg font-semibold text-xs border-2 transition-colors duration-200 focus:outline-none ${
      isDark
        ? 'border-blue-500 text-blue-400 hover:bg-blue-900/30'
        : 'border-blue-500 text-blue-600 hover:bg-blue-50'
    }`,
  btnAddRow: (isDark) =>
    `mt-2 text-sm font-medium px-3 py-1.5 rounded-lg border transition-colors duration-150 ${
      isDark
        ? 'border-dashed border-gray-600 text-gray-400 hover:bg-gray-700'
        : 'border-dashed border-gray-400 text-gray-500 hover:bg-gray-100'
    }`,

  // Alert banners
  alertError:
    'mb-4 px-4 py-3 rounded-lg text-sm bg-red-50 border border-red-300 text-red-700',
  alertSuccess:
    'mb-4 px-4 py-3 rounded-lg text-sm bg-green-50 border border-green-300 text-green-700',
  alertInfo:
    'mb-4 px-4 py-3 rounded-lg text-sm bg-blue-50 border border-blue-300 text-blue-700',

  // Table
  table: `w-full text-sm border-separate border-spacing-0`,
  th: `text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider ${
    isDarkMode 
      ? 'text-gray-400 border-b border-gray-700 bg-gray-800/50' 
      : 'text-gray-500 border-b border-gray-200 bg-gray-50/50'
  }`,
  td: `px-4 py-3 ${isDarkMode ? 'border-b border-gray-700/50' : 'border-b border-gray-100'}`,
  trHover: `transition-colors ${isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-blue-50/50'}`,

  // Badge helpers
  badge: (color) => {
    const isDark = isDarkMode;
    const map = {
      green:  isDark 
        ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-900/30 text-green-400 border border-green-800/50' 
        : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-100',
      red:    isDark 
        ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-900/30 text-red-400 border border-red-800/50' 
        : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-100',
      yellow: isDark 
        ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-900/30 text-yellow-400 border border-yellow-800/50' 
        : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-50 text-yellow-700 border border-yellow-100',
      blue:   isDark 
        ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-900/30 text-blue-400 border border-blue-800/50' 
        : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100',
      gray:   isDark 
        ? 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-800 text-gray-400 border border-gray-700' 
        : 'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200',
    };
    return map[color] ?? map.gray;
  },

  // Modal box
  modalOverlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50',
  modalBox: `rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 ${
    isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
  }`,
  modalTitle: `text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`,

  // Divider
  divider: `my-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`,

  // Tab bar
  tabBar: `flex border-b overflow-x-auto ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`,
  tab: (active, isDark) =>
    `px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
      active
        ? 'border-b-2 border-blue-500 text-blue-500'
        : isDark
        ? 'text-gray-400 hover:text-gray-200'
        : 'text-gray-500 hover:text-gray-700'
    }`,
});
