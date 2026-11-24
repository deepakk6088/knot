
const nodemailer = require("nodemailer");

function isEmailConfigured() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_APP_PASSWORD;
    return (
        user &&
        pass &&
        !user.includes("your_email") &&
        !pass.includes("your_gmail_app_password")
    );
}

const transporter = isEmailConfigured()
    ? nodemailer.createTransport({
          service: "gmail",
          auth: {
              user: process.env.EMAIL_USER,
              pass: process.env.EMAIL_APP_PASSWORD
          }
      })
    : null;

async function sendVerificationEmail(email, otp) {
    // Always print OTP to the server console for easy local development & testing
    console.log("\n========================================");
    console.log(`[KNOT EMAIL VERIFICATION]`);
    console.log(`To:       ${email}`);
    console.log(`OTP Code: ${otp}`);
    console.log("========================================\n");

    if (!transporter) {
        console.log(
            "[EmailService] Gmail credentials not configured in .env. Using console OTP above."
        );
        return;
    }

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
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
    } catch (err) {
        console.error("[EmailService] Failed to send email via SMTP:", err.message);
        // In local development, if SMTP fails, allow the user to continue using the console OTP
        if (process.env.NODE_ENV === "production") {
            throw err;
        }
        console.log("[EmailService] Proceeding with console OTP for development.");
    }
}

module.exports = {
    sendVerificationEmail
};
