const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { validateEmail, validatePhone, validateOtp } = require('../utils/validators');
const { sendOtpEmail } = require('../services/emailService');
const { sendOtpSms } = require('../services/smsService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET || 'medcare_jwt_secret_key_2026_xyz',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// In-Memory Database stores for mock fallback mode
let mockUsers = [
  {
    id: 'mock_admin_id_9999',
    _id: 'mock_admin_id_9999',
    name: 'Admin User',
    email: 'admin@medcare.com',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Admin',
    phone: '9988776655',
    bloodGroup: 'AB+',
    allergies: ['Penicillin'],
    addresses: [
      { id: 'addr_1', _id: 'addr_1', street: '12 Main St, Admin Quarter', city: 'Bangalore', state: 'Karnataka', zip: '560001', isDefault: true }
    ],
    familyMembers: [
      { id: 'fam_1', _id: 'fam_1', name: 'Sonia Verma', relation: 'Spouse', age: 32 }
    ]
  }
];
let mockOtps = [];

// Expose mock users for routes/api.js usage
global.mockUsersList = mockUsers;

const createOtpRecord = async ({ email, phone, otpCode }) => {
  const otpHash = await bcrypt.hash(otpCode, 12);
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await OTP.deleteMany({ email: email || null, phone: phone || null });
  return OTP.create({ email: email || null, phone: phone || null, otpHash, expiresAt });
};

const sendOtpToDestination = async ({ email, phone, otpCode }) => {
  if (phone) {
    return await sendOtpSms(phone, otpCode);
  }
  if (email) {
    return await sendOtpEmail(email, otpCode);
  }
  return { success: false, message: 'No destination configured for OTP delivery.' };
};

// Generate 6-digit OTP and send via email or SMS
exports.sendOtp = async (req, res) => {
  const { email, phone, fullName } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
  const normalizedPhone = phone ? phone.replace(/\D/g, '') : undefined;

  if (!normalizedEmail && !normalizedPhone) {
    return res.status(400).json({ success: false, message: 'Please provide an email address or phone number.' });
  }

  if (normalizedEmail && !validateEmail(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (normalizedPhone && !validatePhone(normalizedPhone)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid phone number with 10 to 15 digits.' });
  }

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const contactLabel = normalizedPhone ? normalizedPhone : normalizedEmail;

    if (global.isDbMock) {
      mockOtps = mockOtps.filter((o) => o.email !== normalizedEmail && o.phone !== normalizedPhone);
      mockOtps.push({ email: normalizedEmail, phone: normalizedPhone, otp: otpCode, expiresAt: new Date(Date.now() + 5 * 60 * 1000) });
      console.log(`\n======================================================`);
      console.log(`[MOCK OTP] destination=${contactLabel}`);
      console.log(`OTP CODE: ${otpCode}`);
      console.log(`======================================================\n`);
      return res.status(200).json({ success: true, message: 'OTP sent successfully (Mock Mode)', mockOtp: otpCode });
    }

    await createOtpRecord({ email: normalizedEmail, phone: normalizedPhone, otpCode });
    const delivery = await sendOtpToDestination({ email: normalizedEmail, phone: normalizedPhone, otpCode });

    if (!delivery.success) {
      return res.status(200).json({
        success: true,
        message: `OTP generated successfully. ${delivery.message}`,
        mockOtp: otpCode
      });
    }

    return res.status(200).json({ success: true, message: `OTP sent successfully to ${normalizedPhone ? 'phone' : 'email'}.` });
  } catch (error) {
    console.error('sendOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error while sending OTP' });
  }
};

// Verify OTP code
exports.verifyOtp = async (req, res) => {
  const { email, phone, otp } = req.body;
  const normalizedEmail = email ? email.trim().toLowerCase() : undefined;
  const normalizedPhone = phone ? phone.replace(/\D/g, '') : undefined;

  if (!normalizedEmail && !normalizedPhone) {
    return res.status(400).json({ success: false, message: 'Email or phone is required to verify OTP.' });
  }

  if (!validateOtp(otp)) {
    return res.status(400).json({ success: false, message: 'Enter a valid 6-digit OTP code.' });
  }

  if (normalizedEmail && !validateEmail(normalizedEmail)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
  }

  if (normalizedPhone && !validatePhone(normalizedPhone)) {
    return res.status(400).json({ success: false, message: 'Please provide a valid phone number.' });
  }

  try {
    if (global.isDbMock) {
      const record = mockOtps.find((o) => (normalizedEmail && o.email === normalizedEmail) || (normalizedPhone && o.phone === normalizedPhone));
      if (!record || record.otp !== otp || record.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      let user = mockUsers.find((u) => (normalizedEmail && u.email === normalizedEmail) || (normalizedPhone && u.phone === normalizedPhone));
      if (!user) {
        const defaultName = normalizedEmail ? normalizedEmail.split('@')[0] : `user${Date.now()}`;
        const role = mockUsers.length === 0 ? 'admin' : 'user';
        user = {
          id: 'mock_user_' + Date.now(),
          _id: 'mock_user_' + Date.now(),
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          email: normalizedEmail,
          phone: normalizedPhone,
          role,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`,
          addresses: [],
          familyMembers: [],
          allergies: []
        };
        mockUsers.push(user);
      }

      const token = generateToken(user);
      return res.status(200).json({ success: true, token, user });
    }

    const query = {};
    if (normalizedEmail) query.email = normalizedEmail;
    if (normalizedPhone) query.phone = normalizedPhone;

    const record = await OTP.findOne({ ...query, used: false }).sort({ expiresAt: -1 });
    if (!record) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired' });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }

    record.used = true;
    await record.save();

    let user = null;
    if (normalizedEmail) user = await User.findOne({ email: normalizedEmail });
    if (!user && normalizedPhone) user = await User.findOne({ phone: normalizedPhone });

    if (!user) {
      const defaultName = normalizedEmail ? normalizedEmail.split('@')[0] : `user${Date.now()}`;
      const userCount = await User.countDocuments({});
      const role = userCount === 0 ? 'admin' : 'user';
      user = await User.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: normalizedEmail,
        phone: normalizedPhone,
        role,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`
      });
    } else {
      let changed = false;
      if (!user.email && normalizedEmail) {
        user.email = normalizedEmail;
        changed = true;
      }
      if (!user.phone && normalizedPhone) {
        user.phone = normalizedPhone;
        changed = true;
      }
      if (changed) await user.save();
    }

    const token = generateToken(user);
    return res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error('verifyOtp error:', error);
    return res.status(500).json({ success: false, message: 'Server error verifying OTP' });
  }
};

// Google OAuth Login
exports.googleLogin = async (req, res) => {
  const { credential, email: mockEmail, name: mockName, avatar: mockAvatar } = req.body;

  try {
    let email = mockEmail || 'googleuser@medcare.com';
    let name = mockName || 'Google User';
    let avatar = mockAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=Google`;
    let googleId = 'mock_google_id_12345';

    if (!global.isDbMock && credential) {
      try {
        const ticket = await client.verifyIdToken({
          idToken: credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        email = payload.email;
        name = payload.name;
        avatar = payload.picture;
        googleId = payload.sub;
      } catch (err) {
        console.error("Real Google authentication failed, falling back to simulation parameters", err);
      }
    }

    if (global.isDbMock) {
      let user = mockUsers.find(u => u.email === email);
      if (!user) {
        user = {
          id: 'mock_google_' + Date.now(),
          _id: 'mock_google_' + Date.now(),
          name,
          email,
          googleId,
          avatar,
          role: 'user',
          addresses: [],
          familyMembers: [],
          allergies: []
        };
        mockUsers.push(user);
      }
      const token = generateToken(user);
      return res.status(200).json({ success: true, token, user });
    }

    // Real DB flow
    let user = await User.findOne({ email });
    if (!user) {
      const userCount = await User.countDocuments({});
      const role = userCount === 0 ? 'admin' : 'user';
      user = await User.create({ name, email, googleId, avatar, role });
    }
    const token = generateToken(user);
    res.status(200).json({ success: true, token, user });
  } catch (error) {
    console.error("googleLogin error:", error);
    res.status(500).json({ success: false, message: "Google auth failed", error: error.message });
  }
};

// Get current user details
exports.getMe = async (req, res) => {
  try {
    if (global.isDbMock) {
      const user = mockUsers.find(u => u.id === req.user.id || u._id === req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }
      return res.status(200).json({ success: true, user });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error retrieving profile" });
  }
};
