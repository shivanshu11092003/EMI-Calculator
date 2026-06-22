import { AmortizationRow } from "./formulas";

/**
 * Downloads the amortization schedule as a CSV file.
 */
export function exportAmortizationToCSV(schedule: AmortizationRow[], fileName = "amortization-schedule.csv") {
  const headers = [
    "Month",
    "EMI (₹)",
    "Principal Paid (₹)",
    "Prepayment (₹)",
    "Total Principal Paid (₹)",
    "Interest Paid (₹)",
    "Remaining Balance (₹)",
  ];

  const csvRows = [headers.join(",")];

  schedule.forEach((row) => {
    const values = [
      row.month,
      row.emi.toFixed(2),
      row.principalPaid.toFixed(2),
      row.prepayment.toFixed(2),
      row.totalPrincipalPaid.toFixed(2),
      row.interestPaid.toFixed(2),
      row.balanceRemaining.toFixed(2),
    ];
    csvRows.push(values.join(","));
  });

  const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
  const encodedUri = encodeURI(csvContent);
  
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
