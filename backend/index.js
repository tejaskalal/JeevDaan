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
    return res.status(200).json({ success: true, message: "Login successful" ,token: "your-token", userId: user._id  });
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
      consent,
      read: false 
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
    organType,
    bloodGroup,
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
      organType,
      bloodGroup,
      location,
      pincode,
      medicalCondition,
      Emergency,
      consent,
      read: false 
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
    const receipents = await Receipent.find();
    const donors = await Donor.find();

    const requestNotifications = receipents.map((item) => ({
      id: item.id,
      type: "request",
      fullname: item.fullname,
      phone: item.phone,
      email: item.email,
      lookingFor: item.lookingFor,
      bloodGroup: item.bloodGroup,
      organType: item.organType,
      location: item.location,
      pincode: item.pincode,
      medicalCondition: item.medicalCondition,
      emergency: item.Emergency,
      createdAt: item.createdAt,
      read: item.read || false,
    }));

    const donationNotifications = donors.map((item) => ({
      id: item.id,
      type: "donation",
      fullName: item.fullName,
      phone: item.phone,
      email: item.email,
      bloodGroup: item.bloodGroup,
      organs: item.organs,
      isAvailableForBlood: item.isAvailableForBlood,
      isAvailableForOrgan: item.isAvailableForOrgan,
      location: item.location,
      pincode: item.pincode,
      medicalConditions: item.medicalConditions,
      createdAt: item.createdAt,
      read: item.read || false,
    }));

    const combined = [...requestNotifications, ...donationNotifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json(combined);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error fetching notifications" });
  }
});


app.put('/notifications/mark-read', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    await Receipent.updateMany(
      { readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    await Donor.updateMany(
      { readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    res.json({ message: "All notifications marked as read for this user." });
  } catch (error) {
    console.error("Mark-read error:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});




app.get('/notifications/unread-count', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const unreadRequests = await Receipent.countDocuments({
      readBy: { $ne: userId }
    });

    const unreadDonations = await Donor.countDocuments({
      readBy: { $ne: userId }
    });

    const totalUnread = unreadRequests + unreadDonations;

    res.json({ totalUnread });
  } catch (error) {
    console.error("Unread-count error:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
  }
});


app.patch('/notifications/mark-read', async (req, res) => {
  const { userId } = req.body;
  try {
    await Notification.updateMany(
      { readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } } 
    );
    res.status(200).json({ message: 'Notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
