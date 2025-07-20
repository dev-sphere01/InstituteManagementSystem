const InfoCard = ({
    title,
    children,
    icon,
    gradient = "from-blue-50 to-indigo-50",
}) => (
    <div className="relative bg-white rounded-xl shadow-md border border-slate-200/50 p-4 overflow-hidden group hover:shadow-lg transition-all duration-200">
        <div
            className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
        ></div>
        <div className="relative z-10">
            <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-100">
                {icon && (
                    <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm">
                        {icon}
                    </div>
                )}
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <div className="space-y-2">{children}</div>
        </div>
    </div>
);

export default InfoCard