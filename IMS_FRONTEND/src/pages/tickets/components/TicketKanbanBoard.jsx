import React from 'react';
import { useThemeStore } from '../../../store';
import ticketService from '../../../services/ticketService';

const COLUMNS = [
  { id: 'Open', title: 'Open', color: 'border-t-sky-500', headerBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300' },
  { id: 'In Progress', title: 'In Progress', color: 'border-t-indigo-500', headerBg: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300' },
  { id: 'Under Review', title: 'Under Review', color: 'border-t-purple-500', headerBg: 'bg-purple-500/10 text-purple-700 dark:text-purple-300' },
  { id: 'Resolved', title: 'Resolved', color: 'border-t-emerald-500', headerBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  { id: 'Closed', title: 'Closed', color: 'border-t-slate-500', headerBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300' },
];

const PRIORITY_COLORS = {
  Low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  Medium: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  High: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  Urgent: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold animate-pulse',
};

export const TicketKanbanBoard = ({ tickets, onSelectTicket, onTicketStatusChange }) => {
  const { isDarkMode } = useThemeStore();

  const handleQuickMove = async (e, ticketId, newStatus) => {
    e.stopPropagation();
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus);
      onTicketStatusChange?.();
    } catch (err) {
      console.error('Failed to change status:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 pb-4">
      {COLUMNS.map((col) => {
        const columnTickets = tickets.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-2xl border-t-4 ${col.color} border border-slate-200 dark:border-slate-800 transition shadow-sm ${
              isDarkMode ? 'bg-slate-900/60' : 'bg-slate-50/70'
            }`}
          >
            {/* Column Header */}
            <div className="p-3.5 border-b border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${col.headerBg}`}>
                  {col.title}
                </span>
              </div>
              <span className="text-xs font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                {columnTickets.length}
              </span>
            </div>

            {/* Column Body / Tickets List */}
            <div className="p-3 flex-1 space-y-3 min-h-[450px] max-h-[700px] overflow-y-auto">
              {columnTickets.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
                  No tickets in {col.title}
                </div>
              ) : (
                columnTickets.map((ticket) => {
                  const completedSubtasks =
                    ticket.subtasks?.filter((st) => st.isCompleted).length || 0;
                  const totalSubtasks = ticket.subtasks?.length || 0;
                  const isOverdue =
                    ticket.dueDate &&
                    new Date(ticket.dueDate) < new Date() &&
                    !['Resolved', 'Closed'].includes(ticket.status);

                  return (
                    <div
                      key={ticket._id}
                      onClick={() => onSelectTicket(ticket._id)}
                      className={`p-3.5 rounded-xl border transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5 ${
                        isDarkMode
                          ? 'bg-slate-800/90 border-slate-700/80 hover:border-indigo-500/50'
                          : 'bg-white border-slate-200/90 hover:border-indigo-300'
                      }`}
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="font-mono text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                          {ticket.ticketNumber}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md border font-semibold ${
                            PRIORITY_COLORS[ticket.priority] || PRIORITY_COLORS.Medium
                          }`}
                        >
                          {ticket.priority}
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="text-xs font-bold line-clamp-2 text-slate-800 dark:text-slate-100 mb-2">
                        {ticket.title}
                      </h4>

                      {/* Department Chip */}
                      <div className="mb-3">
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 inline-block truncate max-w-full">
                          🏢 {ticket.department}
                        </span>
                      </div>

                      {/* Checklist / Comments count indicators */}
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 mb-3">
                        {totalSubtasks > 0 && (
                          <span
                            className={`flex items-center space-x-1 ${
                              completedSubtasks === totalSubtasks
                                ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                                : ''
                            }`}
                          >
                            <span>✓</span>
                            <span>
                              {completedSubtasks}/{totalSubtasks}
                            </span>
                          </span>
                        )}

                        {ticket.comments?.length > 0 && (
                          <span className="flex items-center space-x-1">
                            <span>💬</span>
                            <span>{ticket.comments.length}</span>
                          </span>
                        )}

                        {ticket.dueDate && (
                          <span
                            className={`flex items-center space-x-1 ${
                              isOverdue ? 'text-rose-600 dark:text-rose-400 font-bold' : ''
                            }`}
                            title={isOverdue ? 'Overdue' : 'Due Date'}
                          >
                            <span>📅</span>
                            <span>{new Date(ticket.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </span>
                        )}
                      </div>

                      {/* Footer: Assignee & Quick Status Shift */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                        {ticket.assignedTo ? (
                          <div className="flex items-center space-x-1.5 min-w-0" title={`Assigned to: ${ticket.assignedTo.name || ticket.assignedToName}`}>
                            <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                              {(ticket.assignedTo.name || ticket.assignedToName || 'E')[0]}
                            </div>
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {ticket.assignedTo.name || ticket.assignedToName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                            Unassigned
                          </span>
                        )}

                        {/* Quick Next Status button */}
                        <div className="flex items-center space-x-1">
                          {col.id === 'Open' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickMove(e, ticket._id, 'In Progress')}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100"
                              title="Start Progress"
                            >
                              Start →
                            </button>
                          )}
                          {col.id === 'In Progress' && (
                            <button
                              type="button"
                              onClick={(e) => handleQuickMove(e, ticket._id, 'Resolved')}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-semibold hover:bg-emerald-100"
                              title="Resolve"
                            >
                              Resolve ✓
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
