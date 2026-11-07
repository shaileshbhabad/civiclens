import mongoose from 'mongoose';

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['pothole', 'garbage', 'drainage', 'streetlight', 'water_leak', 'other'],
      required: true,
      index: true
    },
    severity: {
      type: String,
      enum: ['critical', 'high', 'medium', 'low'],
      default: 'medium',
      index: true
    },
    urgency: {
      type: String,
      enum: ['immediate', 'within_24h', 'within_3d', 'routine'],
      default: 'within_24h'
    },
    priorityScore: {
      type: Number,
      default: 50,
      index: -1 // Sorted high to low
    },
    priorityFactors: {
      severityWeight: { type: Number, default: 25 },
      locationWeight: { type: Number, default: 20 },
      frequencyWeight: { type: Number, default: 20 },
      impactWeight: { type: Number, default: 15 },
      historyWeight: { type: Number, default: 10 }
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true
      }
    },
    address: {
      type: String,
      required: true
    },
    ward: {
      type: String,
      default: 'PCMC Ward 12'
    },
    zone: {
      type: String,
      default: 'Zone A (PCMC)'
    },
    complaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint'
      }
    ],
    reportCount: {
      type: Number,
      default: 1
    },
    department: {
      type: String,
      required: true,
      index: true
    },
    assignedTo: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      department: { type: String, default: '' },
      assignedAt: { type: Date, default: null }
    },
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    // Resolution tracking
    resolutionNotes: {
      type: String,
      default: ''
    },
    resolutionImage: {
      type: String,
      default: ''
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    resolvedBy: {
      name: { type: String, default: '' },
      department: { type: String, default: '' }
    },
    // Citizen Dispute & Re-open escalation fields
    disputed: {
      type: Boolean,
      default: false
    },
    disputeReason: {
      type: String,
      default: ''
    },
    disputeImage: {
      type: String,
      default: ''
    },
    reopenedCount: {
      type: Number,
      default: 0
    },
    reopenedAt: {
      type: Date,
      default: null
    },
    citizenVerified: {
      type: Boolean,
      default: false
    },
    citizenRating: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

incidentSchema.index({ location: '2dsphere' });
incidentSchema.index({ priorityScore: -1, status: 1 });
incidentSchema.index({ department: 1, status: 1 });
incidentSchema.index({ status: 1, updatedAt: -1 });

export const Incident = mongoose.model('Incident', incidentSchema);
