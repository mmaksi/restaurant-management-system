import { ConfirmedBlock, Employee } from '@/lib/types';
import { format, addDays } from 'date-fns';

/**
 * Export schedule as PDF by generating HTML and opening print dialog
 */
export const exportScheduleToPDF = (
  confirmedBlocks: ConfirmedBlock[],
  nextWeekStart: Date,
  getEmployeeById: (id: string) => Employee | undefined
) => {
  // Group confirmed blocks by employee
  const scheduleByEmployee: { [employeeId: string]: ConfirmedBlock[] } = {};

  confirmedBlocks.forEach((block) => {
    if (!scheduleByEmployee[block.employeeId]) {
      scheduleByEmployee[block.employeeId] = [];
    }
    scheduleByEmployee[block.employeeId].push(block);
  });

  // Sort blocks by date and time
  Object.keys(scheduleByEmployee).forEach((empId) => {
    scheduleByEmployee[empId].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  });

  // Create HTML content for PDF
  let htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Weekly Schedule - ${format(nextWeekStart, 'MMM d, yyyy')}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      color: #1e293b;
    }
    h1 {
      color: #0f172a;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    .header-info {
      margin-bottom: 30px;
      padding: 15px;
      background-color: #f1f5f9;
      border-radius: 8px;
    }
    .employee-section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }
    .employee-header {
      background-color: #3b82f6;
      color: white;
      padding: 12px 15px;
      border-radius: 8px 8px 0 0;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .role-badge {
      font-size: 14px;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: normal;
    }
    .role-kitchen { background-color: #f97316; }
    .role-service { background-color: #60a5fa; }
    .role-security { background-color: #a855f7; }
    .employee-content {
      border: 2px solid #e2e8f0;
      border-top: none;
      border-radius: 0 0 8px 8px;
      padding: 15px;
    }
    .shift-item {
      padding: 12px;
      margin-bottom: 8px;
      background-color: #f8fafc;
      border-left: 4px solid #3b82f6;
      border-radius: 4px;
      display: flex;
      justify-content: space-between;
    }
    .shift-date {
      font-weight: bold;
      color: #475569;
    }
    .shift-time {
      color: #64748b;
    }
    .shift-duration {
      font-weight: bold;
      color: #3b82f6;
    }
    .total-hours {
      margin-top: 15px;
      padding: 10px;
      background-color: #dbeafe;
      border-radius: 4px;
      text-align: right;
      font-weight: bold;
      color: #1e40af;
    }
    .no-shifts {
      padding: 20px;
      text-align: center;
      color: #94a3b8;
      font-style: italic;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 2px solid #e2e8f0;
      text-align: center;
      color: #64748b;
      font-size: 12px;
    }
    @media print {
      body { margin: 20px; }
      .employee-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <h1>📅 Weekly Work Schedule</h1>
  
  <div class="header-info">
    <p><strong>Week of:</strong> ${format(
      nextWeekStart,
      'EEEE, MMMM d, yyyy'
    )} - ${format(addDays(nextWeekStart, 6), 'EEEE, MMMM d, yyyy')}</p>
    <p><strong>Total Employees Scheduled:</strong> ${
      Object.keys(scheduleByEmployee).length
    }</p>
    <p><strong>Total Shifts:</strong> ${confirmedBlocks.length}</p>
    <p><strong>Generated on:</strong> ${format(
      new Date(),
      "MMMM d, yyyy 'at' h:mm a"
    )}</p>
  </div>
`;

  // Add each employee's schedule
  Object.keys(scheduleByEmployee)
    .sort((a, b) => {
      const empA = getEmployeeById(a);
      const empB = getEmployeeById(b);
      if (!empA || !empB) return 0;
      const nameA =
        empA.first_name && empA.last_name
          ? `${empA.first_name} ${empA.last_name}`
          : empA.first_name || empA.last_name || '';
      const nameB =
        empB.first_name && empB.last_name
          ? `${empB.first_name} ${empB.last_name}`
          : empB.first_name || empB.last_name || '';
      return nameA.localeCompare(nameB);
    })
    .forEach((employeeId) => {
      const employee = getEmployeeById(employeeId);
      if (!employee) return;

      const shifts = scheduleByEmployee[employeeId];
      const totalHours = shifts.reduce((sum, shift) => {
        const hours =
          parseInt(shift.endTime.split(':')[0]) -
          parseInt(shift.startTime.split(':')[0]);
        return sum + hours;
      }, 0);

      const employeeName =
        employee.first_name && employee.last_name
          ? `${employee.first_name} ${employee.last_name}`
          : employee.first_name || employee.last_name || 'Unknown';
      const roleClass = employee.role
        ? `role-${employee.role.toLowerCase()}`
        : 'role-service';
      const roleDisplay = employee.role ? employee.role.toUpperCase() : 'N/A';

      htmlContent += `
  <div class="employee-section">
    <div class="employee-header">
      <span>${employeeName}</span>
      <span class="role-badge ${roleClass}">${roleDisplay}</span>
    </div>
    <div class="employee-content">
`;

      if (shifts.length === 0) {
        htmlContent += `<div class="no-shifts">No shifts scheduled</div>`;
      } else {
        shifts.forEach((shift) => {
          const hours =
            parseInt(shift.endTime.split(':')[0]) -
            parseInt(shift.startTime.split(':')[0]);
          htmlContent += `
      <div class="shift-item">
        <div>
          <div class="shift-date">${format(
            new Date(shift.date),
            'EEEE, MMMM d'
          )}</div>
          <div class="shift-time">${shift.startTime} - ${shift.endTime}</div>
        </div>
        <div class="shift-duration">${hours} hours</div>
      </div>
`;
        });

        htmlContent += `
      <div class="total-hours">
        Total Hours This Week: ${totalHours} hours
      </div>
`;
      }

      htmlContent += `
    </div>
  </div>
`;
    });

  htmlContent += `
  <div class="footer">
    <p>Generated by Restaurant Management System</p>
    <p>Please confirm your availability and report any scheduling conflicts to management.</p>
  </div>
</body>
</html>
`;

  // Create a new window and print
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  }
};
