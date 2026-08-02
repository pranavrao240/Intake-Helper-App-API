const nodemailer = require('nodemailer');
require('dotenv').config();


// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT, 10),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS 
        },
        tls: {
            rejectUnauthorized: false
        }
    });
};

// In services/email.service.js
// In services/email.service.js
async function sendVerificationEmail(email, verificationToken) {
    console.log('=== sendVerificationEmail START ===');
    console.log('Email:', email);
    console.log('Token:', verificationToken);
    
    try {
        const transporter = createTransporter();
        console.log('Transporter created');
        
        const verificationUrl = `${process.env.FRONTEND_URL}/api/verify-email?token=${verificationToken}`;
        console.log('URL:', verificationUrl);
        
        const mailOptions = {
            from: `"Intake Helper" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Verify Your Email Address',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">🔔 Email Verification</h1>
                        <p style="margin: 20px 0; font-size: 16px;">Thank you for registering with Intake Helper!</p>
                        <p style="margin: 20px 0; font-size: 16px;">Please click the button below to verify your email address:</p>
                        <div style="margin: 30px 0;">
                            <a href="${verificationUrl}" style="background: white; color: #667eea; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Verify Email
                            </a>
                        </div>
                        <p style="margin: 30px 0; font-size: 14px; color: #cccccc;">
                            This link will expire in 24 hours.<br>
                            If you didn't create an account, please ignore this email.
                        </p>
                    </div>
                </div>
            `
        };
        
        console.log('Sending email...');
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            email: email
        };
    } catch (error) {
        console.error('❌ Email error:', error);
        throw new Error(`Failed to send verification email: ${error.message}`);
    }
}
async function sendWelcomeEmail(email, userName) {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: `"Intake Helper" <${process.env.SMTP_USER}>`,
            to: email,
            subject: 'Welcome to Intake Helper! 🎉',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px;">🎉 Welcome to Intake Helper!</h1>
                        <p style="margin: 20px 0; font-size: 16px;">Hi ${userName},</p>
                        <p style="margin: 20px 0; font-size: 16px;">Thank you for joining our community! We're excited to help you on your health and nutrition journey.</p>
                        <div style="margin: 30px 0; text-align: left;">
                            <h3 style="color: #fff; margin-bottom: 15px;">Get Started:</h3>
                            <ul style="color: #fff; line-height: 1.6;">
                                <li>📊 Track your daily nutrition</li>
                                <li>🎯 Set and achieve goals</li>
                                <li>🔥 Build healthy habits</li>
                                <li>📱 Get personalized recommendations</li>
                            </ul>
                        </div>
                        <p style="margin: 30px 0; font-size: 14px; color: #cccccc;">
                            Best regards,<br>
                            The Intake Helper Team
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            email: email
        };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        throw new Error(`Failed to send welcome email: ${error.message}`);
    }
}

async function sendPasswordResetEmail(email, resetToken) {
    try {
        const transporter = createTransporter();
        
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/reset-password?token=${resetToken}`;
        
       
const mailOptions = {
    from: `"Intake Helper" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Password',
    html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">🔒 Password Reset</h1>
                <p style="margin: 20px 0; font-size: 16px;">You requested to reset your password.</p>
                
                <div style="margin: 30px 0;">
                    <a href="http://localhost:3000/api/verify-reset-token?token=${resetToken}" 
                       style="background: white; color: #f093fb; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                        Verify Reset Token
                    </a>
                </div>
                
                <p style="margin: 20px 0; font-size: 14px;">
                    <strong>Or copy this token for your app:</strong>
                </p>
                
                <div style="margin: 20px 0; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 5px;">
                    <code style="color: white; font-size: 14px; word-break: break-all;">${resetToken}</code>
                </div>
                
                <p style="margin: 30px 0; font-size: 14px; color: #cccccc;">
                    This token will expire in 1 hour.<br>
                    If you didn't request this reset, please ignore this email.
                </p>
            </div>
        </div>
    `



        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        
        return {
            success: true,
            messageId: info.messageId,
            email: email
        };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        throw new Error(`Failed to send password reset email: ${error.message}`);
    }
}

module.exports = {
    sendVerificationEmail,
    sendWelcomeEmail,
    sendPasswordResetEmail,
    createTransporter
};