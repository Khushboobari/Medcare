const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const https = require('https');
const User = require('../models/User');
const OTP = require('../models/OTP');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to sign JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET || 'medcare_jwt_secret_key_2026_xyz',
    { expiresIn: '7d' }
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

// Generate 6-digit OTP and send email via Brevo
exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    if (global.isDbMock) {
      // Mock DB: save OTP
      mockOtps = mockOtps.filter(o => o.email !== email);
      mockOtps.push({ email, otp: otpCode, expiresAt });
      
      console.log(`\n======================================================`);
      console.log(`[MOCK DB & BREVO] OTP FOR: ${email}`);
      console.log(`OTP CODE: ${otpCode}`);
      console.log(`Running in Mock DB Fallback mode.`);
      console.log(`======================================================\n`);

      return res.status(200).json({ 
        success: true, 
        message: "OTP sent successfully (Mock DB Mode - check console log)",
        mockOtp: otpCode
      });
    }

    // Real DB flow
    await OTP.deleteMany({ email });
    await OTP.create({ email, otp: otpCode, expiresAt });

    const brevoApiKey = process.env.BREVO_API_KEY;
    const isMock = !brevoApiKey || brevoApiKey === 'your_brevo_api_key';

    if (isMock) {
      console.log(`\n======================================================`);
      console.log(`[MOCK BREVO] SENDING OTP TO: ${email}`);
      console.log(`OTP CODE: ${otpCode}`);
      console.log(`======================================================\n`);

      return res.status(200).json({ 
        success: true, 
        message: "OTP sent successfully (Mock Mode - check console)",
        mockOtp: otpCode
      });
    }

    // Real Brevo Call
    const postData = JSON.stringify({
      sender: { name: "MedCare Store", email: process.env.BREVO_SENDER_EMAIL || "noreply@medcare.com" },
      to: [{ email }],
      subject: "Your MedCare Login OTP",
      htmlContent: `
        <div style="font-family: 'Poppins', sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #0066FF;">MedCare Verification</h2>
          <p>Use the following 6-digit OTP code to log in:</p>
          <div style="font-size: 24px; font-weight: bold; background: #f4f6fa; padding: 15px; text-align: center; color: #0066FF;">
            ${otpCode}
          </div>
        </div>
      `
    });

    const options = {
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': brevoApiKey,
        'content-type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => { data += chunk; });
      response.on('end', () => {
        if (response.statusCode >= 200 && response.statusCode < 300) {
          return res.status(200).json({ success: true, message: "OTP sent successfully to email" });
        } else {
          return res.status(500).json({ success: false, message: "Failed to send email via Brevo", fallbackOtp: otpCode });
        }
      });
    });

    request.on('error', (error) => {
      return res.status(500).json({ success: false, message: "Failed to send OTP", fallbackOtp: otpCode });
    });

    request.write(postData);
    request.end();

  } catch (error) {
    console.error("sendOtp error:", error);
    res.status(500).json({ success: false, message: "Server error while sending OTP" });
  }
};

// Verify OTP code
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    if (global.isDbMock) {
      const record = mockOtps.find(o => o.email === email && o.otp === otp);
      if (!record) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }

      // Check expiry
      if (record.expiresAt < new Date()) {
        return res.status(400).json({ success: false, message: "OTP has expired" });
      }

      // Find or create in-memory User
      let user = mockUsers.find(u => u.email === email);
      if (!user) {
        const defaultName = email.split('@')[0];
        // If first user, make admin, otherwise user
        const role = mockUsers.length === 0 ? 'admin' : 'user';
        user = {
          id: 'mock_user_' + Date.now(),
          _id: 'mock_user_' + Date.now(),
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          email,
          role,
          avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`,
          addresses: [],
          familyMembers: [],
          allergies: []
        };
        mockUsers.push(user);
      }

      const token = generateToken(user);
      return res.status(200).json({
        success: true,
        token,
        user
      });
    }

    // Real DB flow
    const record = await OTP.findOne({ email, otp, used: false });
    if (!record) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    record.used = true;
    await record.save();

    let user = await User.findOne({ email });
    if (!user) {
      const defaultName = email.split('@')[0];
      const userCount = await User.countDocuments({});
      const role = userCount === 0 ? 'admin' : 'user';
      user = await User.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email,
        role,
        avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${defaultName}`
      });
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ success: false, message: "Server error verifying OTP" });
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
