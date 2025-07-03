// utils/sendOrderEmail.js
const nodemailer = require("nodemailer");

const sendOrderEmail = async (order) => {
  if (!order?.customer?.email) {
    console.log("❌ No email provided for order");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail", // or use "smtp.ethereal.email" for testing
    auth: {
      user: process.env.MAIL_USER, // Your email from .env
      pass: process.env.MAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: `"Pizza Shop" <${process.env.MAIL_USER}>`,
    to: order.customer.email,
    subject: "Your Order Receipt",
    html: `
      <h3>Hi ${order.customer.name},</h3>
      <p>Thanks for your order! Here are your order details:</p>
      <ul>
        ${order.items.map(item => `
          <li>${item.name} (${item.size}) x ${item.quantity} = Rs ${item.price * item.quantity}</li>
        `).join('')}
      </ul>
      <p><strong>Total:</strong> Rs ${order.totalPrice}</p>
      <p>We’ll deliver your order soon. Thanks again!</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${order.customer.email}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error.message);
  }
};

module.exports = sendOrderEmail;
