import 'dotenv/config';
import nodemailer from "nodemailer";

// Prefer explicit host/port from env; fallback to Gmail service
const useHostBased = Boolean(process.env.EMAIL_HOST) && Boolean(process.env.EMAIL_PORT);

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport(
	useHostBased
		? {
				host: process.env.EMAIL_HOST,
				port: Number(process.env.EMAIL_PORT),
				secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
				auth: {
		  user: process.env.EMAIL_USER,
		  // Gmail app passwords are often shown with spaces; remove any whitespace just in case
		  pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined,
				},
			}
		: {
				service: "gmail",
				auth: {
		  user: process.env.EMAIL_USER,
		  pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : undefined,
				},
			}
);

// Default mail options
const defaultMailOptions = {
	from: process.env.EMAIL_USER
};

// Send email function
export const sendEmail = async (options) => {
	const mailOptions = {
		...defaultMailOptions,
		to: options.to,
		subject: options.subject,
		html: options.html || options.text
	};
	
	try {
		const info = await transporter.sendMail(mailOptions);
		console.log('Email sent:', info.messageId);
		return info;
	} catch (error) {
		console.error('Error sending email:', error);
		throw error;
	}
};

// Two-Factor Authentication email templates
export const send2FASetupCode = async (email, name, code) => {
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
				<h1 style="color: #333; margin: 0;">Ramanayake Travels</h1>
			</div>
			<div style="padding: 30px;">
				<h2 style="color: #333;">Enable Two-Step Verification</h2>
				<p>Hello ${name},</p>
				<p>You have requested to enable two-step verification for your account. Please use the verification code below to complete the setup:</p>
				
				<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
					<h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
				</div>
				
				<p>This code will expire in 10 minutes for security purposes.</p>
				<p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
				
				<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
				<p style="color: #666; font-size: 12px;">
					This is an automated email from Ramanayake Travels. Please do not reply to this email.
				</p>
			</div>
		</div>
	`;
	
	return sendEmail({
		to: email,
		subject: 'Enable Two-Step Verification - Ramanayake Travels',
		html
	});
};

export const send2FALoginCode = async (email, name, code) => {
	const html = `
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
				<h1 style="color: #333; margin: 0;">Ramanayake Travels</h1>
			</div>
			<div style="padding: 30px;">
				<h2 style="color: #333;">Login Verification Code</h2>
				<p>Hello ${name},</p>
				<p>Someone is trying to sign in to your account. Please use the verification code below to complete your login:</p>
				
				<div style="background-color: #f8f9fa; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;">
					<h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
				</div>
				
				<p>This code will expire in 10 minutes for security purposes.</p>
				<p><strong>If this wasn't you, please secure your account immediately by changing your password.</strong></p>
				
				<hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
				<p style="color: #666; font-size: 12px;">
					This is an automated email from Ramanayake Travels. Please do not reply to this email.
				</p>
			</div>
		</div>
	`;
	
	return sendEmail({
		to: email,
		subject: 'Login Verification Code - Ramanayake Travels',
		html
	});
};

export { transporter, defaultMailOptions };
