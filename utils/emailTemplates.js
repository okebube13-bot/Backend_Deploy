export const taskAssignedTemplate = (user, task) => `
  <div style="font-family: Arial; padding: 20px;">
    <h2>Hello ${user.name},</h2>
    <p>You have been assigned a new task:</p>

    <div style="
      padding: 15px;
      background: #f5f5f5;
      border-left: 4px solid #3b82f6;
      margin: 20px 0;
    ">
      <h3 style="margin: 0;">${task.title}</h3>
      <p style="margin: 10px 0;">${task.description}</p>
      <p><strong>Priority:</strong> ${task.priority}</p>
      <p><strong>Due Date:</strong> ${new Date(
        task.dueDate
      ).toLocaleDateString()}</p>
    </div>

    <p>Regards,</p>
    <p><strong>ValueMax Task Management System</strong></p>
  </div>
`;
