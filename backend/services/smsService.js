const Twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;

const twilioClient = accountSid && authToken ? new Twilio(accountSid, authToken) : null;

exports.sendOtpSms = async (phone, otpCode) => {
  const text = `Your MedCare OTP code is ${otpCode}. It is valid for 5 minutes.`;

  if (!twilioClient || !fromNumber) {
    console.log(`\n[OTP SMS Fallback] to=${phone}, code=${otpCode}\n`);
    return { success: false, message: 'Twilio not configured. OTP logged to server console.' };
  }

  try {
    await twilioClient.messages.create({
      body: text,
      from: fromNumber,
      to: phone
    });
    return { success: true, message: 'OTP SMS sent successfully.' };
  } catch (error) {
    console.error('sendOtpSms error:', error);
    return { success: false, message: 'Failed to send OTP SMS, check Twilio configuration.' };
  }
};
