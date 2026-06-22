'use client';

import {CheckOutlined} from '@ant-design/icons';
import {Badge, Button, Slider} from 'antd';
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
      <div className="border-[var(--card-border)] border-b pb-2.5">
        <h2 className="font-bold text-[var(--text-primary)] text-sm">
          Compare Scenarios
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {results.map((res, index) => {
          const isBest = index === bestIndex;

          const cardContent = (
            <Card
              className="flex flex-col"
              style={{
                borderColor: isBest ? 'var(--primary)' : 'var(--card-border)',
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
                    <div className="flex justify-between font-bold text-[10px] text-[var(--text-secondary)]">
                      <span>Principal</span>
                      <span className="font-bold text-[var(--text-primary)]">
                        {formatCurrency(res.loanAmount)}
                      </span>
                    </div>
                    <Slider
                      min={10000}
                      max={5000000}
                      step={10000}
                      value={res.loanAmount}
                      onChange={(val) =>
                        onScenarioChange(res.id, {loanAmount: val})
                      }
                      tooltip={{formatter: (val) => formatCurrency(val || 0)}}
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
                      min={1}
                      max={36}
                      step={0.1}
                      value={res.interestRate}
                      onChange={(val) =>
                        onScenarioChange(res.id, {interestRate: val})
                      }
                      tooltip={{formatter: (val) => `${val}% p.a.`}}
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
                      min={1}
                      max={84}
                      step={1}
                      value={res.tenure}
                      onChange={(val) =>
                        onScenarioChange(res.id, {tenure: val})
                      }
                      tooltip={{formatter: (val) => `${val} mo`}}
                    />
                  </div>
                </div>

                {/* Calculated Outputs */}
                <div className="mt-4 flex flex-col gap-2 rounded-lg bg-[var(--input-bg)] p-3">
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-[var(--text-secondary)]">EMI</span>
                    <span className="font-mono text-[var(--text-primary)]">
                      {formatCurrency(res.emi)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-[var(--text-secondary)]">
                      Interest
                    </span>
                    <span className="text font-mono text-[var(--interest-color)]">
                      {formatCurrency(res.totalInterest)}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between border-[var(--card-border)] border-t pt-2 font-bold text-xs">
                    <span className="text-[var(--text-primary)]">Total</span>
                    <span className="font-extrabold font-mono text-[var(--text-primary)] text-xs">
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
