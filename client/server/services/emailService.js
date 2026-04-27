const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const from = process.env.EMAIL_FROM || '"Nofoal" <noreply@nofoal.com>';

/**
 * Send preorder confirmation with payment link
 */
exports.sendPreorderEmail = async ({ to, customerName, productName, quantity, totalAmount, paymentLink }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from,
    to,
    subject: `Your Nofoal Pre-Order: ${productName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Roboto', Arial, sans-serif; background: #f5f4f0; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; padding: 40px; }
          .logo { text-align: center; margin-bottom: 32px; }
          h1 { font-size: 20px; font-weight: 600; color: #111; margin: 0 0 8px; }
          p { font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 16px; }
          .detail-box { background: #f5f4f0; padding: 20px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px solid #e0dfd8; }
          .detail-row:last-child { border-bottom: none; font-weight: 600; }
          .btn { display: block; text-align: center; background: #111; color: #fff; text-decoration: none; padding: 14px 24px; font-size: 13px; letter-spacing: 1px; text-transform: uppercase; margin: 24px 0; }
          .note { font-size: 12px; color: #999; text-align: center; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0dfd8; font-size: 11px; color: #bbb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <strong style="font-size: 18px; letter-spacing: 2px; text-transform: uppercase;">NOFOAL</strong>
          </div>
          <h1>Pre-Order Confirmed</h1>
          <p>Hi ${customerName},</p>
          <p>Thank you for your pre-order. Complete payment using the secure link below to confirm your order.</p>

          <div class="detail-box">
            <div class="detail-row"><span>Product</span><span>${productName}</span></div>
            <div class="detail-row"><span>Quantity</span><span>${quantity}</span></div>
            <div class="detail-row"><span>Total Amount</span><span>Rs.${totalAmount.toLocaleString('en-IN')}</span></div>
          </div>

          <a href="${paymentLink}" class="btn">Complete Payment →</a>

          <p class="note">This payment link expires in 7 days. Once paid, your order will be confirmed and shipped by March 31st, 2026.</p>

          <div class="footer">
            <p>Nofoal<br>
            If you didn't place this order, please ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send order confirmation after order placement
 * items: [{ productName, quantity, price }]
 */
exports.sendOrderConfirmationEmail = async ({ to, customerName, items, totalAmount, orderId, shippingAddress }) => {
  const transporter = createTransporter();

  const itemsHtml = (items || []).map(item => `
    <div class="detail-row">
      <span>${item.productName} &times; ${item.quantity}</span>
      <span>Rs.${(item.price * item.quantity).toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  await transporter.sendMail({
    from,
    to,
    subject: `Order Confirmed — #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Roboto', Arial, sans-serif; background: #f5f4f0; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; padding: 40px; }
          .logo { text-align: center; margin-bottom: 32px; letter-spacing: 3px; font-size: 18px; font-weight: 700; text-transform: uppercase; }
          .badge { display: inline-block; background: #111; color: #fff; padding: 5px 14px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { font-size: 22px; color: #111; margin: 0 0 12px; font-weight: 600; }
          p { font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 16px; }
          .detail-box { background: #f5f4f0; padding: 20px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #333; border-bottom: 1px solid #e0dfd8; }
          .detail-row:last-child { border-bottom: none; font-weight: 700; color: #111; font-size: 14px; }
          .divider { border: none; border-top: 1px solid #e0dfd8; margin: 20px 0; }
          .address-box { background: #f5f4f0; padding: 14px 20px; font-size: 13px; color: #444; line-height: 1.6; margin-bottom: 20px; }
          .note { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0dfd8; font-size: 11px; color: #bbb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">NOFOAL</div>
          <div class="badge">Order Confirmed</div>
          <h1>Thank you, ${customerName}.</h1>
          <p>Your order has been received and is being processed. We will notify you once your order ships.</p>

          <div class="detail-box">
            <div class="detail-row"><span>Order ID</span><span>#${orderId}</span></div>
            <hr class="divider">
            ${itemsHtml}
            <hr class="divider">
            <div class="detail-row"><span>Total</span><span>Rs.${totalAmount.toLocaleString('en-IN')}</span></div>
          </div>

          ${shippingAddress ? `
          <p style="font-size:12px;color:#666;margin-bottom:6px;letter-spacing:1px;text-transform:uppercase;">Ships To</p>
          <div class="address-box">${shippingAddress.replace(/\n/g, '<br>')}</div>
          ` : ''}

          <p class="note">Estimated shipping: March 31st, 2026. You'll receive a tracking update by email.</p>

          <div class="footer">
            Nofoal <br>
            <span style="color:#ddd;">If you didn't place this order, contact us at Sales@Nofoal.com</span>
          </div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send order cancellation confirmation
 */
exports.sendOrderCancellationEmail = async ({ to, customerName, items, totalAmount, orderId }) => {
  const transporter = createTransporter();

  const itemsHtml = (items || []).map(item => `
    <div class="detail-row">
      <span>${item.productName} &times; ${item.quantity}</span>
      <span>Rs.${(item.price * item.quantity).toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  await transporter.sendMail({
    from,
    to,
    subject: `Order Cancelled — #${orderId}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Roboto', Arial, sans-serif; background: #f5f4f0; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; padding: 40px; }
          .logo { text-align: center; margin-bottom: 32px; letter-spacing: 3px; font-size: 18px; font-weight: 700; text-transform: uppercase; }
          .badge { display: inline-block; background: #ef4444; color: #fff; padding: 5px 14px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { font-size: 22px; color: #111; margin: 0 0 12px; font-weight: 600; }
          p { font-size: 14px; color: #444; line-height: 1.6; margin: 0 0 16px; }
          .detail-box { background: #f5f4f0; padding: 20px; margin: 24px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #333; border-bottom: 1px solid #e0dfd8; }
          .detail-row:last-child { border-bottom: none; font-weight: 700; color: #111; font-size: 14px; }
          .divider { border: none; border-top: 1px solid #e0dfd8; margin: 12px 0; }
          .note { font-size: 12px; color: #888; text-align: center; margin-top: 20px; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0dfd8; font-size: 11px; color: #bbb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">NOFOAL</div>
          <div class="badge">Order Cancelled</div>
          <h1>Your order has been cancelled.</h1>
          <p>Hi ${customerName}, we've successfully cancelled your order as requested. If a payment was made, a refund will be processed within 5–7 business days.</p>

          <div class="detail-box">
            <div class="detail-row"><span>Order ID</span><span>#${orderId}</span></div>
            <hr class="divider">
            ${itemsHtml}
            <hr class="divider">
            <div class="detail-row"><span>Refund Amount</span><span>Rs.${totalAmount.toLocaleString('en-IN')}</span></div>
          </div>

          <p class="note">If you have any questions, contact us at Sales@Nofoal.com</p>

          <div class="footer">Nofoal</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send admin notification when a new paid order arrives
 */
exports.sendAdminOrderNotification = async ({ orderId, customerName, customerEmail, customerPhone, items, totalAmount, shippingAddress, paymentId }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;

  const transporter = createTransporter();

  const itemsHtml = (items || []).map(item => `
    <div class="detail-row">
      <span>${item.productName} &times; ${item.quantity}</span>
      <span>Rs.${(item.price * item.quantity).toLocaleString('en-IN')}</span>
    </div>
  `).join('');

  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `New Order Received — #${orderId} — Rs.${totalAmount.toLocaleString('en-IN')}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; background: #f5f4f0; margin: 0; padding: 0; }
          .container { max-width: 560px; margin: 40px auto; background: #fff; padding: 40px; }
          .logo { font-size: 18px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 24px; }
          .badge { display: inline-block; background: #16a34a; color: #fff; padding: 5px 14px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { font-size: 20px; color: #111; margin: 0 0 20px; font-weight: 600; }
          .detail-box { background: #f5f4f0; padding: 20px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #333; border-bottom: 1px solid #e0dfd8; }
          .detail-row:last-child { border-bottom: none; font-weight: 700; color: #111; }
          .divider { border: none; border-top: 1px solid #e0dfd8; margin: 12px 0; }
          .customer-box { background: #f5f4f0; padding: 16px 20px; margin: 16px 0; font-size: 13px; color: #444; line-height: 1.8; }
          .btn { display: inline-block; background: #111; color: #fff; text-decoration: none; padding: 12px 24px; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px; }
          .footer { text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e0dfd8; font-size: 11px; color: #bbb; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">NOFOAL</div>
          <div class="badge">&#10003; Payment Received</div>
          <h1>New Order — #${orderId}</h1>

          <div class="customer-box">
            <strong>${customerName}</strong><br>
            ${customerEmail}<br>
            ${customerPhone || '—'}<br>
            <br>
            <span style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;">Ships to</span><br>
            ${(shippingAddress || '—').replace(/\n/g, '<br>')}
          </div>

          <div class="detail-box">
            <div class="detail-row"><span>Order ID</span><span>#${orderId}</span></div>
            <hr class="divider">
            ${itemsHtml}
            <hr class="divider">
            <div class="detail-row"><span>Total Paid</span><span>Rs.${totalAmount.toLocaleString('en-IN')}</span></div>
          </div>

          ${paymentId ? `<p style="font-size:12px;color:#888;">Razorpay Payment ID: <code>${paymentId}</code></p>` : ''}

          <a href="${process.env.FRONTEND_URL}/admin/orders" class="btn">View in Dashboard →</a>

          <div class="footer">Nofoal Admin Notification</div>
        </div>
      </body>
      </html>
    `,
  });
};

/**
 * Send waitlist confirmation
 */
exports.sendWaitlistEmail = async ({ to }) => {
  const transporter = createTransporter();
  const storeUrl = (process.env.FRONTEND_URL || 'https://nofoal.com') + '/products';
  await transporter.sendMail({
    from,
    to,
    subject: "You're on the List — Nofoal Limited Access",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ebebeb;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ebebeb;padding:28px 0;">
  <tr><td align="center">
    <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;max-width:500px;width:100%;">

      <!-- Logo row -->
      <tr>
        <td style="padding:24px 28px 20px;border-bottom:1px solid #e8e8e8;">
          <img src="${process.env.FRONTEND_URL || 'https://nofoal.com'}/asset/images/logo/logo-b.png" alt="NOFOAL" style="height:36px;width:auto;display:block;" />
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:28px 28px 0;">
        <p style="margin:0 0 14px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#888;">[LIMITED ACCESS]</p>
        <h1 style="margin:0 0 14px;font-size:26px;font-weight:700;color:#111;line-height:1.25;">You're on<br>the List.</h1>
        <p style="margin:0 0 22px;font-size:13px;color:#555;line-height:1.65;">
          We've noted <span style="color:#b8902a;">your</span> interest.<br>
          You'll hear from us <span style="color:#b8902a;">first</span> when access opens.
        </p>
        <hr style="border:none;border-top:1px solid #e8e8e8;margin:0 0 20px;">

        <!-- Status rows -->
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:18px;">
          <tr>
            <td width="50%" style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;padding:12px 0;border-bottom:1px solid #f2f2f2;vertical-align:middle;">STATUS</td>
            <td width="50%" align="right" style="padding:12px 0;border-bottom:1px solid #f2f2f2;vertical-align:middle;">
              <span style="display:inline-block;border:1px solid #111;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:4px 11px;color:#111;font-weight:600;">CONFIRMED</span>
            </td>
          </tr>
          <tr>
            <td width="50%" style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;padding:12px 0;border-bottom:1px solid #f2f2f2;vertical-align:middle;">ACCESS WINDOW</td>
            <td width="50%" align="right" style="padding:12px 0;border-bottom:1px solid #f2f2f2;vertical-align:middle;">
              <span style="font-size:11px;color:#555;">48 hrs early &nbsp;·&nbsp;</span><span style="font-size:11px;color:#b8902a;">on release</span>
            </td>
          </tr>
          <tr>
            <td width="50%" style="font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#999;padding:12px 0;vertical-align:middle;">EDITION</td>
            <td width="50%" align="right" style="padding:12px 0;vertical-align:middle;">
              <span style="font-size:11px;color:#555;">Limited &nbsp;·&nbsp;</span><span style="font-size:11px;color:#c0392b;">No Restock</span>
            </td>
          </tr>
        </table>

        <hr style="border:none;border-top:1px solid #e8e8e8;margin:0 0 18px;">

        <!-- Warning box -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px dashed #c9a84c;margin-bottom:18px;">
          <tr><td style="padding:13px 15px;font-size:12px;color:#555;line-height:1.55;">
            <strong style="color:#111;">Don't share this.</strong> Your hold is secure. Nothing moves without you
          </td></tr>
        </table>

        <!-- Compatible note -->
        <p style="margin:0 0 26px;font-size:12px;color:#b8902a;font-style:italic;line-height:1.55;">
          Compatible objects are available separately to expand your carry system.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:30px;">
          <tr><td>
            <a href="${storeUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:13px 38px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;font-weight:600;">VISIT STORE</a>
          </td></tr>
        </table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:14px 28px 18px;border-top:1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:11px;color:#bbb;">&#169; 2026 nofoal</td>
          <td align="right" style="font-size:11px;color:#bbb;">nofoal.com &nbsp;&#8226;&#8226;&#8226;</td>
        </tr></table>
        <p style="margin:8px 0 0;font-size:10px;color:#ccc;text-align:center;letter-spacing:1px;">
          nofoal &nbsp;&#183;&nbsp; objects of intention &nbsp;|&nbsp; waitlist confirmed
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
  });
};

/**
 * Send admin notification when someone joins the waitlist
 */
exports.sendAdminWaitlistNotification = async ({ email }) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return;
  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to: adminEmail,
    subject: `New Waitlist Signup — ${email}`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Arial,sans-serif;">
<div style="max-width:480px;margin:40px auto;background:#fff;padding:36px;">
  <div style="font-size:15px;font-weight:700;letter-spacing:3px;text-transform:uppercase;margin-bottom:24px;">NOFOAL</div>
  <div style="display:inline-block;background:#111;color:#fff;padding:5px 14px;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin-bottom:16px;">New Waitlist Signup</div>
  <p style="font-size:15px;color:#111;margin:0 0 20px;font-weight:600;">Someone just joined the waitlist.</p>
  <div style="background:#f5f4f0;padding:16px 20px;font-size:13px;color:#444;margin-bottom:20px;">
    <strong>Email:</strong> ${email}
  </div>
  <a href="${process.env.FRONTEND_URL || 'https://nofoal.com'}/admin/customers" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:11px 22px;font-size:10px;letter-spacing:2px;text-transform:uppercase;">View Customers →</a>
  <p style="font-size:11px;color:#bbb;margin-top:32px;">Nofoal Admin Notification</p>
</div>
</body>
</html>`,
  });
};

/**
 * Send password reset email
 */
exports.sendPasswordResetEmail = async ({ to, resetUrl, name }) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from,
    to,
    subject: 'Reset Your Nofoal Password',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#ebebeb;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ebebeb;padding:28px 0;">
  <tr><td align="center">
    <table width="500" cellpadding="0" cellspacing="0" style="background:#fff;max-width:500px;width:100%;">

      <!-- Logo -->
      <tr>
        <td style="padding:24px 28px 20px;border-bottom:1px solid #e8e8e8;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="vertical-align:middle;padding-right:4px;">
              <span style="font-size:18px;color:#bbb;font-weight:100;line-height:1;">+</span>
            </td>
            <td style="vertical-align:middle;">
              <span style="font-size:15px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:#111;">NOFOAL</span>
            </td>
          </tr></table>
        </td>
      </tr>

      <!-- Body -->
      <tr><td style="padding:32px 28px 28px;">
        <p style="margin:0 0 6px;font-size:10px;letter-spacing:2.5px;text-transform:uppercase;color:#888;">Account Security</p>
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111;">Reset Your Password</h1>
        <p style="margin:0 0 24px;font-size:13px;color:#555;line-height:1.65;">
          Hi ${name || 'there'},<br><br>
          We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>1 hour</strong>.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr><td>
            <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:2.5px;text-transform:uppercase;font-weight:600;">Reset Password</a>
          </td></tr>
        </table>

        <p style="margin:0 0 8px;font-size:12px;color:#888;line-height:1.6;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="margin:0 0 24px;font-size:11px;color:#b8902a;word-break:break-all;">${resetUrl}</p>

        <hr style="border:none;border-top:1px solid #e8e8e8;margin:0 0 20px;">
        <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
          If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.
        </p>
      </td></tr>

      <!-- Footer -->
      <tr><td style="padding:14px 28px 18px;border-top:1px solid #f0f0f0;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:11px;color:#bbb;">&#169; 2026 nofoal</td>
          <td align="right" style="font-size:11px;color:#bbb;">nofoal.com</td>
        </tr></table>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>`,
  });
};
