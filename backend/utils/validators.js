const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10,15}$/;
const otpRegex = /^[0-9]{6}$/;

exports.validateEmail = (email) => {
  return typeof email === 'string' && emailRegex.test(email.trim());
};

exports.validatePhone = (phone) => {
  return typeof phone === 'string' && phoneRegex.test(phone.trim().replace(/\s+/g, ''));
};

exports.validateOtp = (otp) => {
  return typeof otp === 'string' && otpRegex.test(otp.trim());
};

exports.normalizePhone = (phone) => {
  return phone ? phone.trim().replace(/[^0-9+]/g, '') : '';
};
