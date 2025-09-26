const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema(
  {
    eventId: { type: String, trim: true, default: "" },
    gig: { type: String, default: "", trim: true },

    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },

    type: { type: String, required: true, enum: ["std", "fan", "vip"] },
    count: { type: Number, required: true, min: 1, max: 6 },

    status: {
      type: String,
      default: "pending",
      enum: ["pending", "confirmed", "cancelled"],
    },
  },
  { timestamps: true }
);

// Захист від повторної реєстрації моделі
module.exports = mongoose.models.Order || model("Order", orderSchema);
