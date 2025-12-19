require('dotenv').config();
const { SMTPServer } = require("smtp-server");
const { simpleParser } = require('mailparser');
const mongoose = require('mongoose');
const express = require('express'); 
const cors = require('cors');       
const nodemailer= require("nodemailer");

const app = express();
app.use(cors()); 
app.use(express.json());

//  DATABASE SETUP 
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
  .then(() => console.log(' DB Connected'))
  .catch(err => console.error(' DB Error:', err));

// EMAIL SENDING SETUP 
const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: 'apoorv172900@gmail.com',
    pass: 'gnmf revl kixf ddck'    
  }
});

const EmailSchema = new mongoose.Schema({
    from: String,
    to: String,
    subject: String,
    body: String,
    date: { type: Date, default: Date.now }
});
const EmailModel = mongoose.model('Email', EmailSchema);

// API ROUTES 

app.get('/api/emails', async (req, res) => {
    try {
        // Emails ko nikalte waqt 'sort' karein taaki naya email sabse upar aaye (-1)
        const emails = await EmailModel.find().sort({ date: -1 });
        res.json(emails);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching emails' });
    }
});

// SEND EMAIL ROUTE
app.post('/api/send', async (req, res) => {
  const { to, subject, body } = req.body;

  try {
    const info = await transporter.sendMail({
      from: '"My Mail Server" <apoorv172900@gmail.com>', // Sender address
      to: to, // Receiver address 
      subject: subject,
      text: body, // Plain text body
    });

    console.log("Message sent: %s", info.messageId);
    res.json({ message: 'Email Sent Successfully!' });
  } catch (error) {
    console.error("Sending Error:", error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// DELETE Route: 
app.delete('/api/emails/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await EmailModel.findByIdAndDelete(id);
        res.json({ message: 'Email deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting email' });
    }
});

// HTTP Server Start (Port 5000)
app.listen(5000, () => {
    console.log(" HTTP/API Server running on Port 5000");
});

// --- SMTP SERVER SETUP (OLD SECTION) ---
const server = new SMTPServer({
    secure: false,
    authOptional: true,
    onConnect(session, callback) { callback(); },
    onMailFrom(address, session, callback) { callback(); },
    onRcptTo(address, session, callback) { callback(); },
    onData(stream, session, callback) {
        simpleParser(stream)
            .then(async (parsed) => {
                try {
                    const newEmail = new EmailModel({
                        from: parsed.from.text,
                        subject: parsed.subject,
                        body: parsed.text
                    });
                    await newEmail.save();
                    console.log(" Email Saved!");
                } catch (err) {
                    console.error(" Save Error:", err);
                }
                callback();
            })
            .catch(err => {
                callback(new Error("Error"));
            });
    },
});

// SMTP Server Start (Port 2525)
server.listen(2525, () => {
    console.log(" SMTP Server running on Port 2525");
});