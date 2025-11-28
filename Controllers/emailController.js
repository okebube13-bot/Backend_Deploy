import sendEmail from "../utils/sendEmail.js";

export const createTask = async (req, res) => {
  // create task normally
  await sendEmail({
    to: assignedUser.email,
    subject: "New Task Assigned",
    html: "<h1>A new task was assigned to you!</h1>",
  });

  res.json({ message: "Task created + email sent" });
};
