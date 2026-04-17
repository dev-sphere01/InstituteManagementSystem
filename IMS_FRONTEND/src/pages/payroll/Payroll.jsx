import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store';
import { getEmsStyles } from '../employee/emsStyles';
import PermissionGuard from '../../components/PermissionGuard';
import HolidayManagement from './submodules/HolidayManagement';
import AttendanceManager from './submodules/AttendanceManager';
import AttendanceImport from './submodules/AttendanceImport';
import ShiftAndLateRules from './submodules/ShiftAndLateRules';
import LateFineSlabs from './submodules/LateFineSlabs';
import SalaryAssignment from './submodules/SalaryAssignment';
import AllowanceManager from './submodules/AllowanceManager';
import FineManager from './submodules/FineManager';
import HoldingManager from './submodules/HoldingManager';
import HoldingRegister from './submodules/HoldingRegister';
import PayrollProcessing from './submodules/PayrollProcessing';
import SalarySlip from './submodules/SalarySlip';
import IncentivePanel from './submodules/IncentivePanel';

const TABS = [
  { key: 'attendance',  label: 'Attendance',      permission: 'attendance.read' },
  { key: 'import',      label: 'Import',           permission: 'attendance.create' },
  { key: 'holidays',    label: 'Holidays',         permission: 'attendance.read' },
  { key: 'rules',       label: 'Shift & Rules',    permission: 'attendance.read' },
  { key: 'fineSlabs',   label: 'Fine Slabs',       permission: 'attendance.read' },
  { key: 'salary',      label: 'Salary Assignment',permission: 'payroll.update' },
  { key: 'allowances',  label: 'Allowances',       permission: 'payroll.update' },
  { key: 'fines',       label: 'Fines',            permission: 'payroll.update' },
  { key: 'holdings',    label: 'Holdings',         permission: 'payroll.update' },
  { key: 'process',     label: 'Process Payroll',  permission: 'payroll.process' },
  { key: 'slip',        label: 'Salary Slip',      permission: 'payroll.read' },
  { key: 'incentives',  label: 'Incentives',       permission: 'incentive.read' },
];

const Payroll = () => {
  const { tab } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useThemeStore();
  const styles = getEmsStyles(isDarkMode);

  const activeTab = tab || 'attendance';

  const goTo = (key) => navigate(`/dashboard/payroll/${key}`);

  const renderTab = () => {
    switch (activeTab) {
      case 'attendance':  return <AttendanceManager />;
      case 'import':      return <AttendanceImport />;
      case 'holidays':    return <HolidayManagement />;
      case 'rules':       return <ShiftAndLateRules />;
      case 'fineSlabs':   return <LateFineSlabs />;
      case 'salary':      return <SalaryAssignment />;
      case 'allowances':  return <AllowanceManager />;
      case 'fines':       return <FineManager />;
      case 'holdings':    return <><HoldingManager /><div className="mt-6"><HoldingRegister /></div></>;
      case 'process':     return <PayrollProcessing />;
      case 'slip':        return <SalarySlip />;
      case 'incentives':  return <IncentivePanel />;
      default:            return <AttendanceManager />;
    }
  };

  return (
    <div className="p-0">
      {/* Tab navigation */}
      <div className={styles.tabBar}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => goTo(key)}
            className={styles.tab(activeTab === key, isDarkMode)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="mt-8">
        {renderTab()}
      </div>
    </div>
  );
};

export default Payroll;
