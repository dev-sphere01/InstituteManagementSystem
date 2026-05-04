import React, { useState, useEffect } from 'react';
import { X, Phone, Mail, MapPin, User, Tag, AlertTriangle, MessageSquare, PhoneCall, FileText, GitBranch } from 'lucide-react';
import { useThemeStore } from '../../../../store';
import useCrmStore from '../../../../store/useCrmStore';

const STAGES = ['New', 'Contacted', 'Warm', 'Hot', 'Converted', 'Lost'];
const INTERACTION_TYPES = ['Call', 'Note', 'Email', 'SMS'];

const STAGE_COLORS = {
  New: 'bg-gray-100 text-gray-700', Contacted: 'bg-blue-100 text-blue-700',
  Warm: 'bg-yellow-100 text-yellow-700', Hot: 'bg-orange-100 text-orange-700',
  Converted: 'bg-green-100 text-green-700', Lost: 'bg-red-100 text-red-700',
};

const INTERACTION_ICONS = {
  Call: PhoneCall, Note: FileText, Email: Mail, SMS: MessageSquare,
  'Stage Change': GitBranch, Assignment: User,
};

export default function LeadDetailDrawer({ leadId, onClose }) {
  const { isDarkMode } = useThemeStore();
  const { fetchLeadById, currentLead, updateLead, addInteraction, reassignLead } = useCrmStore();

  const [note, setNote] = useState('');
  const [noteType, setNoteType] = useState('Note');
  const [addingNote, setAddingNote] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLeadById(leadId);
  }, [leadId]);

  const lead = currentLead?._id === leadId ? currentLead : null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setAddingNote(true);
    try {
      await addInteraction(leadId, { type: noteType, note });
      setNote('');
    } finally {
      setAddingNote(false);
    }
  };

  const handleStageChange = async (stage) => {
    setSaving(true);
    try {
      await updateLead(leadId, { stage });
      setNewStage('');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = `block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
    isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
  }`;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black bg-opacity-40" onClick={onClose} />

      {/* Drawer */}
      <div className={`w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b flex-shrink-0 ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Lead Details</h2>
          <button onClick={onClose} className={`p-1 rounded-md ${isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {!lead ? (
          <div className="flex items-center justify-center flex-1">
            <svg className="animate-spin h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Lead info */}
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{lead.name}</h3>
                  <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{lead.source}</p>
                </div>
                {lead.isEscalated && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <AlertTriangle className="h-3 w-3" /> Escalated
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {lead.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{lead.phone}</span>
                  </div>
                )}
                {lead.email && (
                  <div className="flex items-center gap-2">
                    <Mail className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={`truncate ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{lead.email}</span>
                  </div>
                )}
                {lead.city && (
                  <div className="flex items-center gap-2">
                    <MapPin className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{lead.city}</span>
                  </div>
                )}
                {lead.course && (
                  <div className="flex items-center gap-2">
                    <Tag className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{lead.course}</span>
                  </div>
                )}
                {lead.assignedTo && (
                  <div className="flex items-center gap-2">
                    <User className={`h-4 w-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                    <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>{lead.assignedTo.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Stage changer */}
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Pipeline Stage</p>
              <div className="flex flex-wrap gap-2">
                {STAGES.map(s => (
                  <button key={s} onClick={() => handleStageChange(s)} disabled={saving}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                      lead.stage === s
                        ? 'bg-blue-600 text-white border-blue-600'
                        : isDarkMode
                          ? 'border-gray-600 text-gray-300 hover:border-blue-500 hover:text-blue-400'
                          : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Add interaction */}
            <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Log Interaction</p>
              <form onSubmit={handleAddNote} className="space-y-3">
                <div className="flex gap-2">
                  {INTERACTION_TYPES.map(t => (
                    <button key={t} type="button" onClick={() => setNoteType(t)}
                      className={`px-3 py-1 rounded text-xs font-medium border transition-colors ${
                        noteType === t
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}>
                      {t}
                    </button>
                  ))}
                </div>
                <textarea rows={2} value={note} onChange={e => setNote(e.target.value)}
                  placeholder={`Add a ${noteType.toLowerCase()}...`} className={inputCls} />
                <button type="submit" disabled={addingNote || !note.trim()}
                  className={`px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white focus:outline-none ${
                    addingNote || !note.trim() ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  {addingNote ? 'Saving...' : 'Log'}
                </button>
              </form>
            </div>

            {/* Timeline */}
            <div className="px-5 py-4">
              <p className={`text-xs font-semibold uppercase tracking-wide mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Timeline</p>
              {(!lead.interactions || lead.interactions.length === 0) ? (
                <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No interactions yet</p>
              ) : (
                <div className="space-y-4">
                  {[...lead.interactions].reverse().map((item, i) => {
                    const Icon = INTERACTION_ICONS[item.type] || FileText;
                    return (
                      <div key={item._id || i} className="flex gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                          <Icon className={`h-4 w-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-semibold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.type}</span>
                            <span className={`text-xs flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                              {new Date(item.createdAt).toLocaleString()}
                            </span>
                          </div>
                          {item.note && <p className={`text-sm mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.note}</p>}
                          {item.createdBy && <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>by {item.createdBy.name || 'System'}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
