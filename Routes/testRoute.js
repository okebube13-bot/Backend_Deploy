import express from "express";
import sendEmail from "../utils/sendEmail.js";
import { taskAssignedTemplate } from "../utils/emailTemplates.js";

const router = express.Router();

router.get("/email", async (req, res) => {
  try {
    await sendEmail({
      to: "youremail@gmail.com",
      subject: "Test HTML Email",
      html: taskAssignedTemplate(
        { name: "Test User" },
        {
          title: "Sample Task",
          description: "This is a test email.",
          dueDate: new Date(),
          priority: "medium",
        }
      ),
    });

    res.send("Test email sent");
  } catch (err) {
    console.error(err);
    res.status(500).send("Email failed");
  }
});

export default router;
