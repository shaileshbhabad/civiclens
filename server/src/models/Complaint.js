import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    trackingId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    category: {
      type: String,
      enum: ['pothole', 'garbage', 'drainage', 'streetlight', 'water_leak', 'other'],
      default: 'pothole',
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
    status: {
      type: String,
      enum: ['submitted', 'analysing', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected'],
      default: 'submitted',
      index: true
    },
    source: {
      type: String,
      default: 'community_qr'
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
      required: true,
      trim: true
    },
    ward: {
      type: String,
      default: 'PCMC Ward 12'
    },
    zone: {
      type: String,
      default: 'Zone A (PCMC)'
    },
    landmark: {
      type: String,
      default: ''
    },
    ai_analysis: {
      category: String,
      severity: String,
      urgency: String,
      confidence: { type: Number, default: 0.9 },
      imageValid: { type: Boolean, default: true },
      defectDetected: { type: Boolean, default: true },
      visualFeatures: { type: [String], default: [] },
      visualHazardScore: { type: Number, default: 70 },
      priorityScore: { type: Number, default: 65 },
      priorityFactors: {
        severityWeight: { type: Number, default: 25 },
        locationWeight: { type: Number, default: 20 },
        frequencyWeight: { type: Number, default: 12 },
        impactWeight: { type: Number, default: 5 },
        historyWeight: { type: Number, default: 3 }
      },
      matchedZone: { type: String, default: '' },
      modelUsed: { type: String, default: 'qwen/qwen3.8-27b' },
      explanation: String
    },
    incidentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Incident',
      default: null,
      index: true
    },
    // Cluster merging fields
    isMerged: {
      type: Boolean,
      default: false
    },
    mergeReason: {
      type: String,
      default: ''
    },
    mergedReportsCount: {
      type: Number,
      default: 1
    },
    // Resolution Tracking fields
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
      department: { type: String, default: '' },
      role: { type: String, default: '' }
    },
    // Citizen Dispute & Anti-Fake Resolution fields
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
    },
    citizenFeedback: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

complaintSchema.index({ location: '2dsphere' });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ ward: 1, status: 1 });
complaintSchema.index({ category: 1, severity: 1 });

export const Complaint = mongoose.model('Complaint', complaintSchema);
