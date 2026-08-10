const { sendEmail } = require("../service/mail.service");

async function RegisterUserEmail(data) {
  try {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const email = parsedData?.email;

    if (!email) {
      console.error(
        "Invalid registration message skipped (missing email):",
        data,
      );
      return;
    }

    const firstName =
      parsedData?.FullName?.firstName || parsedData?.name?.firstName || "User";
    const lastName =
      parsedData?.FullName?.lastName || parsedData?.name?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();

    const htmlContent = `
<div style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    
    <div style="background: #0f172a; color: #ffffff; padding: 20px; text-align: center;">
      <h1 style="margin: 0;">Welcome to ZORO-AI 🚀</h1>
    </div>

    <div style="padding: 30px; color: #333;">
      <h2 style="margin-top: 0;">Hello ${fullName},</h2>

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
        <a href="https://zoro-bot-ai.vercel.app/" style="background: #2563eb; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
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
Hello ${fullName},

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

    await sendEmail(email, `Welcome ${fullName}!`, textContent, htmlContent);
    console.log(`Registration email sent successfully to ${email}`);
  } catch (error) {
    console.error(
      `Error processing registration email message:`,
      error?.message || error,
    );
    throw error;
  }
}

async function LoginUserEmail(data) {
  try {
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;
    const email = parsedData?.email;

    if (!email) {
      console.error(
        "Invalid login message skipped (missing email):",
        data,
      );
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Login Alert - ZORO-AI</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background-color: #f1f5f9;
          font-family: Arial, Helvetica, sans-serif;
          color: #333333;
        ">

          <div style="
            max-width: 600px;
            margin: 30px auto;
            background: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(15, 23, 42, 0.08);
          ">

            <!-- Header -->
            <div style="
              background: #0f172a;
              color: #ffffff;
              padding: 24px 20px;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                font-size: 26px;
                font-weight: 700;
              ">
                ZORO-AI
              </h1>

              <p style="
                margin: 8px 0 0;
                color: #cbd5e1;
                font-size: 14px;
              ">
                Account Security
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 35px 30px;">

              <div style="
                text-align: center;
                margin-bottom: 25px;
              ">
                <div style="
                  display: inline-block;
                  background: #eff6ff;
                  border-radius: 50%;
                  width: 60px;
                  height: 60px;
                  line-height: 60px;
                  font-size: 28px;
                ">
                  🔐
                </div>
              </div>

              <h2 style="
                margin: 0 0 15px;
                text-align: center;
                color: #0f172a;
                font-size: 23px;
              ">
                New Login Detected
              </h2>

              <p style="
                font-size: 15px;
                line-height: 1.7;
                margin: 0 0 20px;
              ">
                We noticed a recent login to your
                <strong>ZORO-AI</strong> account.
              </p>

              <!-- Login Confirmation -->
              <div style="
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
              ">

                <p style="
                  margin: 0 0 8px;
                  font-size: 15px;
                  font-weight: bold;
                  color: #0f172a;
                ">
                  Was this you?
                </p>

                <p style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #64748b;
                ">
                  If you recently logged into your account,
                  you can safely ignore this email.
                </p>

              </div>

              <!-- Security Warning -->
              <div style="
                background: #fff7ed;
                border-left: 4px solid #f97316;
                padding: 15px 18px;
                margin: 25px 0;
              ">

                <p style="
                  margin: 0 0 6px;
                  font-size: 14px;
                  font-weight: bold;
                  color: #9a3412;
                ">
                  Didn't recognize this login?
                </p>

                <p style="
                  margin: 0;
                  font-size: 14px;
                  line-height: 1.6;
                  color: #7c2d12;
                ">
                  Please secure your account immediately by changing
                  your password and reviewing your account activity.
                </p>

              </div>

              <!-- Button -->
              <div style="
                text-align: center;
                margin: 30px 0;
              ">
                <a
                  href="https://zoro-bot-ai.vercel.app/"
                  style="
                    display: inline-block;
                    background: #2563eb;
                    color: #ffffff;
                    padding: 13px 28px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-size: 14px;
                    font-weight: bold;
                  "
                >
                  Open ZORO-AI
                </a>
              </div>

              <p style="
                font-size: 13px;
                line-height: 1.6;
                color: #64748b;
                margin-top: 25px;
              ">
                For your security, never share your password or
                authentication codes with anyone.
              </p>

              <p style="
                margin-top: 30px;
                font-size: 14px;
                line-height: 1.6;
              ">
                Best regards,<br />
                <strong>Team ZORO-AI</strong>
              </p>

            </div>

            <!-- Footer -->
            <div style="
              background: #f1f5f9;
              text-align: center;
              padding: 18px 15px;
              font-size: 12px;
              color: #64748b;
            ">
              <p style="margin: 0 0 5px;">
                This is an automated security notification from ZORO-AI.
              </p>

              <p style="margin: 0;">
                © ${new Date().getFullYear()} ZORO-AI. All rights reserved.
              </p>
            </div>

          </div>

        </body>
      </html>
    `;

    const textContent = `
ZORO-AI
Account Security

New Login Detected

We noticed a recent login to your ZORO-AI account.

Was this you?
If you recently logged into your account, you can safely ignore this email.

Didn't recognize this login?
Please secure your account immediately by changing your password and reviewing your account activity.

Open ZORO-AI:
https://zoro-bot-ai.vercel.app/

For your security, never share your password or authentication codes with anyone.

Best regards,
Team ZORO-AI

© ${new Date().getFullYear()} ZORO-AI. All rights reserved.
    `.trim();

    await sendEmail(
      email,
      "New Login Detected — ZORO-AI",
      textContent,
      htmlContent,
    );

    console.log(`Login alert email sent successfully to ${email}`);
  } catch (error) {
    console.error(
      "Error processing login alert email message:",
      error?.message || error,
    );

    throw error;
  }
}
module.exports = { RegisterUserEmail, LoginUserEmail };
