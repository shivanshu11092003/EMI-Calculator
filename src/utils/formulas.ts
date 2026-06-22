/**
 * Standard reducing-balance EMI Calculator formulas
 */

export interface Prepayment {
  id: string;
  month: number;
  amount: number;
}

export interface AmortizationRow {
  month: number;
  emi: number;
  principalPaid: number;
  prepayment: number;
  totalPrincipalPaid: number;
  interestPaid: number;
  balanceRemaining: number;
}

export interface AmortizationScheduleResult {
  schedule: AmortizationRow[];
  totalInterest: number;
  totalAmountPayable: number;
  breakEvenMonth: number;
  actualTenure: number;
  originalTotalInterest: number;
  interestSaved: number;
  tenureReduced: number;
}

/**
 * Calculates standard monthly EMI
 * P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateEMI(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate <= 0) return principal / tenureMonths;

  const r = annualRate / 12 / 100;
  const n = tenureMonths;

  try {
    const rateFactor = (1 + r) ** n;
    const emi = (principal * r * rateFactor) / (rateFactor - 1);
    return Number.isNaN(emi) || !Number.isFinite(emi) ? 0 : emi;
  } catch (_error) {
    return 0;
  }
}

/**
 * Generates month-by-month amortization schedule, incorporating prepayments.
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  tenureMonths: number,
  prepayments: Prepayment[] = [],
): AmortizationScheduleResult {
  const r = annualRate / 12 / 100;
  const standardEMI = calculateEMI(principal, annualRate, tenureMonths);

  // Group prepayments by month (sum multiple prepayments in the same month)
  const prepaymentMap: Record<number, number> = {};
  prepayments.forEach((p) => {
    // Only apply prepayment if it's within a valid month
    if (p.month > 0) {
      prepaymentMap[p.month] = (prepaymentMap[p.month] || 0) + p.amount;
    }
  });

  // 1. Calculate original standard total interest (for savings comparison)
  let origBalance = principal;
  let originalTotalInterest = 0;
  for (let m = 1; m <= tenureMonths; m++) {
    const interest = origBalance * r;
    let principalPaid = standardEMI - interest;
    if (principalPaid >= origBalance) {
      principalPaid = origBalance;
      origBalance = 0;
    } else {
      origBalance -= principalPaid;
    }
    originalTotalInterest += interest;
    if (origBalance <= 0) break;
  }

  // 2. Generate actual schedule with prepayments
  let balance = principal;
  const schedule: AmortizationRow[] = [];
  let totalInterest = 0;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  let breakEvenMonth = -1;

  // Loop up to 360 months maximum to avoid infinite loops, though tenure is <= 84
  for (let month = 1; month <= 360; month++) {
    const prepayment = prepaymentMap[month] || 0;

    // Prepayment is applied to the balance at the start of the month, before interest
    if (prepayment > 0) {
      balance = Math.max(0, balance - prepayment);
    }

    if (balance <= 0) {
      // If prepayment fully clears the balance
      if (prepayment > 0 && schedule.length > 0) {
        // Update the last row or append a closing row representing prepayment
        const _lastRow = schedule[schedule.length - 1];
        // If we want to record the prepayment at this month:
        schedule.push({
          month,
          emi: 0,
          principalPaid: 0,
          prepayment,
          totalPrincipalPaid: prepayment,
          interestPaid: 0,
          balanceRemaining: 0,
        });
        cumulativePrincipal += prepayment;
      }
      break;
    }

    const interestPaid = balance * r;
    let principalPaid = standardEMI - interestPaid;

    if (principalPaid >= balance) {
      principalPaid = balance;
      balance = 0;
    } else {
      balance = balance - principalPaid;
    }

    const emiPaid = principalPaid + interestPaid;
    totalInterest += interestPaid;
    cumulativeInterest += interestPaid;
    cumulativePrincipal += principalPaid + prepayment;

    if (breakEvenMonth === -1 && cumulativePrincipal > cumulativeInterest) {
      breakEvenMonth = month;
    }

    schedule.push({
      month,
      emi: emiPaid,
      principalPaid,
      prepayment,
      totalPrincipalPaid: principalPaid + prepayment,
      interestPaid,
      balanceRemaining: balance,
    });

    if (balance <= 0) {
      break;
    }
  }

  const actualTenure = schedule.length;
  const totalAmountPayable = principal + totalInterest;
  const interestSaved = Math.max(0, originalTotalInterest - totalInterest);
  const tenureReduced = Math.max(0, tenureMonths - actualTenure);

  return {
    schedule,
    totalInterest,
    totalAmountPayable,
    breakEvenMonth: breakEvenMonth === -1 ? actualTenure : breakEvenMonth,
    actualTenure,
    originalTotalInterest,
    interestSaved,
    tenureReduced,
  };
}

/**
 * Generates what-if sensitivity table grid coordinates and values.
 */
export function generateSensitivityGrid(
  principal: number,
  currentRate: number,
  currentTenure: number,
) {
  // Rates: currentRate ± 1%, ± 2%, ± 3% (clamped to 1-36%)
  const rateOffsets = [-3, -2, -1, 0, 1, 2, 3];
  const rates = Array.from(
    new Set(
      rateOffsets.map((offset) =>
        Math.min(36, Math.max(1, currentRate + offset)),
      ),
    ),
  ).sort((a, b) => a - b);

  // Tenures: currentTenure ± 6, ± 12, ± 24 months (clamped to 1-84 months)
  const tenureOffsets = [-24, -12, -6, 0, 6, 12, 24];
  const tenures = Array.from(
    new Set(
      tenureOffsets.map((offset) =>
        Math.min(84, Math.max(1, currentTenure + offset)),
      ),
    ),
  ).sort((a, b) => a - b);

  // Build grid: grid[tenure][rate] = EMI
  const grid: Record<number, Record<number, number>> = {};

  tenures.forEach((t) => {
    grid[t] = {};
    rates.forEach((r) => {
      grid[t][r] = calculateEMI(principal, r, t);
    });
  });

  return {
    rates,
    tenures,
    grid,
  };
}
