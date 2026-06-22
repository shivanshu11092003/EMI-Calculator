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
}

export default function InputPanel({
  loanAmount,
  interestRate,
  tenure,
  startDate,
  onChange,
}: InputPanelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Details</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {/* Loan Amount */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold text-[var(--text-secondary)] text-xs">
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
              formatter={(value) =>
                `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value) =>
                value ? parseFloat(value.replace(/₹\s?|(,*)/g, '')) : 10000
              }
              style={{width: 130}}
              size="small"
            />
          </div>
          <Slider
            min={10000}
            max={5000000}
            step={5000}
            value={loanAmount}
            onChange={(val) => {
              if (val !== loanAmount) onChange({loanAmount: val});
            }}
            tooltip={{
              formatter: (val) =>
                new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(val || 0),
            }}
          />
          <div className="flex justify-between font-bold text-[var(--text-muted)] text-xs">
            <span>₹10k</span>
            <span>₹50L</span>
          </div>
        </div>

        {/* Interest Rate */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold text-[var(--text-secondary)] text-xs">
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
              formatter={(value) => `${value}%`}
              parser={(value) =>
                value ? parseFloat(value.replace('%', '')) : 1
              }
              style={{width: 80}}
              size="small"
            />
          </div>
          <Slider
            min={1}
            max={36}
            step={0.05}
            value={interestRate}
            onChange={(val) => {
              if (val !== interestRate) onChange({interestRate: val});
            }}
            tooltip={{formatter: (val) => `${val}% p.a.`}}
          />
          <div className="flex justify-between font-bold text-[var(--text-muted)] text-xs">
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
              formatter={(value) => `${value} mo`}
              parser={(value) =>
                value ? parseInt(value.replace(' mo', ''), 10) : 1
              }
              style={{width: 80}}
              size="small"
            />
          </div>
          <Slider
            min={1}
            max={84}
            step={1}
            value={tenure}
            onChange={(val) => {
              if (val !== tenure) onChange({tenure: val});
            }}
            tooltip={{
              formatter: (val) => {
                if (!val) return '0 mo';
                const yrs = Math.floor(val / 12);
                const mos = val % 12;
                return `${yrs > 0 ? `${yrs}y ` : ''}${mos > 0 ? `${mos}m` : ''}`;
              },
            }}
          />
          <div className="flex justify-between font-bold text-[var(--text-muted)] text-xs">
            <span>1 month</span>
            <span>84 months (7y)</span>
          </div>
        </div>

        {/* Start Month */}
        <div className="flex flex-col gap-2 border-[var(--card-border)] border-t pt-2">
          <div className="flex items-center justify-between font-bold text-[var(--text-secondary)] text-xs">
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
