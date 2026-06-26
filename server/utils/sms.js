import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();
const client = twilio(
  process.env.TWILIO_SID,process.env.TWILIO_TOKEN// auth token from dashboard
);

export const sendOtp = async (phone, otp) => {
  return await client.messages.create({
    body: `Your OTP is ${otp}`,
    from: process.env.TWILIO_FROM,
    to: phone.startsWith("+") ? phone : `+91${phone}`  // force proper format
  });
};
export default client;