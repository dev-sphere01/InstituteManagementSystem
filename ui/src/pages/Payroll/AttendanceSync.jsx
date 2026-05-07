import React, { useState, useMemo } from 'react';
import { Database, Loader2, CheckCircle2, Calendar, MapPin } from 'lucide-react';
import API from '@/services/API';
import notification from '@/services/NotificationService.jsx';

const AttendanceSync = () => {
  const notify = notification();

  const [mdbPath, setMdbPath] = useState('');
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [locationId, setLocationId] = useState('');
  const [syncing, setSyncing] = useState(false);

  const locations = useMemo(() => ([
    { id: 1, name: 'Tagore Town Office' },
    { id: 2, name: 'Naini Factory' },
  ]), []);

  const handleSync = async () => {
    if (!locationId) {
      notify.warning('Please select a location');
      return;
    }

    setSyncing(true);
    try {
      const response = await API.post('/Attendances/SyncFromMdb', {
        MdbPath: mdbPath || null,
        FromDate: fromDate,
        ToDate: toDate,
        LocationID: parseInt(locationId)
      });

      notify.success(response.data.Message || 'Sync successful');
      if (response.data.RecordsSynced > 0) {
        notify.info(`${response.data.RecordsSynced} records synchronized`);
      } else {
        notify.info('No new records to sync for the selected period');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      const msg = error?.response?.data?.Details || error?.response?.data?.Message || 'Sync failed. Please check the MDB path and connection.';
      notify.error(msg);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 bg-white shadow-xl rounded-lg space-y-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <Database className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">MS Access Attendance Sync</h1>
          <p className="text-sm text-gray-500">Synchronize daily attendance directly from your 3rd party software database (.mdb)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MDB Path Input */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Database className="w-4 h-4" /> MS Access Database Path (Optional)
          </label>
          <input
            type="text"
            value={mdbPath}
            onChange={(e) => setMdbPath(e.target.value)}
            placeholder="Defaults to server configuration (e.g. C:\Attendance.mdb)"
            className="w-full border rounded-md px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-400">Leave blank to use the default path configured on the server.</p>
        </div>

        {/* Location Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> Sync for Location
          </label>
          <select
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            className="w-full border rounded-md px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Location</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>{loc.name}</option>
            ))}
          </select>
        </div>

        <div className="hidden md:block"></div>

        {/* Date Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> From Date
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> To Date
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="pt-6 border-t flex justify-end">
        <button
          onClick={handleSync}
          disabled={syncing}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-md text-white font-bold transition-all transform active:scale-95 ${
            syncing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-200'
          }`}
        >
          {syncing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" /> Synchronizing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" /> Start Synchronization
            </>
          )}
        </button>
      </div>

      <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          How it works:
        </h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc ml-4">
          <li>Connects to the specified .mdb file on the server.</li>
          <li>Matches employees using the <strong>EMSEMPID</strong> field in the database.</li>
          <li>Imports daily attendance logs including <strong>In Time</strong> and <strong>Out Time</strong>.</li>
          <li>Automatically applies daily attendance rules (standardized hours).</li>
          <li>Updates existing records if already imported for the same date.</li>
        </ul>
      </div>
    </div>
  );
};

export default AttendanceSync;
