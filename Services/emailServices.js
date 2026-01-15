const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send verification email
const sendVerificationEmail = async (username, email) => {
  const verificationToken = generateVerificationToken();
  const verificationUrl = `https://backend-deploy-3-4ofh.onrender.com/api/verify-email?token=${verificationToken}&email=${email}`;
  const html = `<!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>ShopHub — Verify your account</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <!-- Preheader (hidden) -->
      <style>
        /* Basic resets */
        body,table,td,a{ -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
        table,td{ mso-table-lspace:0pt; mso-table-rspace:0pt; }
        img{ -ms-interpolation-mode:bicubic; }
        img{ border:0; height:auto; line-height:100%; outline:none; text-decoration:none; display:block; }
        a[x-apple-data-detectors]{ color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
    
        /* Container */
        .email-wrapper { width:100% !important; background-color:#f4f6f8; padding:20px 0; }
        .email-content { width:100%; max-width:680px; margin:0 auto; }
    
        /* Card */
        .card { background:#ffffff; border-radius:8px; box-shadow:0 1px 3px rgba(15, 15, 15, 0.06); overflow:hidden; }
    
        /* Header */
        .brand { padding:24px; text-align:center; }
        .brand img{ max-width:140px; height:auto; }
    
        /* Body */
        .body { padding:28px 28px 24px 28px; color:#0f1724; font-family:Arial, sans-serif; font-size:16px; line-height:1.5; }
        .greeting { font-size:18px; font-weight:700; margin-bottom:12px; }
        .lead { color:#374151; margin-bottom:18px; }
        .muted { color:#6b7280; font-size:14px; }
    
        /* Button (bulletproof) */
        .button-wrapper { text-align:center; padding:18px 0; }
        .btn {
          display:inline-block;
          padding:12px 22px;
          border-radius:6px;
          background-color:#2563eb;
          color:#ffffff !important;
          text-decoration:none;
          font-weight:600;
          font-size:16px;
        }
    
        /* Footer */
        .footer { padding:18px 28px 28px 28px; font-size:13px; color:#9ca3af; text-align:center; }
        .small { font-size:12px; color:#9ca3af; }
    
        /* Responsive */
        @media only screen and (max-width: 480px) {
          .body { padding:18px; font-size:15px; }
          .brand img{ max-width:110px; }
        }
      </style>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f8;">
      <!-- Preheader text: shows in inbox preview -->
      <div style="display:none; font-size:1px; color:#f4f6f8; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden;">
        Verify your ShopHub account — this link expires in 2 hours.
      </div>
    
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-wrapper">
        <tr>
          <td align="center">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="email-content">
              <!-- Card -->
              <tr>
                <td class="card" style="border-radius:8px; overflow:hidden;">
                  <!-- Header / Brand -->
                  <table role="presentation" width="100%" style="border-collapse:collapse;">
                    <tr>
                      <td class="brand" style="padding:24px; text-align:center;">
                        <!-- logoUrl placeholder -->
                        <a href="http://localhost:3000" target="_blank" style="display:inline-block;">
                          <img src="https://img.freepik.com/premium-vector/shopping-logo-design_852937-4657.jpg?semt=ais_hybrid&w=740&q=80" alt="ShopHub logo" width="140" style="max-width:140px; height:auto; display:block; margin:0 auto;">
                        </a>
                      </td>
                    </tr>
                  </table>
    
                  <!-- Body -->
                  <table role="presentation" width="100%" style="border-collapse:collapse;">
                    <tr>
                      <td class="body">
                        <div class="greeting">Hello ${username},</div>
    
                        <div class="lead">
                          Thanks for creating an account at <strong>ShopHub</strong>! To finish setting up your account, please verify your email address.
                        </div>
    
                        <!-- Call to action -->
                        <div class="button-wrapper" style="padding-top:6px; padding-bottom:14px;">
                          <!-- Bulletproof button for email clients -->
                          <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                            <tr>
                              <td align="center" style="border-radius:6px;">
                                <!-- Use the verificationUrl placeholder -->
                                <a href="${verificationUrl}" class="btn" target="_blank" rel="noopener">Verify your email</a>
                              </td>
                            </tr>
                          </table>
                        </div>
    
                        <div class="muted">
                          If the button doesn't work, copy and paste the following link into your browser:
                          <div style="word-break:break-all; margin-top:8px;">
                            <a href="${verificationUrl}" target="_blank" rel="noopener" style="color:#2563eb; text-decoration:underline;">${verificationUrl}</a>
                          </div>
                        </div>
    
                        <hr style="border:none; border-top:1px solid #eef2f7; margin:20px 0;">
    
                        <div style="font-size:15px; color:#374151; margin-bottom:12px;">
                          This link will expire in <strong> 2 hours</strong>. If you did not create an account with <strong>ShopHub</strong>, you can ignore this email or contact our support team.
                        </div>
    
                        <div class="small" style="margin-top:8px;">
                          Need help? Email us at <a href="mailto:${
                            process.env.EMAIL_USER
                          }}" style="color:#2563eb; text-decoration:underline;">${
    process.env.EMAIL_USER
  }}</a>
                        </div>
                      </td>
                    </tr>
                  </table>
    
                  <!-- Footer -->
                  <table role="presentation" width="100%" style="border-collapse:collapse; background:#fafafa; border-top:1px solid #f1f5f9;">
                    <tr>
                      <td class="footer" style="padding:18px 28px; text-align:center;">
                        <div style="margin-bottom:6px;">ShopHub</div>
                        <div class="small" style="margin-bottom:6px;">123 Example Street, City • Company Registration No.</div>
                        <div class="small">If you didn't request this, please ignore — no action is needed.</div>
                      </td>
                    </tr>
                  </table>
    
                </td>
              </tr>
    
              <!-- Spacer -->
              <tr>
                <td style="padding-top:12px; text-align:center;">
                  <div style="font-size:12px; color:#9ca3af;">&copy; ${new Date().getFullYear()} ShopHub. All rights reserved.</div>
                </td>
              </tr>
    
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Account Verification for ShopHub",
    html,
  };
  await transporter.sendMail(mailOptions);
};

const generateVerificationToken = () => {
  const token = require("crypto").randomBytes(32).toString("hex");
  return token;
};

module.exports = {
  sendVerificationEmail,
};
