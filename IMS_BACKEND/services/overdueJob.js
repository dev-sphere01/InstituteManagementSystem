/**
 * overdueJob.js — Section D
 * Scheduled job: marks installments Overdue, sends in-app notifications,
 * and escalates after a configurable number of overdue days.
 *
 * Pluggable notification channel: add SMS/email adapters by implementing
 * the NotificationChannel interface and adding to CHANNELS array.
 */
const Installment = require('../models/installment');
const ApplicationFinance = require('../models/applicationFinance');
const AdmissionDetails = require('../models/admission');
const Task = require('../models/task');

const ESCALATION_DAYS = parseInt(process.env.ESCALATION_DAYS || '7', 10);
const OVERDUE_REMINDER_DAYS = parseInt(process.env.OVERDUE_REMINDER_DAYS || '1', 10);

/**
 * Pluggable notification channel interface.
 * Each channel must implement send({ student, installment, type }).
 */
const InAppChannel = {
  name: 'inapp',
  async send({ student, installment, type }) {
    console.log(`[NOTIFICATION:INAPP] ${type} — Student: ${student?.fullName || student?._id} | EMI #${installment.installmentNo} | Due: ${installment.dueDate}`);
  }
};

// Stubs for future channels (SMS, WhatsApp, Email):
const SMSChannel = {
  name: 'sms',
  async send({ student, installment, type }) {
    console.log(`[NOTIFICATION:SMS-STUB] ${type} — ${student?.contactNumber}`);
  }
};

const WhatsAppChannel = {
  name: 'whatsapp',
  async send({ student, installment, type }) {
    console.log(`[NOTIFICATION:WHATSAPP-STUB] ${type} — ${student?.contactNumber}`);
  }
};

const EmailChannel = {
  name: 'email',
  async send({ student, installment, type }) {
    console.log(`[NOTIFICATION:EMAIL-STUB] ${type} — ${student?.emailAddress}`);
  }
};

// Active channels — pluggable array
const CHANNELS = [InAppChannel, SMSChannel, WhatsAppChannel, EmailChannel];

/** Dispatch a notification through all active channels */
async function notify(payload) {
  for (const channel of CHANNELS) {
    try {
      await channel.send(payload);
    } catch (err) {
      console.error(`[overdueJob] Channel ${channel.name} failed:`, err.message);
    }
  }
}

/**
 * Main job function — run once per day or on trigger.
 */
async function runOverdueJob() {
  const now = new Date();
  console.log('[overdueJob] Running at', now.toISOString());

  // 1. Find all unpaid / partial installments past their due date
  const overdueInstallments = await Installment.find({
    status: { $in: ['Pending', 'Partial', 'Overdue'] },
    dueDate: { $lt: now }
  });

  for (const inst of overdueInstallments) {
    // Load finance + admission for context
    const finance = await ApplicationFinance.findById(inst.financeId);
    if (!finance) continue;
    const student = await AdmissionDetails.findById(finance.targetId);

    const daysPast = Math.floor((now - new Date(inst.dueDate)) / (24 * 60 * 60 * 1000));

    // Mark installment Overdue
    inst.status = 'Overdue';
    inst.overdueCount = (inst.overdueCount || 0) + 1;

    // Find Fee Collection task for this student
    const feeTask = await Task.findOne({
      studentId: finance.targetId,
      taskName: 'Fee Collection',
      status: { $ne: 'completed' }
    });

    if (daysPast >= ESCALATION_DAYS) {
      if (!inst.escalatedAt) {
        inst.escalatedAt = now;
        // Escalate the admission lifecycle if active
        if (student) {
          student.lifecycleStatus = 'OnHold';
          student.lifecycleStatusReason = `EMI #${inst.installmentNo} overdue by ${daysPast} days`;
          student.lifecycleStatusChangedAt = now;
          await student.save();
        }

        // Update workflow task to escalated (feeds "Escalated" card)
        if (feeTask) {
          feeTask.status = 'escalated';
          feeTask.remarks.push({
            text: `[Auto-Escalated] EMI #${inst.installmentNo} overdue by ${daysPast} days (Exceeded ${ESCALATION_DAYS} days threshold)`,
            by: 'System'
          });
          await feeTask.save();
        }

        await notify({ student, installment: inst, type: 'ESCALATED' });
      }
    } else {
      // Mark workflow task to overdue (feeds "Overdue" card)
      if (feeTask && feeTask.status !== 'escalated') {
        feeTask.status = 'overdue';
        await feeTask.save();
      }

      // Reminder dispatch
      const lastNotified = inst.overdueNotifiedAt ? new Date(inst.overdueNotifiedAt) : null;
      const daysSinceNotified = lastNotified
        ? Math.floor((now - lastNotified) / (24 * 60 * 60 * 1000))
        : OVERDUE_REMINDER_DAYS + 1;

      if (daysSinceNotified >= OVERDUE_REMINDER_DAYS) {
        inst.overdueNotifiedAt = now;
        await notify({ student, installment: inst, type: 'OVERDUE_REMINDER' });
      }
    }

    await inst.save();
  }

  console.log(`[overdueJob] Processed ${overdueInstallments.length} overdue installments.`);
}

module.exports = { runOverdueJob, notify, CHANNELS };
