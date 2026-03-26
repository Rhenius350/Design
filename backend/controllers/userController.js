const User = require('../models/User');

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    // Return users except the current user (useful for the "send money" dropdown)
    const users = await User.find({ _id: { $ne: req.user.id } }).select('name email mobile');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
}

const getUserByMobile = async (req, res) => {
  try {
    const { mobile } = req.params;
    const user = await User.findOne({ mobile }).select('name email mobile _id');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found with this mobile number' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getProfile, getAllUsers, getUserByMobile };
