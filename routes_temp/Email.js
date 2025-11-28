// import router from "./authRoutes";
import express from "express";
const router = express.Router();

router.get("/email", async (req, res) => {
  try {
    await sendEmail({
      to: "alphamichael319@gmail.com",
      subject: "Test Email",
      html: "<h1>This works!</h1>",
    });
    res.send("Sent!");
  } catch (err) {
    res.status(500).send("Error sending email", { err: err.message });
  }
});

export default router;
