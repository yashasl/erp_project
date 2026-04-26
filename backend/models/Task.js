const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  text:    { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String },
  priority:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  status:      { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  deadline:    { type: Date },
  project:     { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments:    [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
