import mongoose, { Schema } from 'mongoose';

const scanHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  content: { type: String, required: true },
  isSpam: { type: Boolean, required: true },
  spamScore: { type: Number, required: true },
  matchedKeywords: { type: [String], default: [] },
  executionTime: { type: Number, required: true }, // in milliseconds
  createdAt: { type: Date, default: Date.now }
});

export const ScanHistory = mongoose.model('ScanHistory', scanHistorySchema);
