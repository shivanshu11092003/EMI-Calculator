'use client';

import {DatePicker, InputNumber, Slider} from 'antd';
import dayjs from 'dayjs';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';

interface InputPanelProps {
  loanAmount: number;
  interestRate: number;
  tenure: number;
  startDate?: string;
  onChange: (updates: {
    loanAmount?: number;
    interestRate?: number;
    tenure?: number;
    startDate?: string;
  }) => void;
  className?: string;
}

export default function InputPanel({
  loanAmount,
  interestRate,
  tenure,
  startDate,
  onChange,
  className,
}: InputPanelProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Loan Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Loan Amount */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)] text-xs">
            <span>Principal (P)</span>
            <InputNumber<number>
              min={10000}
              max={5000000}
              step={5000}
              value={loanAmount}
              onChange={(val) => {
                if (val !== null && val !== loanAmount)
                  onChange({loanAmount: val});
              }}
              prefix="₹"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) =>
                value ? parseFloat(value.replace(/(,*)/g, '')) : 10000
              }
              style={{width: 130}}
              size="small"
            />
          </div>
          <Slider
            min={0}
            max={998}
            step={1}
            value={Math.round((loanAmount - 10000) / 5000)}
            onChange={(val) => {
              const amount = 10000 + val * 5000;
              if (amount !== loanAmount) {
                onChange({loanAmount: amount});
              }
            }}
            tooltip={{
              formatter: (val) => {
                const amount = 10000 + (val || 0) * 5000;
                return new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(amount);
              },
            }}
          />
          <div className="flex justify-between font-semibold text-[var(--text-muted)] text-xs">
            <span>₹10k</span>
            <span>₹50L</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)] text-xs">
            <span>Interest Rate (%)</span>
            <InputNumber<number>
              min={1}
              max={36}
              step={0.1}
              value={interestRate}
              onChange={(val) => {
                if (val !== null && val !== interestRate)
                  onChange({interestRate: val});
              }}
              suffix="%"
              style={{width: 80}}
              size="small"
            />
          </div>
          <Slider
            min={0}
            max={700}
            step={1}
            value={Math.round((interestRate - 1) / 0.05)}
            onChange={(val) => {
              const rate = parseFloat((1 + val * 0.05).toFixed(2));
              if (rate !== interestRate) {
                onChange({interestRate: rate});
              }
            }}
            tooltip={{
              formatter: (val) => {
                const rate = 1 + (val || 0) * 0.05;
                return `${Number(rate.toFixed(2))}% p.a.`;
              },
            }}
          />
          <div className="flex justify-between font-semibold text-[var(--text-muted)] text-xs">
            <span>1%</span>
            <span>36%</span>
          </div>
        </div>

        {/* Tenure */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold text-[var(--text-secondary)] text-xs">
            <span>Tenure (Months)</span>
            <InputNumber<number>
              min={1}
              max={84}
              step={1}
              value={tenure}
              onChange={(val) => {
                if (val !== null && val !== tenure) onChange({tenure: val});
              }}
              suffix="mo"
              style={{width: 80}}
              size="small"
            />
          </div>
          <Slider
            min={0}
            max={83}
            step={1}
            value={Math.round(tenure - 1)}
            onChange={(val) => {
              const months = 1 + val;
              if (months !== tenure) {
                onChange({tenure: months});
              }
            }}
            tooltip={{
              formatter: (val) => {
                const months = 1 + (val || 0);
                const yrs = Math.floor(months / 12);
                const mos = months % 12;
                return `${yrs > 0 ? `${yrs}y ` : ''}${mos > 0 ? `${mos}m` : ''}`;
              },
            }}
          />
          <div className="flex justify-between font-semibold text-[var(--text-muted)] text-xs">
            <span>1 month</span>
            <span>84 months (7y)</span>
          </div>
        </div>

        {/* Start Month */}
        <div className="flex flex-col gap-2 border-[var(--card-border)] border-t pt-2">
          <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)] text-xs">
            <span>Start Month</span>
            <DatePicker
              picker="month"
              value={startDate ? dayjs(startDate) : dayjs()}
              onChange={(date) => {
                if (date) {
                  onChange({startDate: date.format('YYYY-MM')});
                }
              }}
              format="MMM YYYY"
              allowClear={false}
              size="small"
              style={{width: 130}}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
