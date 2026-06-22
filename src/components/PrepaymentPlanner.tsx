'use client';

import {
  DeleteOutlined,
  GiftOutlined,
  HourglassOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import type {TableProps} from 'antd';
import {Button, Form, InputNumber, Popconfirm, Table} from 'antd';
import type {Prepayment} from '../utils/formulas';
import {Card, CardContent, CardHeader, CardTitle} from './ui/card';

interface PrepaymentPlannerProps {
  prepayments: Prepayment[];
  tenure: number;
  interestSaved: number;
  tenureReduced: number;
  onAddPrepayment: (prepayment: {month: number; amount: number}) => void;
  onRemovePrepayment: (id: string) => void;
}

export default function PrepaymentPlanner({
  prepayments,
  tenure,
  interestSaved,
  tenureReduced,
  onAddPrepayment,
  onRemovePrepayment,
}: PrepaymentPlannerProps) {
  const [form] = Form.useForm();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleFinish = (values: {amount: number; month: number}) => {
    onAddPrepayment({month: values.month, amount: values.amount});
    form.resetFields();
  };

  // Define Ant Design columns for Prepayment schedule list with Popconfirm integration
  const columns: TableProps<Prepayment>['columns'] = [
    {
      title: 'Month',
      dataIndex: 'month',
      key: 'month',
      render: (val) => <span className="font-mono text-xs">Month {val}</span>,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => (
        <span className="font-bold font-mono text-[var(--primary)] text-xs">
          {formatCurrency(val)}
        </span>
      ),
    },
    {
      title: 'Delete',
      key: 'action',
      align: 'right',
      render: (_, record) => (
        <Popconfirm
          title="Delete Prepayment"
          description={`Are you sure you want to delete the Month ${record.month} prepayment?`}
          onConfirm={() => onRemovePrepayment(record.id)}
          okText="Yes"
          cancelText="No"
          placement="left"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            aria-label={`Remove Month ${record.month} Prepayment`}
          />
        </Popconfirm>
      ),
    },
  ];

  const sortedPrepayments = [...prepayments].sort((a, b) => a.month - b.month);

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="border-[var(--card-border)] border-b pb-2.5">
        <h2 className="font-bold text-[var(--text-primary)] text-sm">
          Prepayment Planner
        </h2>
      </div>

      {/* Impact Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Interest Saved */}
        <div className="flex items-center gap-3.5 rounded-lg border border-[var(--interest-color)]/10 bg-[var(--interest-color)]/5 p-4.5 shadow-sm">
          <div className="flex items-center justify-center rounded-lg bg-[var(--interest-color)] p-2.5 text-white">
            <GiftOutlined style={{fontSize: 18}} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              Interest Saved
            </span>
            <span className="font-extrabold font-mono text-[var(--interest-color)] text-xl">
              {formatCurrency(interestSaved)}
            </span>
          </div>
        </div>

        {/* Tenure Reduced */}
        <div className="flex items-center gap-3.5 rounded-lg border border-indigo-500/10 bg-indigo-500/5 p-4.5 shadow-sm">
          <div className="flex items-center justify-center rounded-lg bg-indigo-500 p-2.5 text-white">
            <HourglassOutlined style={{fontSize: 18}} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              Tenure Reduced
            </span>
            <span className="font-extrabold font-mono text-indigo-500 text-xl">
              {tenureReduced} mo
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Prepayment Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 border-[var(--card-border)] border-b pb-2 font-bold text-[var(--text-primary)] text-xs normal-case">
              <PlusOutlined style={{color: 'var(--primary)'}} />
              <span>Add Prepayment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              initialValues={{month: 12, amount: 100000}}
              requiredMark={false}
            >
              <Form.Item
                name="amount"
                label={
                  <span className="font-bold text-[10px] text-[var(--text-secondary)]">
                    Amount (₹)
                  </span>
                }
                rules={[
                  {required: true, message: 'Please input prepayment amount!'},
                  {
                    type: 'number',
                    min: 1,
                    message: 'Amount must be greater than 0',
                  },
                ]}
              >
                <InputNumber<number>
                  min={1}
                  formatter={(value) =>
                    `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={(value) =>
                    value ? parseFloat(value.replace(/₹\s?|(,*)/g, '')) : 0
                  }
                  style={{width: '100%'}}
                  placeholder="e.g. 100000"
                />
              </Form.Item>

              <Form.Item
                name="month"
                label={
                  <span className="font-bold text-[10px] text-[var(--text-secondary)]">
                    Month
                  </span>
                }
                rules={[
                  {required: true, message: 'Please input installment month!'},
                  {
                    type: 'number',
                    min: 1,
                    max: tenure,
                    message: `Month must be between 1 and ${tenure}`,
                  },
                ]}
              >
                <InputNumber<number>
                  min={1}
                  max={tenure}
                  style={{width: '100%'}}
                  placeholder={`1 - ${tenure}`}
                />
              </Form.Item>

              <Form.Item style={{marginBottom: 0}}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<PlusOutlined />}
                  style={{width: '100%'}}
                >
                  Schedule Prepayment
                </Button>
              </Form.Item>
            </Form>
          </CardContent>
        </Card>

        {/* Prepayments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="border-[var(--card-border)] border-b pb-2 font-bold text-[var(--text-primary)] text-xs normal-case">
              Scheduled Prepayments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table<Prepayment>
              dataSource={sortedPrepayments}
              columns={columns}
              rowKey="id"
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                size: 'small',
              }}
              locale={{
                emptyText: (
                  <div className="py-6 text-center font-semibold text-[var(--text-secondary)] text-xs">
                    No Prepayments Scheduled
                  </div>
                ),
              }}
              size="small"
              bordered
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
