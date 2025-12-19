const nodemailer = require("nodemailer");

async function sendTestEmail() {
  
  let transporter = nodemailer.createTransport({
    host: "localhost",
    port: 2525,
    secure: false, 
    tls: {
      rejectUnauthorized: false 
    }
  });

  
  console.log(" Sending email...");
  let info = await transporter.sendMail({
    from: '"Rishi" <me@test.com>', // Sender address
    to: "server@localhost", // List of receivers
    subject: "Testing  new changes ", // Subject line
    text: "Congratulations! If this message has reached you than everything is working fine. ", // Plain text body
  });

  console.log(" Message sent: %s", info.messageId);
}

sendTestEmail().catch(console.error);