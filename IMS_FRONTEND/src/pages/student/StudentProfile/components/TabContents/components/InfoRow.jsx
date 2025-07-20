 const InfoRow = ({ label, value, className = "", icon }) => (
    <div
      className={`flex justify-between items-center py-2 px-3 rounded-lg bg-slate-50/70 hover:bg-slate-100/70 transition-colors duration-150 ${className}`}
    >
      <div className="flex items-center space-x-2">
        {icon && <span className="text-sm">{icon}</span>}
        <span className="text-slate-600 font-medium text-sm">{label}:</span>
      </div>
      <span
        className="text-slate-800 font-semibold text-sm truncate max-w-[150px]"
        title={value}
      >
        {value || "Not provided"}
      </span>
    </div>
  );

  export default InfoRow;