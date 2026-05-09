# Leave Management System - Technical Specification Document

## 1. Document Overview

**Project Name:** Leave Management System (LMS)  
**Version:** 1.0  
**Date:** November 7, 2025  
**Organization:** Chandrakala Universal Pvt Ltd

### 1.1 Purpose

This document provides detailed technical specifications for developing a comprehensive Leave Management System integrated with attendance tracking and punch management.

### 1.2 Scope

The system will automate leave application, approval workflows, attendance tracking, punch regularization, leave accrual, encashment processing, and reporting for all employee categories.

---

## 2. System Architecture

### 2.1 High-Level Architecture

- **Presentation Layer:** Web-based responsive UI, Mobile-responsive interface
- **Application Layer:** Business logic, workflow engine, notification service
- **Data Layer:** Relational database for transactional data
- **Integration Layer:** APIs for third-party integrations (biometric systems, payroll)

### 2.2 Technology Stack (Recommended)

- **Frontend:** React.js
- **Backend:** C#, ASP.NET Core
- **Database:** MySQL
- **Authentication:** JWT
- **Notification:** Email (SMTP) (TBD)
- **Hosting:** On-premise

---

## 3. Functional Requirements

### 3.1 Attendance & Punch Management Module

#### 3.1.1 Punch Data Capture

**FR-001:** System shall capture employee punch-in and punch-out timestamps with date, time, and location (Through Attendance Software).

**FR-002:** System shall integrate with biometric devices/card readers via API or database sync (For Research).

**FR-003:** System shall support manual punch entry for authorized users (HR only) with audit trail.

#### 3.1.2 Punch Status Categories

**FR-004:** System shall categorize employees into:
- Regular punch required
- No punch required (flagged by HR with management approval)
- Shift-based/rotational duties

**FR-005:** System shall flag incomplete punches:
- Missing punch-in
- Missing punch-out
- Insufficient working hours

**FR-006:** System shall automatically mark incomplete punch days as "Absent" and highlight in red on attendance calendar.

#### 3.1.3 Punch Regularization

**FR-007:** Managers can initiate punch regularization requests with justification.

**FR-008:** Only HR Department can approve punch regularization requests.

**FR-009:** System shall maintain complete audit log of all regularization requests with timestamps and approvers.

**FR-010:** Employees must apply for leave/on-duty against missed punch days within 2 working days, otherwise marked as unpaid leave.

#### 3.1.4 Working Hours Configuration

**FR-011:** System shall allow HR to configure:
- Minimum daily working hours (e.g., 8 hours)
- Grace periods for late arrival/early departure
- Overtime calculation rules

---

### 3.2 Leave Types Management

#### 3.2.1 Calendar Paid Leaves (Public Holidays)

**FR-012:** HR shall upload annual holiday calendar (8-10 holidays) in December for next year.

**FR-013:** System shall support bulk upload via CSV/Excel with fields: Date, Holiday Name, Description.

**FR-014:** HR shall have ability to add ad-hoc holidays (elections, emergencies) with immediate effect.

**FR-015:** Holiday calendar shall be visible to all employees in their dashboard.

**FR-016:** System shall automatically exclude public holidays from leave balance calculations.

#### 3.2.2 Weekly Off Management

**FR-017:** Default weekly off: Sunday for standard employees.

**FR-018:** System shall support custom weekly off assignment for shift/rotational employees.

**FR-019:** HR/Manager shall assign different weekly off patterns per employee with effective dates.

**FR-020:** System shall display weekly off schedule in employee attendance calendar.

#### 3.2.3 Earned Leave (EL)

**FR-021:** Earned Leave applicable only to full-time confirmed employees.

**FR-022:** System shall block EL accrual for:
- Probationary employees
- Apprentices
- Short-term employment
- Contractual employees

**FR-023:** Accrual Rule: 1 EL credited for every 20 full calendar days present and working.

**FR-024:** "Calendar Days" include Sundays and public holidays in calculation.

**FR-025:** System shall calculate EL accrual automatically on daily basis.

**FR-026:** Fractional leaves shall not accrue; minimum unit is 1 day.

**FR-027:** Employees can only avail EL after it has been earned and credited (no negative balance).

**FR-028:** EL application requires mandatory advance entry and manager approval.

**FR-029:** Managers can apply EL on behalf of employees without system access.

**FR-030:** Year-End Encashment:
- System shall automatically process encashment of all un-availed EL in December
- Payment calculated at basic salary rate
- Encashment processed with January 6th salary payout
- New calendar year starts with 0 EL balance

**FR-031:** System shall generate encashment report with employee ID, EL balance, basic salary, and encashment amount.

#### 3.2.4 Special Medical Leave (Unpaid)

**FR-032:** Special Medical Leave applicable in emergencies at management discretion.

**FR-033:** Employee must exhaust all accrued leaves before applying.

**FR-034:** System shall validate available leave balance before allowing application.

**FR-035:** Requires mandatory manager AND management approval.

**FR-036:** Only HR Manager can create Special Medical Leave in system after approvals.

**FR-037:** Maximum duration: 2 weeks per request.

**FR-038:** System shall calculate salary deduction for special medical leave period.

**FR-039:** Separate workflow for Special Medical Leave with multi-level approval.

#### 3.2.5 Maternity Leave (ML)

**FR-040:** Applicable to all female employees (permanent, probationary, contractual) who worked minimum 80 days in preceding 12 months.

**FR-041:** Leave Duration Matrix:
- First two children: 26 weeks (182 days) paid leave
- Third child onwards: 12 weeks paid leave
- Adoption (child < 3 months): 12 weeks paid leave
- Surrogacy (commissioning mother): 12 weeks paid leave
- Miscarriage/Medical Termination: 6 weeks paid leave
- Tubectomy: 2 weeks paid leave

**FR-042:** Leave can start up to 8 weeks before expected delivery date.

**FR-043:** 182 days include all weekly offs and holidays during leave period.

**FR-044:** Application Process:
- Submit written application/email to manager and HR
- Attach medical certificate with expected delivery date
- Minimum 8 weeks advance notice

**FR-045:** Both Manager AND HR must approve in system.

**FR-046:** System shall track maternity leave count per employee (1st, 2nd, 3rd child).

**FR-047:** Extensions beyond statutory entitlement marked as unpaid leave.

**FR-048:** System shall validate eligibility (80 days worked) before allowing application.

---

### 3.3 Leave Application & Approval Workflow

#### 3.3.1 Leave Application

**FR-049:** Employees shall apply leave through system with:
- Leave type
- Start date and end date
- Number of days
- Reason/comments
- Attachment option for medical certificates

**FR-050:** System shall auto-calculate leave days excluding/including weekly offs and holidays based on leave type.

**FR-051:** System shall validate available leave balance before submission.

**FR-052:** System shall prevent overlapping leave applications.

**FR-053:** System shall show attendance calendar with punch status while applying leave.

#### 3.3.2 Approval Workflow

**FR-054:** Standard approval: Reporting Manager approval required.

**FR-055:** Maternity Leave: Manager + HR approval required.

**FR-056:** Special Medical Leave: Manager + Management + HR approval required.

**FR-057:** System shall send email/SMS notifications to approvers.

**FR-058:** Approvers shall have option to Approve, Reject, or Request More Information.

**FR-059:** System shall maintain approval hierarchy and escalation rules.

**FR-060:** Auto-escalation if no action taken within configured time (e.g., 48 hours).

#### 3.3.3 Unapproved Leave Handling

**FR-061:** Leaves taken without prior approval marked as "Unauthorized Absence/Absconding".

**FR-062:** System shall flag unauthorized absences for disciplinary action.

**FR-063:** Unplanned leaves not approved result in automatic salary deduction.

**FR-064:** System shall track unauthorized absence count per employee.

#### 3.3.4 Leave Combination Rules

**FR-065:** System shall allow combining different leave types subject to approval.

**FR-066:** EL can be prefixed/suffixed with holidays with manager approval.

**FR-067:** Intervening holidays during approved EL counted as part of leave.

**FR-068:** System shall calculate total leave duration including intervening holidays.

---

### 3.4 Dashboard & Reporting

#### 3.4.1 Employee Dashboard

**FR-069:** Display current leave balances by type (EL, ML, etc.).

**FR-070:** Show attendance calendar with:
- Present days (green)
- Absent days (red)
- Leave days (blue)
- Holidays (grey)
- Incomplete punch days (red with flag)

**FR-071:** Display pending leave applications status.

**FR-072:** Show upcoming holidays and team calendar.

**FR-073:** Quick apply leave option with calendar selector.

#### 3.4.2 Manager Dashboard

**FR-074:** View team attendance summary.

**FR-075:** Pending leave approvals with one-click approve/reject.

**FR-076:** Team leave calendar showing who's on leave.

**FR-077:** Punch regularization requests pending approval.

**FR-078:** Team leave balance summary.

#### 3.4.3 HR Dashboard

**FR-079:** Organization-wide attendance summary.

**FR-080:** Leave trend analysis and reports.

**FR-081:** Employee leave balance report.

**FR-082:** Encashment processing dashboard for year-end.

**FR-083:** Maternity leave tracking and compliance report.

**FR-084:** Unauthorized absence report.

**FR-085:** Punch regularization audit report.

#### 3.4.4 Standard Reports

**FR-086:** Monthly attendance register (employee-wise).

**FR-087:** Leave application report (by type, status, department).

**FR-088:** Leave balance report (current balances).

**FR-089:** Encashment calculation report (year-end).

**FR-090:** Salary deduction report (unpaid leaves).

**FR-091:** Compliance reports (maternity leave, working hours).

**FR-092:** All reports exportable to Excel/PDF.

---

### 3.5 User Roles & Permissions

#### 3.5.1 Roles

**FR-093:** System shall support following roles:
- **Employee:** Apply leave, view own records, regularize punch
- **Manager:** Approve team leaves, view team reports, initiate regularization
- **HR Manager:** Full system access, configure settings, approve special leaves
- **HR Admin:** Upload holidays, manage employee flags, run reports
- **System Admin:** User management, system configuration, audit logs

#### 3.5.2 Permission Matrix

**FR-094:** Role-based access control (RBAC) implementation.

**FR-095:** HR-only permissions:
- Flag employees as "no punch required"
- Approve punch regularization
- Create special medical leave
- Upload holiday calendar
- Process year-end encashment
- Assign shift patterns

**FR-096:** Manager permissions:
- View and approve team leaves
- Initiate punch regularization for team
- Apply leave on behalf of team members without system access
- View team attendance and reports

---

### 3.6 Notifications & Alerts

**FR-097:** Email notifications for:
- Leave application submitted (to manager)
- Leave approved/rejected (to employee)
- Punch regularization pending (to HR)
- Incomplete punch alerts (to employee and manager)
- Leave balance low (to employee)
- Year-end encashment processed (to employee)

**FR-098:** SMS notifications for critical alerts (optional).

**FR-099:** In-app notifications visible in dashboard.

**FR-100:** Configurable notification templates by HR.

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-001:** System shall support 1000+ concurrent users.

**NFR-002:** Page load time < 3 seconds for 95% of requests.

**NFR-003:** Leave application submission response time < 2 seconds.

**NFR-004:** Daily attendance processing batch job completion within 30 minutes.

**NFR-005:** Year-end encashment processing for 5000 employees within 1 hour.

### 4.2 Security

**NFR-006:** Role-based access control (RBAC) for all modules.

**NFR-007:** Data encryption in transit (TLS 1.2+) and at rest.

**NFR-008:** Secure password policy: minimum 8 characters, complexity requirements.

**NFR-009:** Session timeout after 30 minutes of inactivity.

**NFR-010:** Audit logging for all critical operations (approvals, deletions, modifications).

**NFR-011:** Regular security patches and vulnerability assessments.

### 4.3 Scalability

**NFR-012:** Horizontal scalability to support growing employee base.

**NFR-013:** Database partitioning for historical data (> 2 years).

**NFR-014:** Support for multi-location/multi-company structure.

### 4.4 Availability

**NFR-015:** System uptime 99.5% during business hours (8 AM - 8 PM).

**NFR-016:** Scheduled maintenance windows communicated 48 hours in advance.

**NFR-017:** Data backup daily with 30-day retention.

**NFR-018:** Disaster recovery plan with RTO (Recovery Time Objective) < 4 hours.

### 4.5 Usability

**NFR-019:** Responsive design supporting desktop, tablet, and mobile devices.

**NFR-020:** Intuitive UI requiring minimal training.

**NFR-021:** Multi-language support (English, Hindi - optional).

### 4.6 Compliance

**NFR-023:** Compliance with Maternity Benefit Act, 1961.

**NFR-024:** Compliance with labor laws for working hours and weekly offs.

**NFR-025:** Data privacy compliance (data residency requirements).