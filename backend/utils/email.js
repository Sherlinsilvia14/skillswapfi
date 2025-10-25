import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `SkillSwap <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

export const sendSessionReminderEmail = async (user, session, teacher) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Session Reminder</h2>
      <p>Hi ${user.name},</p>
      <p>This is a reminder that your learning session is coming up soon!</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Skill:</strong> ${session.skill}</p>
        <p><strong>Teacher:</strong> ${teacher.name}</p>
        <p><strong>Scheduled:</strong> ${new Date(session.scheduledDate).toLocaleString()}</p>
      </div>
      <p>Get ready to learn something new!</p>
      <p>Best regards,<br>The SkillSwap Team</p>
    </div>
  `;

  return await sendEmail({
    email: user.email,
    subject: 'SkillSwap - Session Reminder',
    html
  });
};

export const sendSessionAcceptedEmail = async (learner, teacher, session) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #10B981;">Session Accepted! 🎉</h2>
      <p>Hi ${learner.name},</p>
      <p>Great news! ${teacher.name} has accepted your learning request.</p>
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Skill:</strong> ${session.skill}</p>
        <p><strong>Teacher:</strong> ${teacher.name}</p>
      </div>
      <p>You can now schedule a time that works for both of you.</p>
      <p>Happy learning!<br>The SkillSwap Team</p>
    </div>
  `;

  return await sendEmail({
    email: learner.email,
    subject: 'SkillSwap - Session Accepted',
    html
  });
};

export default sendEmail;
