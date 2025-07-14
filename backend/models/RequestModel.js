const mongoose = require("mongoose");

const receipentSchema = new mongoose.Schema({

    fullname:{
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
    Emergency:{
        type: Boolean,
        default: false,
    },
    consent:{
        type: Boolean,
        required: true,
    }

});


module.exports = mongoose.model("Receipent", receipentSchema);