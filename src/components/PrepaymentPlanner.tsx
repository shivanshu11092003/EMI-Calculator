"use client";

import React from "react";
import { Table, Button, InputNumber, Popconfirm, Form } from "antd";
import { PlusOutlined, DeleteOutlined, GiftOutlined, HourglassOutlined } from "@ant-design/icons";
import { Prepayment } from "../utils/formulas";
import type { TableProps } from "antd";

interface PrepaymentPlannerProps {
  prepayments: Prepayment[];
  tenure: number;
  interestSaved: number;
  tenureReduced: number;
  actualTenure: number;
  originalInterest: number;
  newInterest: number;
  onAddPrepayment: (prepayment: { month: number; amount: number }) => void;
  onRemovePrepayment: (id: string) => void;
}

export default function PrepaymentPlanner({
  prepayments,
  tenure,
  interestSaved,
  tenureReduced,
  actualTenure,
  originalInterest,
  newInterest,
  onAddPrepayment,
  onRemovePrepayment,
}: PrepaymentPlannerProps) {
  const [form] = Form.useForm();

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleFinish = (values: { amount: number; month: number }) => {
    onAddPrepayment({ month: values.month, amount: values.amount });
    form.resetFields();
  };

  // Define Ant Design columns for Prepayment schedule list with Popconfirm integration
  const columns: TableProps<Prepayment>["columns"] = [
    {
      title: "Month",
      dataIndex: "month",
      key: "month",
      render: (val) => <span className="font-mono text-xs">Month {val}</span>,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (val) => <span className="font-bold text-[var(--primary)] font-mono text-xs">{formatCurrency(val)}</span>,
    },
    {
      title: "Delete",
      key: "action",
      align: "right",
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
      <div className="border-b border-[var(--card-border)] pb-2.5">
        <h2 className="text-sm font-bold text-[var(--text-primary)]">
          Prepayment Planner
        </h2>
      </div>

      {/* Impact Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Interest Saved */}
        <div className="flex items-center gap-3.5 p-4.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 shadow-sm">
          <div className="p-2.5 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
            <GiftOutlined style={{ fontSize: 18 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Interest Saved
            </span>
            <span className="text-xl font-extrabold text-emerald-500 font-mono">
              {formatCurrency(interestSaved)}
            </span>
          </div>
        </div>

        {/* Tenure Reduced */}
        <div className="flex items-center gap-3.5 p-4.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 shadow-sm">
          <div className="p-2.5 rounded-lg bg-indigo-500 text-white flex items-center justify-center">
            <HourglassOutlined style={{ fontSize: 18 }} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Tenure Reduced
            </span>
            <span className="text-xl font-extrabold text-indigo-500 font-mono">
              {tenureReduced} mo
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prepayment Form */}
        <div className="lg:col-span-1 p-4.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2 flex items-center gap-1.5">
            <PlusOutlined style={{ color: "var(--primary)" }} />
            <span>Add Prepayment</span>
          </h3>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{ month: 12, amount: 100000 }}
            requiredMark={false}
          >
            <Form.Item
              name="amount"
              label={<span className="text-[10px] font-bold text-[var(--text-secondary)]">Amount (₹)</span>}
              rules={[
                { required: true, message: "Please input prepayment amount!" },
                { type: "number", min: 1, message: "Amount must be greater than 0" },
              ]}
            >
              <InputNumber<number>
                min={1}
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                parser={(value) => (value ? parseFloat(value.replace(/₹\s?|(,*)/g, "")) : 0)}
                style={{ width: "100%" }}
                placeholder="e.g. 100000"
              />
            </Form.Item>

            <Form.Item
              name="month"
              label={<span className="text-[10px] font-bold text-[var(--text-secondary)]">Month</span>}
              rules={[
                { required: true, message: "Please input installment month!" },
                { type: "number", min: 1, max: tenure, message: `Month must be between 1 and ${tenure}` },
              ]}
            >
              <InputNumber<number>
                min={1}
                max={tenure}
                style={{ width: "100%" }}
                placeholder={`1 - ${tenure}`}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<PlusOutlined />}
                style={{ width: "100%" }}
              >
                Schedule Prepayment
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* Prepayments List */}
        <div className="lg:col-span-2 p-4.5 rounded-xl bg-[var(--card-bg)] border border-[var(--card-border)] shadow-sm flex flex-col gap-4">
          <h3 className="text-xs font-bold text-[var(--text-primary)] border-b border-[var(--card-border)] pb-2">
            Scheduled Prepayments
          </h3>

          <Table<Prepayment>
            dataSource={sortedPrepayments}
            columns={columns}
            rowKey="id"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              size: "small",
            }}
            locale={{
              emptyText: (
                <div className="py-6 text-center text-xs font-semibold text-[var(--text-secondary)]">
                  No Prepayments Scheduled
                </div>
              ),
            }}
            size="small"
            bordered
          />
        </div>
      </div>
    </div>
  );
}
