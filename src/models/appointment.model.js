import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentType: {
      type: String,
      enum: ["in-store", "off-site"],
      required: [true, "Appointment type is required."],
    },
    serviceType: {
      type: String,
      enum: ["ซ่อมมือถือ", "ซื้อขายมือถือ", "จำนำมือถือ", "จำนำไอคลาวด์", "รีไฟแนนซ์", "อื่นๆ"],
      required: [true, "Service type is required."],
    },
    branch: {
      type: String,
      // Consider using an enum if you have a fixed list of branches
      // enum: ["สาขาหลัก", "สาขารอง", "สาขา A"],
    },
    locationDetails: {
      type: String,
      // This field is only required if the appointment is 'off-site'
      required: function () {
        return this.appointmentType === "off-site";
      },
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required."],
      trim: true, // Automatically remove whitespace from start and end
    },
    customerPhone: {
      type: String,
      required: [true, "Customer phone number is required."],
      trim: true,
    },
    appointmentAt: {
      type: Date,
      required: [true, "Appointment date and time are required."],
      index: true, // Add index for faster date-based queries
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    lineUserId: {
      type: String,
      required: [true, "LINE User ID is required for authentication."],
      index: true, // Add index for fast lookups by user
    },
    lineDisplayName: String,
    lineProfilePicUrl: String,
    depositSlipUrl: String, // URL to the uploaded image
  },
  {
    timestamps: true, // Mongoose will manage createdAt and updatedAt
  }
);

// This prevents Mongoose from recompiling the model if it already exists
const Appointment = mongoose.models.Appointment || mongoose.model("Appointment", appointmentSchema);

export default Appointment;
