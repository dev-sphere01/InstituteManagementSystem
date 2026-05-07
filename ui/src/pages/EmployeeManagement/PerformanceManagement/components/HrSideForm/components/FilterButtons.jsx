import React from 'react'
import { motion } from 'framer-motion'
import { ListChecks, CheckCircle, Clock } from 'lucide-react'

const FilterButtons = ({ 
  reviewStats, 
  activeFilter, 
  onFilterClick,
  type = 'direct', // 'direct' or 'assigned'
  isHindi = false
}) => {
  const stats = type === 'direct' ? reviewStats?.DirectReviews : reviewStats?.AssignedReviews
  
  if (!stats || stats.TotalEmployees === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-2"
    >
      {/* Total - Display only, not clickable */}
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 rounded-md border border-blue-200">
        <ListChecks className="h-3.5 w-3.5 text-blue-600" />
        <span className="text-xs font-medium text-blue-700">
          {isHindi ? 'कुल:' : 'Total:'}
        </span>
        <span className="text-sm font-bold text-blue-900">{stats.TotalEmployees}</span>
      </div>

      {/* Assessed - Clickable Filter Button */}
      <motion.button
        onClick={() => onFilterClick('assessed')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
          activeFilter === 'assessed'
            ? 'bg-green-600 border-green-700 shadow-md'
            : 'bg-green-50 border-green-200 hover:bg-green-100'
        }`}
      >
        <CheckCircle className={`h-3.5 w-3.5 ${activeFilter === 'assessed' ? 'text-white' : 'text-green-600'}`} />
        <span className={`text-xs font-medium ${activeFilter === 'assessed' ? 'text-white' : 'text-green-700'}`}>
          {isHindi ? 'मूल्यांकित:' : 'Assessed:'}
        </span>
        <span className={`text-sm font-bold ${activeFilter === 'assessed' ? 'text-white' : 'text-green-900'}`}>
          {stats.Completed}
        </span>
      </motion.button>

      {/* To be Assessed - Clickable Filter Button */}
      <motion.button
        onClick={() => onFilterClick('remaining')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
          activeFilter === 'remaining'
            ? 'bg-orange-600 border-orange-700 shadow-md'
            : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
        }`}
      >
        <Clock className={`h-3.5 w-3.5 ${activeFilter === 'remaining' ? 'text-white' : 'text-orange-600'}`} />
        <span className={`text-xs font-medium ${activeFilter === 'remaining' ? 'text-white' : 'text-orange-700'}`}>
          {isHindi ? 'मूल्यांकन होना है:' : 'To be Assessed:'}
        </span>
        <span className={`text-sm font-bold ${activeFilter === 'remaining' ? 'text-white' : 'text-orange-900'}`}>
          {stats.Remaining}
        </span>
      </motion.button>
    </motion.div>
  )
}

export default FilterButtons