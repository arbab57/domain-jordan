const nodemailer = require('nodemailer');

const newBookingAdminHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Booking Notification</title>
</head>
<body>
    <h1>New Booking Received!</h1>
    <p>Hello Admin,</p>
    <p>A new booking has been made on your platform.</p>
    <p><strong>Booking Details:</strong></p>
    <ul>
        <li><strong>Booking ID:</strong> {{bookingId}}</li>
        <li><strong>Property:</strong> {{propertyName}}</li>
        <li><strong>Guest Name:</strong> {{guestName}}</li>
        <li><strong>Check-In Date:</strong> {{checkInDate}}</li>
        <li><strong>Check-Out Date:</strong> {{checkOutDate}}</li>
    </ul>
    <p>Please log in to the admin panel to view and manage the booking.</p>
    <p>Thank you,</p>
    <p>Your Team</p>
</body>
</html>`



const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "otpsendericr@gmail.com",
      pass: "opbz tfty xbrw cigw",
    },
  });
  async function sendOtpEmail(email, info, subject) {
    const mailOptions = {
      from: process.env.email,
      to: email,
      subject: subject,
      text: "",
      html: info,
    };
    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  }

  module.exports = {sendOtpEmail}