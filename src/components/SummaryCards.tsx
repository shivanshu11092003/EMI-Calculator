"use client";

import { CalculatorOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Descriptions, Popover, Tooltip } from "antd";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface SummaryCardsProps {
  monthlyEMI: number;
  totalInterest: number;
  totalAmountPayable: number;
  principal: number;
  interestRate: number;
  tenure: number;
}

export default function SummaryCards({
  monthlyEMI,
  totalInterest,
  totalAmountPayable,
  principal,
  interestRate,
  tenure,
}: SummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const total = totalAmountPayable > 0 ? totalAmountPayable : 1;
  const principalPercent = (principal / total) * 100;
  const interestPercent = (totalInterest / total) * 100;

  // EMI formula details for the Popover
  const emiFormulaContent = (
    <div className="p-1 max-w-sm flex flex-col gap-2.5 text-xs">
      <p className="font-bold text-sm border-b pb-1 text-[var(--text-primary)]">
        Reducing-Balance Formula
      </p>
      <div className="bg-[var(--input-bg)] p-2 rounded-lg font-mono text-center text-xs text-[var(--text-primary)]">
        EMI = [P x r x (1+r)^n] / [(1+r)^n - 1]
      </div>
      <div className="flex flex-col gap-1 text-[var(--text-secondary)]">
        <p><strong>P (Principal):</strong> {formatCurrency(principal)}</p>
        <p><strong>r (Monthly Rate):</strong> annual rate / 12 / 100 = {(interestRate / 12 / 100).toFixed(6)}</p>
        <p><strong>n (Tenure):</strong> {tenure} months</p>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] italic pt-1 border-t">
        Early installments pay more interest, while later ones repay more principal.
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* 3 Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Monthly EMI */}
        <Popover content={emiFormulaContent} title={null} trigger="hover">
          <Card className="cursor-help flex flex-col gap-1 p-4.5 hover:border-[var(--primary)] transition-all">
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1">
              Monthly EMI <CalculatorOutlined className="text-[var(--primary)]" />
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[var(--primary)] font-mono">
              {formatCurrency(monthlyEMI)}
            </span>
          </Card>
        </Popover>

        {/* Total Interest Payable */}
        <Tooltip title="Total interest accumulated over the full tenure." trigger="hover">
          <Card className="cursor-help flex flex-col gap-1 p-4.5 hover:border-[var(--interest-color)] transition-all">
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1">
              Interest Payable <InfoCircleOutlined className="text-[var(--interest-color)]" />
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[var(--interest-color)] font-mono">
              {formatCurrency(totalInterest)}
            </span>
          </Card>
        </Tooltip>

        {/* Total Amount Payable */}
        <Tooltip title="The sum of principal and interest payable over the loan term." trigger="hover">
          <Card className="cursor-help flex flex-col gap-1 p-4.5 hover:border-[var(--text-primary)] transition-all">
            <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase flex items-center gap-1">
              Total Payable <InfoCircleOutlined className="text-[var(--text-muted)]" />
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] font-mono">
              {formatCurrency(totalAmountPayable)}
            </span>
          </Card>
        </Tooltip>
      </div>

      {/* Ant Design Descriptions for Detailed Summary */}
      <Card>
        <CardContent className="p-4.5">
          <Descriptions
            title={<span className="text-xs font-bold uppercase tracking-wider text-[var(--text-secondary)]">Loan Overview</span>}
            bordered
            column={{ xxl: 3, xl: 3, lg: 3, md: 3, sm: 2, xs: 1 }}
            size="small"
          >
            <Descriptions.Item label="Principal">{formatCurrency(principal)}</Descriptions.Item>
            <Descriptions.Item label="Interest Rate">{interestRate}% p.a.</Descriptions.Item>
            <Descriptions.Item label="Duration">{tenure} Months</Descriptions.Item>
            <Descriptions.Item label="Total Interest">{formatCurrency(totalInterest)}</Descriptions.Item>
            <Descriptions.Item label="Total Payable">{formatCurrency(totalAmountPayable)}</Descriptions.Item>
            <Descriptions.Item label="Ratio (P / I)">
              <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                <span className="font-mono font-bold text-[var(--principal-color)] shrink-0">{principalPercent.toFixed(0)}%</span>
                <div className="w-16 h-1.5 rounded-full overflow-hidden flex bg-[var(--input-bg)] shrink-0">
                  <div
                    style={{ width: `${principalPercent}%` }}
                    className="h-full bg-[var(--principal-color)]"
                  />
                  <div
                    style={{ width: `${interestPercent}%` }}
                    className="h-full bg-[var(--interest-color)]"
                  />
                </div>
                <span className="font-mono font-bold text-[var(--interest-color)] shrink-0">{interestPercent.toFixed(0)}%</span>
              </div>
            </Descriptions.Item>
          </Descriptions>
        </CardContent>
      </Card>

      {/* Split Bar Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="border-none pb-0 text-xs font-bold text-[var(--text-primary)] normal-case tracking-normal">
            Payment Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3.5 pt-0">
          {/* Stacked Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[var(--input-bg)]">
            <div
              style={{ width: `${principalPercent}%` }}
              className="h-full bg-[var(--principal-color)] transition-all duration-300"
              title={`Principal: ${principalPercent.toFixed(1)}%`}
            />
            <div
              style={{ width: `${interestPercent}%` }}
              className="h-full bg-[var(--interest-color)] transition-all duration-300"
              title={`Interest: ${interestPercent.toFixed(1)}%`}
            />
          </div>

          {/* Legend */}
          <div className="flex justify-between items-center gap-4 text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--principal-color)]"></span>
              <span className="text-[var(--text-secondary)]">Principal:</span>
              <span className="text-[var(--text-primary)]">{principalPercent.toFixed(1)}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[var(--interest-color)]"></span>
              <span className="text-[var(--text-secondary)]">Interest:</span>
              <span className="text-[var(--text-primary)]">{interestPercent.toFixed(1)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
