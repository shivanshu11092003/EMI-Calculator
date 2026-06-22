"use client";

import React, { useMemo } from "react";
import { generateSensitivityGrid } from "../utils/formulas";

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
  const { rates, tenures, grid } = useMemo(() => {
    return generateSensitivityGrid(loanAmount, currentRate, currentTenure);
  }, [loanAmount, currentRate, currentTenure]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="flex flex-col gap-4 p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm">
      <div className="border-b border-[var(--card-border)] pb-2.5">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Interest Rate vs Tenure Matrix
        </h2>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--card-border)]">
        <table className="min-w-full divide-y divide-[var(--card-border)] text-center text-[10px] font-bold">
          <thead className="bg-[var(--input-bg)]">
            <tr>
              <th scope="col" className="px-2.5 py-2.5 text-left text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
                Tenure \ Rate
              </th>
              {rates.map((rate) => (
                <th
                  key={rate}
                  scope="col"
                  className={`px-2.5 py-2.5 text-[var(--text-primary)] ${
                    rate === currentRate ? "bg-[var(--primary)]/5 font-extrabold text-[var(--primary)]" : ""
                  }`}
                >
                  {rate.toFixed(1)}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--card-border)] bg-[var(--card-bg)]">
            {tenures.map((tenure) => (
              <tr key={tenure} className="hover:bg-[var(--input-bg)]/20 transition-colors">
                <td
                  className={`px-2.5 py-3 text-left text-[var(--text-primary)] border-r border-[var(--card-border)] ${
                    tenure === currentTenure ? "bg-[var(--primary)]/5 font-extrabold text-[var(--primary)]" : ""
                  }`}
                >
                  {tenure} mo
                </td>
                {rates.map((rate) => {
                  const emi = grid[tenure]?.[rate] || 0;
                  const isCenter = rate === currentRate && tenure === currentTenure;

                  return (
                    <td
                      key={rate}
                      className={`px-2.5 py-3 font-mono text-xs ${
                        isCenter
                          ? "bg-[var(--primary)] text-white font-extrabold rounded-md shadow-sm"
                          : rate === currentRate || tenure === currentTenure
                          ? "bg-[var(--primary)]/5 text-[var(--text-primary)]"
                          : "text-[var(--text-secondary)]"
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
    </div>
  );
}
