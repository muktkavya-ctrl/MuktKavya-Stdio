import brevo from '@getbrevo/brevo';

/**
 * Brevo (formerly Sendinblue) Email Service
 * Handles transactional emails for Mukt Kavya:
 * - Welcome emails
 * - Poem submission / approval
 * - Featured poem alerts
 * - Direct test dispatches
 */

const getBrevoClient = () => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey || apiKey.includes('demo') || apiKey.includes('your_brevo')) {
    return null;
  }
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, apiKey);
  return apiInstance;
};

export const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent, textContent }) => {
  const senderEmail = process.env.BREVO_SENDER_EMAIL || 'muktkavya@example.com';
  const senderName = process.env.BREVO_SENDER_NAME || 'Mukt Kavya Poetry Platform';

  const client = getBrevoClient();

  if (!client) {
    console.log('\n✉️ --- [BREVO EMAIL SIMULATOR (Set valid BREVO_API_KEY in backend/.env for live dispatch)] ---');
    console.log(`📤 From: ${senderName} <${senderEmail}>`);
    console.log(`📥 To: ${toName || ''} <${toEmail}>`);
    console.log(`🏷️ Subject: ${subject}`);
    console.log(`📝 Preview: ${(textContent || htmlContent || '').substring(0, 140)}...`);
    console.log('--------------------------------------------------------------------------------------\n');
    return {
      success: true,
      simulated: true,
      message: 'Email logged in development/simulation mode. Add your live Brevo API key in .env to send real emails.',
    };
  }

  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: senderName, email: senderEmail };
    sendSmtpEmail.to = [{ email: toEmail, name: toName || toEmail }];
    if (textContent) {
      sendSmtpEmail.textContent = textContent;
    }

    const data = await client.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Brevo Email sent successfully to ${toEmail}, MessageId:`, data.body?.messageId || data);
    return { success: true, simulated: false, data: data.body || data };
  } catch (error) {
    console.error('❌ Brevo Email sending error:', error.response?.body || error.message);
    return {
      success: false,
      error: error.response?.body?.message || error.message,
    };
  }
};

/**
 * Send Welcome Email to New Poet / Reader
 */
export const sendWelcomeEmail = async (user) => {
  const subject = `✨ स्वागतम्! Welcome to Mukt Kavya, ${user.name}`;
  const htmlContent = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fffaf0; border: 1px solid #d4af37; border-radius: 12px; padding: 32px; color: #2d1810;">
      <div style="text-align: center; border-bottom: 2px solid #d4af37; padding-bottom: 16px; margin-bottom: 24px;">
        <h1 style="color: #800020; font-size: 28px; margin: 0;">मुक्त काव्य (Mukt Kavya)</h1>
        <p style="color: #6a4a3a; font-style: italic; margin-top: 6px;">The Royal Multilingual Sanctuary for Poets & Verses</p>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">प्रिय <strong>${user.name}</strong> ${user.penName ? `('${user.penName}')` : ''},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #4a3525;">
        We are honored to welcome you to <strong>Mukt Kavya</strong> as a <strong>${user.role.toUpperCase()}</strong>.
        Here, your voice resonates across Hindi, Urdu, Marathi, Gujarati, Bengali, English, and all regional treasures of the Indian subcontinent.
      </p>
      <div style="background: rgba(212, 175, 55, 0.12); border-left: 4px solid #800020; padding: 14px 18px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; font-style: italic; color: #800020; font-size: 15px;">
          "शब्द जहाँ रस बन जाते हैं, और भाव अमर काव्य!"<br/>
          <em>Where words become nectar, and feelings become immortal poetry.</em>
        </p>
      </div>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: linear-gradient(135deg, #800020, #b22222); color: #fff; text-decoration: none; padding: 12px 28px; font-weight: bold; border-radius: 25px; display: inline-block; box-shadow: 0 4px 12px rgba(128,0,32,0.3);">
          Enter the Poet's Studio &rarr;
        </a>
      </div>
      <p style="font-size: 13px; color: #8a7968; text-align: center; border-top: 1px solid #ecd8c6; padding-top: 16px;">
        Powered by Mukt Kavya & Brevo Transactional Mailer System
      </p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: user.email,
    toName: user.name,
    subject,
    htmlContent,
  });
};

/**
 * Send Kavita Publication Notification
 */
export const sendKavitaPublishedEmail = async (user, kavita) => {
  const subject = `📖 Your Kavita "${kavita.title}" is now Published on Mukt Kavya!`;
  const htmlContent = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border: 1px solid #334155; border-radius: 12px; padding: 32px;">
      <h2 style="color: #fbbf24; text-align: center; margin-top: 0;">बधाई हो! New Poem Published</h2>
      <p style="font-size: 16px;">Greetings <strong>${user.name}</strong>,</p>
      <p>Your magnificent creation has been published successfully:</p>
      <div style="background: #1e293b; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
        <h3 style="color: #f1f5f9; margin: 0 0 6px 0;">${kavita.title}</h3>
        <p style="color: #94a3b8; margin: 0; font-size: 14px;">Language: <strong>${kavita.language}</strong> | Rasa: <strong>${kavita.rasa}</strong> | Form: <strong>${kavita.form}</strong></p>
      </div>
      <p style="text-align: center; margin-top: 24px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: #f59e0b; color: #0f172a; text-decoration: none; padding: 10px 24px; font-weight: bold; border-radius: 20px; display: inline-block;">
          View Your Poem in Royal Reader
        </a>
      </p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: user.email,
    toName: user.name,
    subject,
    htmlContent,
  });
};

/**
 * Send Notification to Poet when a Reader Leaves a Comment
 */
export const sendCommentNotificationEmail = async (poet, commenterName, kavita, commentText) => {
  const subject = `💬 New reader reflection on your Kavita "${kavita.title}"`;
  const htmlContent = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; background: #fffaf0; border: 1px solid #d4af37; border-radius: 12px; padding: 32px; color: #2d1810;">
      <h2 style="color: #800020; text-align: center; margin-top: 0;">पाठक की प्रतिक्रिया (New Reader Reflection)</h2>
      <p style="font-size: 16px;">आदरणीय <strong>${poet.name}</strong> ${poet.penName ? `('${poet.penName}')` : ''},</p>
      <p style="font-size: 15px; color: #4a3525;">
        Reader <strong>${commenterName}</strong> has shared a heartfelt reflection on your poem <strong>"${kavita.title}"</strong>:
      </p>
      <div style="background: rgba(212, 175, 55, 0.15); border-left: 4px solid #800020; padding: 16px 20px; margin: 20px 0; border-radius: 6px;">
        <p style="margin: 0; font-style: italic; color: #2b1810; font-size: 15px; line-height: 1.6;">
          "${commentText}"
        </p>
      </div>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}" style="background: linear-gradient(135deg, #800020, #b22222); color: #fff; text-decoration: none; padding: 10px 24px; font-weight: bold; border-radius: 20px; display: inline-block;">
          Open Poet Dashboard & Reply &rarr;
        </a>
      </div>
      <p style="font-size: 12px; color: #8a7968; text-align: center; border-top: 1px solid #ecd8c6; padding-top: 14px;">
        Dispatched via Mukt Kavya & Brevo Transactional Mailer
      </p>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: poet.email,
    toName: poet.name,
    subject,
    htmlContent,
  });
};

/**
 * Send Password Reset OTP Email
 */
export const sendPasswordResetOtpEmail = async (user, otp) => {
  const subject = `🔐 [OTP: ${otp}] सुरक्षा सत्यापन कोड • Password Reset Verification - Mukt Kavya`;
  const htmlContent = `
    <div style="font-family: 'Georgia', serif; max-width: 580px; margin: 0 auto; background: #0c0f1c; color: #f8fafc; border: 2px solid #d4af37; border-radius: 16px; padding: 36px; box-shadow: 0 10px 35px rgba(0,0,0,0.85);">
      <div style="text-align: center; border-bottom: 1px solid rgba(212,175,55,0.4); padding-bottom: 20px; margin-bottom: 24px;">
        <h1 style="color: #fceda2; font-size: 28px; margin: 0; letter-spacing: 1px;">मुक्त काव्य (Mukt Kavya)</h1>
      </div>
      
      <h2 style="color: #ffffff; font-size: 20px; text-align: center; margin-top: 0;">सुरक्षा सत्यापन कोड (Password Reset OTP)</h2>
      
      <p style="font-size: 15px; color: #cbd5e1; line-height: 1.6;">नमस्ते <strong>${user.name}</strong>,</p>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6;">
        You have requested to reset the password for your Mukt Kavya account. Use the 6-digit One-Time Password (OTP) below to authenticate and configure your new password:
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="display: inline-block; background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(128,0,32,0.45)); border: 2px dashed #d4af37; border-radius: 14px; padding: 18px 42px;">
          <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #fceda2;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #fbbf24; margin-top: 12px; font-weight: 500;">
          ⏳ This verification code expires in <strong>10 minutes</strong>.
        </p>
      </div>
      
      <p style="font-size: 12px; color: #64748b; line-height: 1.5; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px;">
        🔒 <em>Security Notice:</em> Never share this OTP with anyone. Mukt Kavya administrators will never ask for your password or verification code. If you did not initiate this request, your account remains secure and you may safely disregard this message.
      </p>
      
      <div style="border-top: 1px solid rgba(212,175,55,0.25); margin-top: 28px; padding-top: 16px; text-align: center; font-size: 11px; color: #64748b;">
        © 2026 Mukt Kavya • Dispatched via Brevo Transactional Mailer
      </div>
    </div>
  `;

  return sendBrevoEmail({
    toEmail: user.email,
    toName: user.name,
    subject,
    htmlContent,
  });
};


