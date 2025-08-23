import mongoose from "mongoose";

const QueueSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  queueNumber: { type: Number, required: true },
  status: {
    type: String,
    enum: ["waiting", "serving", "done", "cancelled"],
    default: "waiting",
  },
  createdAt: { type: Date, default: Date.now },
  servedAt: { type: Date },
});

export default mongoose.models.Queue || mongoose.model("Queue", QueueSchema);
