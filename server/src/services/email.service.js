
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    }
});

async function sendVerificationEmail(email, otp) {
    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your KNOT account",
        text: `Your KNOT verification code is ${otp}. It expires in 10 minutes.`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
                <h2>Welcome to KNOT!</h2>
                <p>Use the verification code below to verify your email address.</p>
                <h1 style="letter-spacing: 8px;">${otp}</h1>
                <p>This code expires in 10 minutes.</p>
                <p>If you did not request this, please ignore this email.</p>
            </div>
        `
    });
}

module.exports = {
    sendVerificationEmail
};
