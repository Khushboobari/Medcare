const rateLimit = require('express-rate-limit');

const destinationKeyGenerator = (req) => {
  if (req.body?.email) return req.body.email.toLowerCase();
  if (req.body?.phone) return req.body.phone.replace(/\s+/g, '');
  return req.ip;
};

const createJsonLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: destinationKeyGenerator,
    handler: (req, res) => {
      return res.status(429).json({
        success: false,
        message: message || 'Too many requests. Please try again later.'
      });
    }
  });
};

exports.authSendLimiter = createJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 6,
  message: 'Too many OTP requests, please wait 15 minutes and try again.'
});

exports.authVerifyLimiter = createJsonLimiter({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: 'Too many OTP verification attempts, please wait a few minutes.'
});
