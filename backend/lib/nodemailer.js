import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

const defaultMailOptions = {
	from: process.env.EMAIL_USER
};

export { transporter, defaultMailOptions };
