import { Info, Upload, X } from 'lucide-react'
import React from 'react'

const ApplyLeave = ({ formData, handleInputChange, errors, handleSubmit ,motion,leaveTypes,SendHorizontal, isSubmitting, attachmentFile, onAttachmentChange, onAttachmentRemove, reasons, onReasonChange, customReason, onCustomReasonChange}) => {
    const calculateLeaveDays = () => {
        if (!formData.startDate || !formData.endDate) return 0;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        return Math.max(0, (end - start) / (1000 * 60 * 60 * 24) + 1);
    };

    const leaveDays = calculateLeaveDays();

    return (
        <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg shadow-sm p-3 border border-gray-200"
        >
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Log Leave</h2>

            <form onSubmit={handleSubmit} className="space-y-1.5">
                {/* Row 1: Leave Type, Start Date, End Date, Days, Hours (if On-Duty) */}
                <div className={`grid gap-2 ${formData.leaveType === 'On-Duty' ? 'grid-cols-5' : 'grid-cols-4'}`}>
                    {/* Leave Type */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Type *</label>
                        <select
                            name="leaveType"
                            value={formData.leaveType}
                            onChange={handleInputChange}
                            className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.leaveType ? 'border-red-300' : 'border-gray-300'}`}
                        >
                            <option value="">Select</option>
                            {leaveTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.leaveType && <div className="text-red-600 text-xs mt-0.5 truncate"><Info className="h-2.5 w-2.5 inline mr-0.5" />{errors.leaveType}</div>}
                    </div>

                    {/* Start Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Start *</label>
                        <input
                            type="date"
                            name="startDate"
                            value={formData.startDate}
                            onChange={handleInputChange}
                            className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.startDate ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors.startDate && <div className="text-red-600 text-xs mt-0.5 truncate"><Info className="h-2.5 w-2.5 inline mr-0.5" />{errors.startDate}</div>}
                    </div>

                    {/* End Date */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">End *</label>
                        <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.endDate ? 'border-red-300' : 'border-gray-300'}`}
                        />
                        {errors.endDate && <div className="text-red-600 text-xs mt-0.5 truncate"><Info className="h-2.5 w-2.5 inline mr-0.5" />{errors.endDate}</div>}
                    </div>

                    {/* Days Display */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">Days</label>
                        <div className="w-full px-2 py-1.5 text-xs bg-blue-50 border border-blue-200 rounded text-center font-semibold text-blue-600">
                            {leaveDays}
                        </div>
                    </div>

                    {/* Hours - Only for On-Duty */}
                    {formData.leaveType === 'On-Duty' && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-0.5">Hours *</label>
                            <input
                                type="number"
                                name="OnDutyHours"
                                min={1}
                                value={formData.OnDutyHours}
                                onChange={handleInputChange}
                                className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.OnDutyHours ? 'border-red-300' : 'border-gray-300'}`}
                                placeholder="1-15"
                            />
                            {errors.OnDutyHours && <div className="text-red-600 text-xs mt-0.5 truncate"><Info className="h-2.5 w-2.5 inline mr-0.5" />{errors.OnDutyHours}</div>}
                        </div>
                    )}
                </div>

                {/* Row 2: Reason, Attachment, Submit Button */}
                <div className="grid grid-cols-12 gap-2">
                    {/* Reason - Takes 5 columns */}
                    <div className="col-span-5 flex flex-col space-y-1">
                        <label className="block text-xs font-medium text-gray-700">Reason *</label>
                        {formData.leaveType === 'On-Duty' ? (
                            <input
                                type="text"
                                value={customReason}
                                onChange={onCustomReasonChange}
                                placeholder="Enter reason..."
                                className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.reason ? 'border-red-300' : 'border-gray-300'}`}
                            />
                        ) : (
                            <>
                                <select
                                    value={formData.reason}
                                    onChange={onReasonChange}
                                    className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.reason ? 'border-red-300' : 'border-gray-300'}`}
                                >
                                    <option value="">Select a reason</option>
                                    {reasons?.map((reason, idx) => (
                                        <option key={idx} value={reason}>{reason}</option>
                                    ))}
                                    <option value="Other">Other</option>
                                </select>
                                {formData.reason === 'Other' && (
                                    <input
                                        type="text"
                                        value={customReason}
                                        onChange={onCustomReasonChange}
                                        placeholder="Enter custom reason..."
                                        className={`w-full px-2 py-1.5 text-xs bg-gray-50 border rounded text-gray-800 focus:ring-1 focus:ring-blue-400 focus:border-blue-400 transition-colors ${errors.reason ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                )}
                            </>
                        )}
                        {errors.reason && <div className="text-red-600 text-xs mt-0.5 truncate"><Info className="h-2.5 w-2.5 inline mr-0.5" />{errors.reason}</div>}
                    </div>

                    {/* Attachment - Takes 4 columns */}
                    <div className="col-span-4 flex flex-col justify-end">
                        <label className="block text-xs font-medium text-gray-700 mb-0.5">File</label>
                        <input
                            type="file"
                            id="attachment"
                            onChange={onAttachmentChange}
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls"
                            className="hidden"
                        />
                        {!attachmentFile ? (
                            <label htmlFor="attachment" className="cursor-pointer flex items-center justify-center w-full px-2 py-1.5 border-2 border-dashed border-gray-300 rounded bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-colors">
                                <div className="flex items-center space-x-1 overflow-hidden">
                                    <Upload className="h-3 w-3 text-gray-500 flex-shrink-0" />
                                    <span className="text-xs text-gray-600 truncate">Upload</span>
                                </div>
                            </label>
                        ) : (
                            <div className="flex items-center justify-between px-2 py-1.5 bg-blue-50 border border-blue-200 rounded">
                                <span className="text-xs text-gray-800 truncate">{attachmentFile.name}</span>
                                <button
                                    type="button"
                                    onClick={onAttachmentRemove}
                                    className="ml-1 text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                        {errors.attachment && <div className="text-red-600 text-xs mt-0.5 truncate"><Info className="h-2.5 w-2.5 inline mr-0.5" />{errors.attachment}</div>}
                    </div>

                    {/* Submit Button - Takes 3 columns */}
                    <div className="col-span-3 flex flex-col justify-end">
                        <motion.button
                            type="submit"
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className="flex items-center justify-center space-x-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded text-xs transition-colors focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed h-10"
                            disabled={
                                isSubmitting ||
                                !!errors.endDate ||
                                !!errors.leaveType ||
                                !!errors.reason ||
                                (formData.leaveType === 'On-Duty' && !!errors.OnDutyHours)
                            }
                        >
                            <SendHorizontal className="h-3.5 w-3.5" />
                            <span>{isSubmitting ? 'Submitting...' : 'Submit'}</span>
                        </motion.button>
                    </div>
                </div>
            </form>
        </motion.section>
    )
}

export default ApplyLeave