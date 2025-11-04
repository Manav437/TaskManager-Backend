import formData from "form-data";
import Mailgun from "mailgun.js";
const mailgun = new Mailgun(formData);
const client = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY, // Your API key
    url: "https://api.mailgun.net", // Optional
});
export const sendWelcomeEmail = async (email, name) => {
    const data = {
        from: "Danav Sharma <no-reply@yourdomain.com>",
        to: email,
        subject: "Welcome aboard!",
        text: `Hello ${name}, welcome to our service!`,
    };
    try {
        const result = await client.messages.create(
            process.env.MAILGUN_DOMAIN ||
                "sandboxb0795a570a2f4344bc39f9698e9ec31f.mailgun.org",
            data,
        );
        console.log("Email sent:", result);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};
// sendWelcomeEmail('manav.gussain@gmail.com', 'Manav Gusain');

export const sendDeletionEmail = async (email, name) => {
    const data = {
        from: "Danav Andres Messi <no-reply@yourdomain.com>",
        to: email,
        subject: "Goodbye!",
        text: `Thanks for using our app, ${name}. We hope you can provide some information on how we can improve our service.`,
    };
    try {
        const result = await client.messages.create(
            "sandbox94340385998c41b0b3dc98fc25675634.mailgun.org",
            data,
        );
        console.log("Email sent:", result);
    } catch (e) {
        console.error("Error sending email:", e);
    }
};

export default sendWelcomeEmail;
