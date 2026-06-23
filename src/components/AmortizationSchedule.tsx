'use client';

import {
  BarChartOutlined,
  DownloadOutlined,
  TableOutlined,
} from '@ant-design/icons';
import type {TableProps} from 'antd';
import {Segmented, Table} from 'antd';
import dayjs from 'dayjs';
import {useState} from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {exportAmortizationToCSV} from '../utils/csvExport';
import type {AmortizationRow} from '../utils/formulas';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';

interface AmortizationScheduleProps {
  schedule: AmortizationRow[];
  breakEvenMonth: number;
  startDate?: string;
}

export default function AmortizationSchedule({
  schedule,
  breakEvenMonth,
  startDate,
}: AmortizationScheduleProps) {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getCalendarMonth = (monthNumber: number) => {
    if (!startDate) return `Month ${monthNumber}`;
    return dayjs(startDate)
      .add(monthNumber - 1, 'month')
      .format('MMM YYYY');
  };

  const handleDownload = () => {
    exportAmortizationToCSV(schedule);
  };

  const chartData = schedule.map((row) => ({
    month: row.month,
    monthName: getCalendarMonth(row.month),
    principal: Math.round(row.totalPrincipalPaid),
    interest: Math.round(row.interestPaid),
    prepayment: Math.round(row.prepayment),
  }));

  // Define Ant Design Table columns configuration
  const columns: TableProps<AmortizationRow>['columns'] = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (_, record) => {
        const isBreakEven = record.month === breakEvenMonth;
        return (
          <span className="font-bold font-mono text-[var(--text-primary)] text-xs">
            {getCalendarMonth(record.month)}
            {isBreakEven && (
              <span className="ml-2 inline-block rounded bg-[var(--interest-color)] px-1.5 py-0.5 font-bold text-[8px] text-[var(--background)] uppercase tracking-wide">
                Break-even
              </span>
            )}
          </span>
        );
      },
    },
    {
      title: 'Installment',
      dataIndex: 'emi',
      key: 'emi',
      render: (val) => (val > 0 ? formatCurrency(val) : '—'),
    },
    {
      title: 'Principal',
      dataIndex: 'principalPaid',
      key: 'principalPaid',
      render: (val) => formatCurrency(val),
    },
    {
      title: 'Interest',
      dataIndex: 'interestPaid',
      key: 'interestPaid',
      render: (val) => (
        <span className="font-mono text-[var(--interest-color)]">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Prepayment',
      dataIndex: 'prepayment',
      key: 'prepayment',
      render: (val) =>
        val > 0 ? (
          <span className="font-mono text-[var(--principal-color)]">
            {formatCurrency(val)}
          </span>
        ) : (
          '—'
        ),
    },
    {
      title: 'Remaining Balance',
      dataIndex: 'balanceRemaining',
      key: 'balanceRemaining',
      render: (val) => formatCurrency(val),
    },
  ];

  return (
    <Card>
      {/* Header and Actions */}
      <CardHeader className="flex flex-col items-start justify-between gap-4 pb-2 sm:flex-row sm:items-center">
        <CardTitle>Amortization Schedule</CardTitle>

        {/* Action Controls */}
        <div className="flex w-full items-center justify-between gap-2.5 sm:w-auto sm:justify-end">
          <Segmented
            options={[
              {label: 'Table', value: 'table', icon: <TableOutlined />},
              {label: 'Chart', value: 'chart', icon: <BarChartOutlined />},
            ]}
            value={viewMode}
            onChange={(val) => setViewMode(val as 'table' | 'chart')}
            size="middle"
          />

          <button
            type="button"
            onClick={handleDownload}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] px-3 py-1.5 font-semibold text-[var(--text-secondary)] text-xs shadow-xs transition-all duration-200 hover:border-[var(--primary)] hover:bg-[var(--input-bg)]/40 hover:text-[var(--text-primary)] focus:outline-hidden"
          >
            <DownloadOutlined style={{fontSize: '12px'}} />
            <span>Export CSV</span>
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        {/* Amortization Views */}
        {viewMode === 'table' ? (
          <div className="overflow-x-auto rounded-lg">
            <Table<AmortizationRow>
              dataSource={schedule}
              columns={columns}
              rowKey="month"
              pagination={{
                pageSize: 12,
                showSizeChanger: false,
                size: 'small',
              }}
              rowClassName={(record) =>
                record.month === breakEvenMonth
                  ? 'bg-[var(--interest-color)]/5 dark:bg-[var(--interest-color)]/10 font-bold'
                  : ''
              }
              size="small"
              bordered
            />
          </div>
        ) : (
          /* Chart View */
          <div className="h-80 w-full sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{top: 10, right: 10, left: -10, bottom: 5}}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--card-border)"
                />
                <XAxis
                  dataKey="monthName"
                  stroke="var(--text-muted)"
                  fontSize={9}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={9}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                    borderRadius: '8px',
                    fontSize: '10px',
                    color: 'var(--text-primary)',
                    fontWeight: 'bold',
                  }}
                  formatter={(value: any) => [formatCurrency(value), '']}
                />
                <Legend
                  wrapperStyle={{fontSize: '10px', fontWeight: 'bold'}}
                  verticalAlign="bottom"
                  height={32}
                />
                <Bar
                  dataKey="principal"
                  name="Principal"
                  stackId="a"
                  fill="var(--principal-color)"
                />
                <Bar
                  dataKey="interest"
                  name="Interest"
                  stackId="a"
                  fill="var(--interest-color)"
                />
                {schedule.some((row) => row.prepayment > 0) && (
                  <Bar
                    dataKey="prepayment"
                    name="Prepayment"
                    stackId="a"
                    fill="var(--secondary)"
                  />
                )}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
