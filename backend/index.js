const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const User = require('./models/UserModel');
const Donor = require('./models/DonorModel');
const Receipent = require('./models/RequestModel');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('MongoDB connection error:', err);
});

app.get('/', (req, res) => {
  res.send('Welcome to JeevDan Backend!');
});

app.post('/signup', async (req, res) => {
  const { email, username, password } = req.body;

  if (!email || !username || !password) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const newUser = new User({ email, username, password });
    await newUser.save();

    return res.status(201).json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});



app.post('/login', async (req, res) => {
  const { username, password } = req.body;  
    if (!username || !password) {
        return res.status(400).json({ success: false, message: "Username and password are required" });
    }
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Invalid credentials" });
        }
        return res.status(200).json({ success: true, message: "Login successful" });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
});   


app.post('/donate', async (req, res) => {
  const {
    fullName,
    age,
    gender,
    bloodGroup,
    organs,
    phone,
    email,
    location,
    pincode,
    medical,
    isBloodAvailable,
    isOrganAvailable,
    consent
  } = req.body;

  if (!fullName || !age || !gender || !bloodGroup || !organs || !phone) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }

  try {
    const donation = new Donor({
      fullName,
      age,
      gender,
      bloodGroup,
      organs,
      phone,
      email,
      location,
      pincode,
      medical,
      isBloodAvailable,
      isOrganAvailable,
      consent
    });

    await donation.save();

    return res.status(201).json({ success: true, message: "Donation submitted successfully" });
  } catch (err) {
    console.error("Donation error:", err);
    return res.status(500).json({ success: false, message: "Server error while submitting donation" });
  }
});

app.post('/request', async (req, res) => {
  const { 
    fullname,
    phone,
    email,
    lookingFor,
    location,
    pincode,
    medicalCondition,
    Emergency,
    consent
  } = req.body; 
  if (!fullname || !phone || !lookingFor || !location || !pincode || !medicalCondition || consent === undefined) {
    return res.status(400).json({ success: false, message: "Required fields missing" });
  }
  try {
    const request = new Receipent({
      fullname,
      phone,
      email,
      lookingFor,
      location,
      pincode,
      medicalCondition,
      Emergency,
      consent
    });

    await request.save();

    return res.status(201).json({ success: true, message: "Help request submitted successfully" });
  } catch (err) {
    console.error("Request error:", err);
    return res.status(500).json({ success: false, message: "Server error while submitting help request" });
  }
});


app.get('/notifications', async (req, res) => {
  try {
    const emergencies = await Receipent.find({});
    res.status(200).json(emergencies);
  } catch (err) {
    console.error("Error fetching emergencies:", err);
    res.status(500).json({ message: "Server error fetching emergencies" });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
