const mongoose = require("mongoose");

const receipentSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    default: "",
  },
  lookingFor: {
    type: String,
    enum: ["Blood", "Organ"],
    required: true,
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
  },
  organType: {
    type: String, 
  },
  location: {
    type: String,
    required: true,
  },
  pincode: {
    type: String,
    required: true,
  },
  medicalCondition: {
    type: String,
    required: true,
  },
  Emergency: {
    type: Boolean,
    default: false,
  },
  consent: {
    type: Boolean,
    required: true,
  },
  readBy: [{
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Receipent", receipentSchema);
