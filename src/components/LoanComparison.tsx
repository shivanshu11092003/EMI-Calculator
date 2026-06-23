'use client';

import {CheckOutlined} from '@ant-design/icons';
import {Button, Slider} from 'antd';
import {calculateEMI} from '../utils/formulas';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';

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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
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
      <div className="border-[var(--card-border)] border-b pb-3">
        <h2 className="font-semibold text-[var(--text-primary)] text-sm tracking-tight">
          Compare Scenarios
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {results.map((res, index) => {
          const isBest = index === bestIndex;

          const cardContent = (
            <Card className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="m-0">{res.name}</CardTitle>
                  {isBest && (
                    <span className="shrink-0 rounded bg-emerald-500/10 px-2.5 py-0.5 font-bold text-[9px] text-emerald-500 uppercase tracking-wider">
                      Best Deal
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {/* Sliders */}
                <div className="flex flex-col gap-4">
                  {/* Loan Amount */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-bold text-[10px] text-[var(--text-secondary)]">
                      <span>Principal</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {formatCurrency(res.loanAmount)}
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={499}
                      step={1}
                      value={Math.round((res.loanAmount - 10000) / 10000)}
                      onChange={(val) => {
                        const amount = 10000 + val * 10000;
                        if (amount !== res.loanAmount) {
                          onScenarioChange(res.id, {loanAmount: amount});
                        }
                      }}
                      tooltip={{
                        formatter: (val) => {
                          const amount = 10000 + (val || 0) * 10000;
                          return formatCurrency(amount);
                        },
                      }}
                    />
                  </div>

                  {/* Interest Rate */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-bold text-[10px] text-[var(--text-secondary)]">
                      <span>Rate</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {res.interestRate.toFixed(1)}%
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={350}
                      step={1}
                      value={Math.round((res.interestRate - 1) / 0.1)}
                      onChange={(val) => {
                        const rate = parseFloat((1 + val * 0.1).toFixed(1));
                        if (rate !== res.interestRate) {
                          onScenarioChange(res.id, {interestRate: rate});
                        }
                      }}
                      tooltip={{
                        formatter: (val) => {
                          const rate = 1 + (val || 0) * 0.1;
                          return `${Number(rate.toFixed(1))}% p.a.`;
                        },
                      }}
                    />
                  </div>

                  {/* Tenure */}
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between font-bold text-[10px] text-[var(--text-secondary)]">
                      <span>Tenure</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {res.tenure} mo
                      </span>
                    </div>
                    <Slider
                      min={0}
                      max={83}
                      step={1}
                      value={Math.round(res.tenure - 1)}
                      onChange={(val) => {
                        const tenure = 1 + val;
                        if (tenure !== res.tenure) {
                          onScenarioChange(res.id, {tenure: tenure});
                        }
                      }}
                      tooltip={{
                        formatter: (val) => {
                          const tenure = 1 + (val || 0);
                          return `${tenure} mo`;
                        },
                      }}
                    />
                  </div>
                </div>

                {/* Calculated Outputs */}
                <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[var(--card-border)]/60 bg-[var(--input-bg)]/40 p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-300 dark:shadow-none">
                  {/* EMI */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                      EMI
                    </span>
                    <span className="font-bold font-mono text-[var(--text-primary)] text-sm">
                      {formatCurrency(res.emi)}
                    </span>
                  </div>

                  {/* Interest */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                      Interest
                    </span>
                    <span className="font-mono font-semibold text-[var(--interest-color)] text-xs">
                      {formatCurrency(res.totalInterest)}
                    </span>
                  </div>

                  {/* Divider */}
                  <div className="my-0.5 border-[var(--card-border)]/80 border-t border-dashed" />

                  {/* Total */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-[var(--text-primary)] uppercase tracking-wider">
                      Total Payable
                    </span>
                    <span className="font-black font-mono text-[var(--text-primary)] text-sm">
                      {formatCurrency(res.totalPayable)}
                    </span>
                  </div>
                </div>

                {/* Promotion Button */}
                <Button
                  type={isBest ? 'primary' : 'default'}
                  onClick={() => onActivateScenario(res)}
                  icon={isBest ? <CheckOutlined /> : null}
                  style={{width: '100%', marginTop: 16}}
                  size="small"
                >
                  Promote to Workspace
                </Button>
              </CardContent>
            </Card>
          );

          return <div key={res.id}>{cardContent}</div>;
        })}
      </div>
    </div>
  );
}
