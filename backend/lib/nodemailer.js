import 'dotenv/config';
import nodemailer from "nodemailer";

// Prefer explicit host/port from env; fallback to Gmail service
const useHostBased = Boolean(process.env.EMAIL_HOST) && Boolean(process.env.EMAIL_PORT);

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

const defaultMailOptions = {
	from: process.env.EMAIL_USER
};

export { transporter, defaultMailOptions };
