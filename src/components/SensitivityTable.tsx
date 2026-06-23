'use client';

import {useMemo} from 'react';
import {generateSensitivityGrid} from '../utils/formulas';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';

interface SensitivityTableProps {
  loanAmount: number;
  currentRate: number;
  currentTenure: number;
}

export default function SensitivityTable({
  loanAmount,
  currentRate,
  currentTenure,
}: SensitivityTableProps) {
  const {rates, tenures, grid} = useMemo(() => {
    return generateSensitivityGrid(loanAmount, currentRate, currentTenure);
  }, [loanAmount, currentRate, currentTenure]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="border-none pb-0 font-bold text-[var(--text-primary)] text-sm normal-case tracking-normal">
          Interest Rate vs Tenure Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
          <table className="min-w-full divide-y divide-[var(--card-border)] text-center font-bold text-[10px]">
            <thead className="bg-[var(--input-bg)]">
              <tr>
                <th
                  scope="col"
                  className="px-2.5 py-2.5 text-left text-[9px] text-[var(--text-muted)] uppercase tracking-wider"
                >
                  Tenure \ Rate
                </th>
                {rates.map((rate) => (
                  <th
                    key={rate}
                    scope="col"
                    className={`px-2.5 py-2.5 text-[var(--text-primary)] ${
                      rate === currentRate
                        ? 'bg-[var(--primary)]/5 font-extrabold text-[var(--primary)]'
                        : ''
                    }`}
                  >
                    {rate.toFixed(1)}%
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--card-border)] bg-[var(--card-bg)]">
              {tenures.map((tenure) => (
                <tr
                  key={tenure}
                  className="transition-colors hover:bg-[var(--input-bg)]/20"
                >
                  <td
                    className={`border-[var(--card-border)] border-r px-2.5 py-3 text-left text-[var(--text-primary)] ${
                      tenure === currentTenure
                        ? 'bg-[var(--primary)]/5 font-medium text-[var(--primary)]'
                        : ''
                    }`}
                  >
                    {tenure} mo
                  </td>
                  {rates.map((rate) => {
                    const emi = grid[tenure]?.[rate] || 0;
                    const isCenter =
                      rate === currentRate && tenure === currentTenure;

                    return (
                      <td
                        key={rate}
                        className={`px-2.5 py-3 font-mono text-xs ${
                          isCenter
                            ? 'rounded-md bg-[var(--primary)] font-medium text-white shadow-sm'
                            : rate === currentRate || tenure === currentTenure
                              ? 'bg-[var(--primary)]/5 text-[var(--text-primary)]'
                              : 'text-[var(--text-secondary)]'
                        }`}
                      >
                        {formatCurrency(emi)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
