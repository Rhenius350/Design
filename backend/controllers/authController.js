const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};



const registerUser = async (req, res) => {
  const { name, email, password, mobile, pin } = req.body;

  if (!name || !email || !password || !pin) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const userExists = await User.findOne({ 
      $or: [
        { email },
        { mobile: mobile || 'NON_EXISTENT_MOBILE' }
      ]
    });
    if (userExists) {
      return res.status(400).json({ message: 'User with email or mobile already exists' });
    }

    const salt = await require('bcryptjs').genSalt(10);
    const hashedPassword = await require('bcryptjs').hash(password, salt);
    const hashedPin = await require('bcryptjs').hash(pin, salt);
    
    const userData = { name, email, password: hashedPassword, pin: hashedPin };
    if (mobile) userData.mobile = mobile;

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await require('bcryptjs').compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        balance: user.balance,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { registerUser, loginUser };
