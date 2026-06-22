"use client";

import { CheckOutlined } from "@ant-design/icons";
import { Badge, Button, Slider } from "antd";
import { calculateEMI } from "../utils/formulas";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface Scenario {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  tenure: number;
}

interface LoanComparisonProps {
  scenarios: Scenario[];
  onScenarioChange: (id: string, updates: Partial<Scenario>) => void;
  onActivateScenario: (scenario: Scenario) => void;
}

export default function LoanComparison({
  scenarios,
  onScenarioChange,
  onActivateScenario,
}: LoanComparisonProps) {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const results = scenarios.map((sc) => {
    const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
    const totalPayable = emi * sc.tenure;
    const totalInterest = Math.max(0, totalPayable - sc.loanAmount);

    return {
      ...sc,
      emi,
      totalPayable,
      totalInterest,
    };
  });

  let bestIndex = 0;
  let minTotalPayable = Infinity;
  results.forEach((res, index) => {
    if (res.totalPayable < minTotalPayable && res.totalPayable > 0) {
      minTotalPayable = res.totalPayable;
      bestIndex = index;
    }
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="border-b border-[var(--card-border)] pb-2.5">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Compare Scenarios
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {results.map((res, index) => {
          const isBest = index === bestIndex;

          const cardContent = (
            <Card
              className="flex flex-col"
              style={{
                borderColor: isBest ? "var(--primary)" : "var(--card-border)",
              }}
            >
              <CardHeader>
                <CardTitle className="m-0 border-b-0 pb-0">
                  {res.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Sliders */}
                <div className="flex flex-col gap-4">
                  {/* Loan Amount */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                      <span>Principal</span>
                      <span className="text-[var(--text-primary)] font-bold">
                        {formatCurrency(res.loanAmount)}
                      </span>
                    </div>
                    <Slider
                      min={10000}
                      max={5000000}
                      step={10000}
                      value={res.loanAmount}
                      onChange={(val) => onScenarioChange(res.id, { loanAmount: val })}
                      tooltip={{ formatter: (val) => formatCurrency(val || 0) }}
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                      <span>Rate</span>
                      <span className="text-[var(--text-primary)] font-bold">
                        {res.interestRate.toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={36}
                      step={0.1}
                      value={res.interestRate}
                      onChange={(val) => onScenarioChange(res.id, { interestRate: val })}
                      tooltip={{ formatter: (val) => `${val}% p.a.` }}
                    />
                  </div>

                  {/* Tenure */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-bold text-[var(--text-secondary)]">
                      <span>Tenure</span>
                      <span className="text-[var(--text-primary)] font-bold">
                        {res.tenure} mo
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={84}
                      step={1}
                      value={res.tenure}
                      onChange={(val) => onScenarioChange(res.id, { tenure: val })}
                      tooltip={{ formatter: (val) => `${val} mo` }}
                    />
                  </div>
                </div>

                {/* Calculated Outputs */}
                <div className="flex flex-col gap-2 p-3 rounded-lg bg-[var(--input-bg)] mt-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[var(--text-secondary)]">EMI</span>
                    <span className="text-[var(--text-primary)] font-mono">
                      {formatCurrency(res.emi)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-[var(--text-secondary)]">Interest</span>
                    <span className="text text-[var(--interest-color)] font-mono">
                      {formatCurrency(res.totalInterest)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-bold border-t border-[var(--card-border)] pt-2 mt-0.5">
                    <span className="text-[var(--text-primary)]">Total</span>
                    <span className="text-xs font-extrabold text-[var(--text-primary)] font-mono">
                      {formatCurrency(res.totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Promotion Button */}
                <Button
                  type={isBest ? "primary" : "default"}
                  onClick={() => onActivateScenario(res)}
                  icon={isBest ? <CheckOutlined /> : null}
                  style={{ width: "100%", marginTop: 16 }}
                  size="small"
                >
                  Promote to Workspace
                </Button>
              </CardContent>
            </Card>
          );

          if (isBest) {
            return (
              <Badge.Ribbon key={res.id} text="Best Deal" color="green">
                {cardContent}
              </Badge.Ribbon>
            );
          }

          return <div key={res.id}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}
