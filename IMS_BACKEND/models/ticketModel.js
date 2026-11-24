const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
  completedAt: {
    type: Date,
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: true });

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    default: 'Staff Member',
  },
  userRole: {
    type: String,
    default: 'Staff',
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  isInternal: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  performedByName: {
    type: String,
    default: 'System',
  },
  details: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: true });

const ticketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a ticket title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a ticket description'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Please select a department'],
      trim: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      default: null,
    },
    assignedToName: {
      type: String,
      default: '',
    },
    assignedToEmail: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdByName: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Under Review', 'Pending', 'Resolved', 'Closed'],
      default: 'Open',
      index: true,
    },
    category: {
      type: String,
      enum: ['Task', 'Bug', 'Support', 'Inquiry', 'Maintenance', 'Document Request', 'Approval', 'Other'],
      default: 'Task',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    estimatedHours: {
      type: Number,
      default: 0,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    subtasks: [subtaskSchema],
    comments: [commentSchema],
    activityLog: [activityLogSchema],
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'tickets',
  }
);

// Pre-save hook to generate ticketNumber if not present
ticketSchema.pre('save', async function (next) {
  if (!this.ticketNumber) {
    const count = await mongoose.model('Ticket').countDocuments();
    const nextNum = 1001 + count;
    this.ticketNumber = `TKT-${nextNum}`;
  }
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
