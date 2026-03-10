const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'active', 'ended', 'cancelled'],
    default: 'draft',
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  airdropPoolFry: {
    type: Number,
    default: 0,
  },
  airdropDistribution: {
    type: String,
    enum: ['proportional', 'tiered'],
    default: 'proportional',
  },
  airdropTiers: [{
    rank: { type: Number },
    rankEnd: { type: Number },
    rewardFry: { type: Number },
  }],
  minPointsToQualify: {
    type: Number,
    default: 0,
  },
  autoSchedule: {
    enabled: { type: Boolean, default: false },
    templateName: { type: String },
    recurrence: { type: String, enum: ['daily', 'weekly', 'biweekly', 'monthly'] },
    nextRunDate: { type: Date },
  },
  createdBy: {
    type: String,
  },
  bannerImage: {
    type: String,
  },
  totalParticipants: {
    type: Number,
    default: 0,
  },
  lastPointsUpdate: {
    type: Date,
  },
}, { timestamps: true });

eventSchema.index({ status: 1, startDate: 1, endDate: 1 });

const Event = mongoose.model("Event", eventSchema, "events");
module.exports = Event;
