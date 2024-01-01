const express = require("express");
const { config: dotenvConfig } = require("dotenv");
const path = require("path");
const { fileURLToPath } = require("url");
const Mailjet = require("node-mailjet");
const serverless = require("serverless-http");

dotenvConfig();

const app = express();
const port = process.env.PORT || 5173;
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));

const mailjet = new Mailjet({
  apiKey: process.env.MJ_APIKEY_PUBLIC,
  apiSecret: process.env.MJ_APIKEY_PRIVATE,
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.post("/submitForm", async (req, res) => {
  const { name, email, subject, message } = req.body;

  const request = mailjet.post("send", { version: "v3.1" }).request({
    Messages: [
      {
        From: {
          Email: process.env.EMAIL_USER,
          Name: "Portfolio",
        },
        To: [
          {
            Email: process.env.EMAIL_USER,
            Name: "Raghav Sharma",
          },
        ],
        Subject: subject,
        TextPart: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
      },
    ],
  });

  try {
    await request;
    console.log("Email sent successfully");
    res.send(
      '<script>alert("Form submitted successfully!"); window.location.href = "/";</script>'
    );
  } catch (error) {
    console.error("Error sending email:", error);
    res.send(
      '<script>alert("Error submitting form"); window.location.href = "/";</script>'
    );
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// app.use(`/.netlify/functions/api`, router);

module.exports = app;
module.exports.handler = serverless(app);
