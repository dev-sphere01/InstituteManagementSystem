import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  useReactTable, getCoreRowModel, getFilteredRowModel,
  getSortedRowModel, getPaginationRowModel, flexRender
} from '@tanstack/react-table';
import { Plus, Upload, LayoutGrid, List, Search, Filter, RefreshCw, AlertTriangle } from 'lucide-react';
import { useThemeStore } from '../../../store';
import useCrmStore from '../../../store/useCrmStore';
import LeadFormModal from './components/LeadFormModal';
import LeadDetailDrawer from './components/LeadDetailDrawer';

const STAGES = ['New', 'Contacted', 'Warm', 'Hot', 'Converted', 'Lost'];

const STAGE_COLORS = {
  New:       { bg: 'bg-gray-100',   text: 'text-gray-700',   dark: 'bg-gray-700 text-gray-200',   dot: 'bg-gray-400' },
  Contacted: { bg: 'bg-blue-100',   text: 'text-blue-700',   dark: 'bg-blue-900 text-blue-200',   dot: 'bg-blue-500' },
  Warm:      { bg: 'bg-yellow-100', text: 'text-yellow-700', dark: 'bg-yellow-900 text-yellow-200', dot: 'bg-yellow-500' },
  Hot:       { bg: 'bg-orange-100', text: 'text-orange-700', dark: 'bg-orange-900 text-orange-200', dot: 'bg-orange-500' },
  Converted: { bg: 'bg-green-100',  text: 'text-green-700',  dark: 'bg-green-900 text-green-200',  dot: 'bg-green-500' },
  Lost:      { bg: 'bg-red-100',    text: 'text-red-700',    dark: 'bg-red-900 text-red-200',      dot: 'bg-red-500' },
};

function StageBadge({ stage, isDarkMode }) {
  const c = STAGE_COLORS[stage] || STAGE_COLORS.New;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${isDarkMode ? c.dark : `${c.bg} ${c.text}`}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {stage}
    </span>
  );
}

// ── Kanban Column ─────────────────────────────────────────────────────────────
function KanbanColumn({ stage, leads, isDarkMode, onCardClick, onStageChange }) {
  const c = STAGE_COLORS[stage];
  return (
    <div className={`flex-shrink-0 w-64 rounded-xl border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      <div className={`px-3 py-2.5 border-b flex items-center justify-between ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${c.dot}`} />
          <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{stage}</span>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600 border border-gray-200'}`}>
          {leads.length}
        </span>
      </div>
      <div className="p-2 space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
        {leads.map(lead => (
          <div key={lead._id}
            onClick={() => onCardClick(lead)}
            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              isDarkMode ? 'bg-gray-700 border-gray-600 hover:border-blue-500' : 'bg-white border-gray-200 hover:border-blue-400'
            } ${lead.isEscalated ? 'border-l-4 border-l-red-500' : ''}`}>
            <div className="flex items-start justify-between gap-1 mb-1.5">
              <p className={`text-sm font-medium leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lead.name}</p>
              {lead.isEscalated && <AlertTriangle className="h-3.5 w-3.5 text-red-500 flex-shrink-0 mt-0.5" />}
            </div>
            {lead.phone && <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lead.phone}</p>}
            {lead.course && <p className={`text-xs mt-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{lead.course}</p>}
            <div className="flex items-center justify-between mt-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {lead.source}
              </span>
              {lead.assignedTo && (
                <span className={`text-xs px-1.5 py-0.5 rounded ${isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                  {lead.assignedTo.name?.split(' ')[0]}
                </span>
              )}
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <p className={`text-center text-xs py-6 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No leads</p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function LeadPipeline() {
  const { isDarkMode } = useThemeStore();
  const { leads, leadsTotal, leadsLoading, fetchLeads, deleteLead, bulkImport } = useCrmStore();

  const [view, setView] = useState('table'); // 'kanban' | 'table'
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [drawerLead, setDrawerLead] = useState(null);
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    fetchLeads({ search, stage: stageFilter, limit: 200 });
  }, [search, stageFilter]);

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const res = await bulkImport(file);
      showToast(`Imported ${res.imported} leads. Duplicates: ${res.duplicates}.`);
    } catch (err) {
      showToast(err.response?.data?.message || err.message, false);
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  // Kanban grouping
  const kanbanGroups = useMemo(() => {
    const groups = {};
    STAGES.forEach(s => { groups[s] = []; });
    leads.forEach(l => { if (groups[l.stage]) groups[l.stage].push(l); });
    return groups;
  }, [leads]);

  // Table columns
  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{row.original.name}</p>
          <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{row.original.email || '—'}</p>
        </div>
      )
    },
    { accessorKey: 'phone', header: 'Phone', cell: ({ getValue }) => getValue() || '—' },
    { accessorKey: 'source', header: 'Source' },
    { accessorKey: 'course', header: 'Course', cell: ({ getValue }) => getValue() || '—' },
    {
      accessorKey: 'stage',
      header: 'Stage',
      cell: ({ getValue }) => <StageBadge stage={getValue()} isDarkMode={isDarkMode} />
    },
    {
      accessorKey: 'assignedTo',
      header: 'Assigned To',
      cell: ({ getValue }) => getValue()?.name || <span className="text-gray-400">Unassigned</span>
    },
    {
      accessorKey: 'isEscalated',
      header: '',
      cell: ({ getValue }) => getValue()
        ? <span className="inline-flex items-center gap-1 text-xs text-red-500"><AlertTriangle className="h-3 w-3" /> Escalated</span>
        : null
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }) => new Date(getValue()).toLocaleDateString()
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button onClick={() => setDrawerLead(row.original)}
            className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-blue-400 hover:bg-gray-600' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
            View
          </button>
          <button onClick={() => { setEditLead(row.original); setShowForm(true); }}
            className={`text-xs px-2 py-1 rounded ${isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            Edit
          </button>
        </div>
      )
    }
  ], [isDarkMode]);

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  const inputCls = `px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
  }`;
  const cardCls = `rounded-lg shadow-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Pipeline</h1>
          <p className={`mt-0.5 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{leadsTotal} total leads</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={handleImport} />
          <button onClick={() => fileRef.current?.click()} disabled={importing}
            className={`inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm font-medium focus:outline-none ${
              isDarkMode ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            } disabled:opacity-50`}>
            <Upload className="h-4 w-4" />
            {importing ? 'Importing...' : 'Import'}
          </button>
          <button onClick={() => { setEditLead(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Plus className="h-4 w-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`rounded-md p-3 border text-sm ${
          toast.ok
            ? isDarkMode ? 'bg-green-900/50 border-green-700 text-green-200' : 'bg-green-50 border-green-200 text-green-800'
            : isDarkMode ? 'bg-red-900/50 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'
        }`}>{toast.msg}</div>
      )}

      {/* Filters + View toggle */}
      <div className={`${cardCls} p-3 flex items-center gap-3 flex-wrap`}>
        <div className="relative flex-1 min-w-48">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className={`${inputCls} pl-9 w-full`} />
        </div>
        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className={inputCls}>
          <option value="">All Stages</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className={`flex rounded-md border overflow-hidden ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          {[['table', <List className="h-4 w-4" />], ['kanban', <LayoutGrid className="h-4 w-4" />]].map(([v, icon]) => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-2 text-sm transition-colors ${
                view === v
                  ? 'bg-blue-600 text-white'
                  : isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}>
              {icon}
            </button>
          ))}
        </div>
        <button onClick={() => fetchLeads({ search, stage: stageFilter, limit: 200 })}
          className={`p-2 rounded-md border ${isDarkMode ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border-gray-300 bg-white text-gray-600 hover:bg-gray-50'}`}>
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Kanban View */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGES.map(stage => (
            <KanbanColumn key={stage} stage={stage} leads={kanbanGroups[stage]}
              isDarkMode={isDarkMode} onCardClick={setDrawerLead} />
          ))}
        </div>
      )}

      {/* Table View */}
      {view === 'table' && (
        <div className={`${cardCls} overflow-hidden`}>
          {leadsLoading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                    {table.getHeaderGroups().map(hg => (
                      <tr key={hg.id}>
                        {hg.headers.map(h => (
                          <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                            className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide cursor-pointer select-none ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted()] ?? ''}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                    {table.getRowModel().rows.length === 0 ? (
                      <tr><td colSpan={columns.length} className={`text-center py-10 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No leads found</td></tr>
                    ) : table.getRowModel().rows.map(row => (
                      <tr key={row.id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className={`flex items-center justify-between px-4 py-3 border-t text-sm ${isDarkMode ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-600'}`}>
                <span>Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}</span>
                <div className="flex gap-2">
                  <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}
                    className={`px-3 py-1 rounded border text-xs disabled:opacity-40 ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                    Prev
                  </button>
                  <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}
                    className={`px-3 py-1 rounded border text-xs disabled:opacity-40 ${isDarkMode ? 'border-gray-600 bg-gray-700 hover:bg-gray-600' : 'border-gray-300 bg-white hover:bg-gray-50'}`}>
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <LeadFormModal
          lead={editLead}
          onClose={() => { setShowForm(false); setEditLead(null); }}
          onSaved={() => { setShowForm(false); setEditLead(null); fetchLeads({ search, stage: stageFilter, limit: 200 }); }}
        />
      )}
      {drawerLead && (
        <LeadDetailDrawer
          leadId={drawerLead._id}
          onClose={() => setDrawerLead(null)}
        />
      )}
    </div>
  );
}
