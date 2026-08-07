import nodemailer from "nodemailer";

const getTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER || "nextursai@gmail.com",
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "nabarajkc43@gmail.com";

export async function sendContactEmail(name: string, email: string, message: string) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"${name}" <${process.env.GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    text: `You have received a new message from your portfolio contact form.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <h3>New Contact Message</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <hr />
      <p style="white-space: pre-wrap;">${message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("[Mailer] Contact email sent successfully");
  } catch (error) {
    console.error("[Mailer] Failed to send contact email:", error);
  }
}

export async function sendDailyPublishNotice(articleTitle?: string, researchTitle?: string) {
  const transporter = getTransporter();

  const mailOptions = {
    from: `"AI Publishing Engine" <${process.env.GMAIL_USER}>`,
    to: ADMIN_EMAIL,
    subject: `Automated Daily Content Published`,
    text: `Your daily automated content has been successfully generated and published.\n\nArticle: ${articleTitle || 'N/A'}\nResearch Paper: ${researchTitle || 'N/A'}`,
    html: `
      <h3>Daily AI Content Generation Complete</h3>
      <p>Your automated publishing engine has completed its daily run.</p>
      <ul>
        <li><strong>Generated Article:</strong> ${articleTitle || 'N/A'}</li>
        <li><strong>Generated Research Paper:</strong> ${researchTitle || 'N/A'}</li>
      </ul>
      <p>Check the admin dashboard for details.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("[Mailer] Daily publish notice sent successfully");
  } catch (error) {
    console.error("[Mailer] Failed to send daily publish notice:", error);
  }
}
