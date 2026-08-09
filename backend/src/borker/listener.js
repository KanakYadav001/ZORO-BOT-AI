const { consumeFromQueue } = require("./borker");
const { sendEmail } = require("../service/mail.service");

module.exports = function () {
  consumeFromQueue("NEW_USER_REGISTER", async (data) => {
    const parsedData = JSON.parse(data);
    const htmlContent = `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <div style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">Welcome to ZORO-AI 🚀</h1>
    </div>

    <div style="padding: 30px; color: #333;">
      <h2 style="margin-top: 0;">Hello ${parsedData.FullName.firstName} ${parsedData.FullName.lastName},</h2>

      <p>
        We’re excited to welcome you to <strong>ZORO-AI</strong>! 🎉  
        Your account has been successfully created, and you're now part of a powerful AI-driven platform designed to enhance your productivity and creativity.
      </p>

      <p>
        With ZORO-AI, you can:
      </p>

      <ul style="padding-left: 20px;">
        <li>⚡ Generate intelligent responses instantly</li>
        <li>🧠 Leverage advanced AI tools</li>
        <li>🚀 Boost your workflow efficiency</li>
      </ul>

      <p>
        We recommend exploring your dashboard and getting familiar with all the features we offer.
      </p>

      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="background: #2563eb; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
          Get Started
        </a>
      </div>

      <p>
        If you have any questions or need assistance, feel free to reach out to our support team.
      </p>

      <p>
        Welcome aboard once again! 💙
      </p>

      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong>Team ZORO-AI</strong>
      </p>
    </div>

    <div style="background: #f1f5f9; text-align: center; padding: 15px; font-size: 12px; color: #555;">
      © ${new Date().getFullYear()} ZORO-AI. All rights reserved.
    </div>

  </div>
</div>
`;
    const textContent = `
Hello ${parsedData.FullName.firstName} ${parsedData.FullName.lastName},

Welcome to ZORO-AI!

We are thrilled to have you on board. Your account has been successfully created, and you are now part of a platform designed to empower you with advanced AI capabilities.

With ZORO-AI, you can:
- Generate intelligent responses instantly
- Use powerful AI tools
- Improve your productivity and workflow

We encourage you to explore the platform and make the most of its features.

If you need any assistance, feel free to contact our support team.

Best regards,
Team ZORO-AI
`;

    await sendEmail(
      parsedData.email,
      `Welcome ${parsedData.FullName.firstName} ${parsedData.FullName.lastName} !`,
      textContent,
      htmlContent,
    );
  });
};
