import nodemailer from "nodemailer";
import "dotenv/config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.USERNAME,
    pass: process.env.APP_PASSWORD,
  },
});

export const sendVerificationCode = async (email:string, code:string, name:string) => {
  try {
    const mailOptions = {
      from: "eduarc@gmail.com",
      to: email,
      subject: "Email Verification",
      text: "Welcome to Happy store",
      html: `
<html>
<head>
    <meta charset="UTF-8">
    <title>Verification Code</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            font-size: 24px;
            color: #333333;
        }
        .code {
            font-size: 32px;
            font-weight: bold;
            color: #007BFF;
            margin: 20px 0;
        }
        .footer {
            font-size: 14px;
            color: #777777;
            margin-top: 20px;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #007BFF;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">Verify Your Email</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Use the verification code below to verify your email:</p>
        <p class="code">${code}</p>
        <p>If you did not request this, please ignore this email.</p>
        <a href="#" class="button">Verify Email</a>
        <p class="footer">This code expires in 10 minutes. If you have any issues, contact our support team.</p>
    </div>
</body>
</html>

            `,
    };
    await transporter.sendMail(mailOptions)
    console.log(`welcome email sent to: ${email}`)
  } catch (error) {
    console.error("Error sending welcome email: ", error)
  }
};

export const sendForgotPasswordEmail = async (email: string, resetLink: string, name: string) => {
  try {
    const mailOptions = {
      from: "eduarc@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: "Reset your password",
      html: `
<html>
<head>
    <meta charset="UTF-8">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        .header {
            font-size: 24px;
            color: #333333;
        }
        .message {
            font-size: 16px;
            color: #555555;
            margin: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            font-size: 16px;
            color: #ffffff;
            background-color: #d9534f;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .footer {
            font-size: 14px;
            color: #777777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">Reset Your Password</h2>
        <p class="message">Hello <strong>${name}</strong>,</p>
        <p class="message">We received a request to reset your password. Click the button below to set a new password:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p class="message">If you did not request this, please ignore this email. Your password will remain unchanged.</p>
        <p class="footer">This link expires in 10 minutes. If you need help, contact our support team.</p>
    </div>
</body>
</html>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
  } catch (error) {
    console.error("Error sending password reset email: ", error);
  }
};


// 
