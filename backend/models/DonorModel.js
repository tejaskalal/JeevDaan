const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 18,
      max: 65,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: ["A+", "A−", "B+", "B−", "O+", "O−", "AB+", "AB−"],
      required: true,
    },
    organs: {
      type: [String],
      enum: ["Kidney", "Liver", "Heart", "Lung", "Pancreas"],
      default: [],
    },

    isAvailableForBlood: {
      type: Boolean,
      default: false,
    },
    isAvailableForOrgan: {
      type: Boolean,
      default: false,
    },

    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    location: {
      type: String,
    },
    pincode: {
      type: String,
    },
    medicalConditions: {
      type: String,
      default: "",
    },
    consent: {
      type: Boolean,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "matched", "completed"],
      default: "pending",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donor", donorSchema);