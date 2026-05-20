import mongoose, { Schema } from 'mongoose';

const contactMessageSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
