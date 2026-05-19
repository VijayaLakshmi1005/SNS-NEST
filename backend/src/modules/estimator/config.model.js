import mongoose from 'mongoose';

const estimatorConfigSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'pricing_rules'
  },
  baseRoomCosts: {
    type: Map,
    of: Number,
    required: true
  },
  cityMultipliers: {
    type: Map,
    of: Number,
    required: true
  },
  materialMultipliers: {
    type: Map,
    of: Number,
    required: true
  },
  packageMultipliers: {
    type: Map,
    of: Number,
    required: true
  },
  bhkBaseSqFt: {
    type: Map,
    of: Number,
    required: true
  },
  packages: [{
    name: String,
    tagline: String,
    multiplier: Number,
    warranty: String,
    materials: String,
    furniture: String,
    decor: String,
    installation: String,
    benefits: [String]
  }],
  materials: [{
    category: String,
    options: [{
      grade: String,
      description: String
    }]
  }]
}, {
  timestamps: true
});

export const EstimatorConfig = mongoose.model('EstimatorConfig', estimatorConfigSchema);
