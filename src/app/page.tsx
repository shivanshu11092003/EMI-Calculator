"use client";

import { theme as antdTheme, ConfigProvider, Skeleton, Spin, Tabs } from "antd";
import { useEffect, useState } from "react";
import AmortizationSchedule from "../components/AmortizationSchedule";
import Header from "../components/Header";
import InputPanel from "../components/InputPanel";
import LoanComparison from "../components/LoanComparison";
import PrepaymentPlanner from "../components/PrepaymentPlanner";
import SensitivityTable from "../components/SensitivityTable";
import SummaryCards from "../components/SummaryCards";
import { useSharedState } from "../hooks/useSharedState";
import { calculateEMI, generateAmortizationSchedule } from "../utils/formulas";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    tabId,
    tabNumber,
    state,
    past,
    future,
    updateState,
    activeTabsCount,
    undo,
    redo,
  } = useSharedState();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    const isDark = state?.theme === "dark";
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: "#00d09c",
            borderRadius: 12,
            fontFamily: "'Inter', system-ui, sans-serif",
          },
        }}
      >
        <div className={`flex min-h-screen items-center justify-center p-8 transition-colors ${isDark ? "bg-[#0b0f19] text-white" : "bg-[#f8fafc] text-slate-900"}`}>
          <div className="flex flex-col items-center gap-4 w-full max-w-xl">
            <Spin size="large" description="Synchronizing Workspace Session..." />
            <div className="w-full mt-6 opacity-30">
              <Skeleton active paragraph={{ rows: 6 }} />
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  const { loanAmount, interestRate, tenure, startDate } = state.singleInputs;

  const prepayList = state.mode === "prepayment" ? state.prepayments : [];
  const mainCalc = generateAmortizationSchedule(loanAmount, interestRate, tenure, prepayList);
  const monthlyEMI = calculateEMI(loanAmount, interestRate, tenure);

  // Compare mode best calculation
  let bestScenarioName = "";
  if (state.mode === "compare") {
    let bestIndex = 0;
    let minPayable = Infinity;
    state.scenarios.forEach((sc, idx) => {
      const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
      const payable = emi * sc.tenure;
      if (payable < minPayable) {
        minPayable = payable;
        bestIndex = idx;
      }
    });
    bestScenarioName = state.scenarios[bestIndex].name;
  }

  const displaySchedule = state.mode === "compare"
    ? (() => {
      let bestIndex = 0;
      let minPayable = Infinity;
      state.scenarios.forEach((sc, idx) => {
        const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
        const payable = emi * sc.tenure;
        if (payable < minPayable) {
          minPayable = payable;
          bestIndex = idx;
        }
      });
      const bestSc = state.scenarios[bestIndex];
      return generateAmortizationSchedule(bestSc.loanAmount, bestSc.interestRate, bestSc.tenure, []).schedule;
    })()
    : mainCalc.schedule;

  const displayBreakEven = state.mode === "compare"
    ? (() => {
      let bestIndex = 0;
      let minPayable = Infinity;
      state.scenarios.forEach((sc, idx) => {
        const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
        const payable = emi * sc.tenure;
        if (payable < minPayable) {
          minPayable = payable;
          bestIndex = idx;
        }
      });
      const bestSc = state.scenarios[bestIndex];
      return generateAmortizationSchedule(bestSc.loanAmount, bestSc.interestRate, bestSc.tenure, []).breakEvenMonth;
    })()
    : mainCalc.breakEvenMonth;

  const handleInputChange = (updates: { loanAmount?: number; interestRate?: number; tenure?: number; startDate?: string }) => {
    updateState({
      singleInputs: {
        ...state.singleInputs,
        ...updates,
      },
    });
  };

  const handleScenarioChange = (id: string, updates: any) => {
    updateState((prev) => {
      const nextScenarios = prev.scenarios.map((sc) =>
        sc.id === id ? { ...sc, ...updates } : sc
      );
      return { ...prev, scenarios: nextScenarios };
    });
  };

  const handleActivateScenario = (sc: any) => {
    updateState({
      mode: "single",
      singleInputs: {
        loanAmount: sc.loanAmount,
        interestRate: sc.interestRate,
        tenure: sc.tenure,
        startDate: startDate, // Keep the last start date selected
      },
    });
  };

  const handleAddPrepayment = (prepay: { month: number; amount: number }) => {
    updateState((prev) => {
      const newPrepayment = {
        id: `pp-${Math.random().toString(36).substring(2, 9)}`,
        month: prepay.month,
        amount: prepay.amount,
      };
      return {
        ...prev,
        prepayments: [...prev.prepayments, newPrepayment],
      };
    });
  };

  const handleRemovePrepayment = (id: string) => {
    updateState((prev) => ({
      ...prev,
      prepayments: prev.prepayments.filter((p) => p.id !== id),
    }));
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: state.theme === "dark" ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: "#00d09c",
          borderRadius: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
        },
      }}
    >
      <div className="min-h-screen bg-[var(--background)] flex flex-col font-sans">
        <Header
          tabId={`Tab ${tabNumber}`}
          activeTabsCount={activeTabsCount}
          theme={state.theme}
          onThemeToggle={() => updateState({ theme: state.theme === "dark" ? "light" : "dark" })}
          onUndo={undo}
          onRedo={redo}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
        />

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 bg-[var(--background)] py-8 sm:px-6 lg:px-8 flex flex-col gap-6">

          {/* Navigation Tabs */}
          <Tabs
            activeKey={state.mode}
            onChange={(key) => updateState({ mode: key as "single" | "compare" | "prepayment" })}
            items={[
              { key: "single", label: "Calculator" },
              { key: "compare", label: "Comparison" },
              { key: "prepayment", label: "Prepayments" },
            ]}
            className="w-full font-bold border-b border-[var(--card-border)] pb-2"
          />

          {/* Dashboard Sections */}
          {state.mode === "single" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-1">
                <InputPanel
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  tenure={tenure}
                  startDate={startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6">
                <SummaryCards
                  monthlyEMI={monthlyEMI}
                  totalInterest={mainCalc.totalInterest}
                  totalAmountPayable={mainCalc.totalAmountPayable}
                  principal={loanAmount}
                  interestRate={interestRate}
                  tenure={tenure}
                />
                <SensitivityTable
                  loanAmount={loanAmount}
                  currentRate={interestRate}
                  currentTenure={tenure}
                />
              </div>
            </div>
          )}

          {state.mode === "compare" && (
            <LoanComparison
              scenarios={state.scenarios}
              onScenarioChange={handleScenarioChange}
              onActivateScenario={handleActivateScenario}
            />
          )}

          {state.mode === "prepayment" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              <div className="lg:col-span-1">
                <InputPanel
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  tenure={tenure}
                  startDate={startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-6">
                <PrepaymentPlanner
                  prepayments={state.prepayments}
                  tenure={tenure}
                  interestSaved={mainCalc.interestSaved}
                  tenureReduced={mainCalc.tenureReduced}
                  actualTenure={mainCalc.actualTenure}
                  originalInterest={mainCalc.originalTotalInterest}
                  newInterest={mainCalc.totalInterest}
                  onAddPrepayment={handleAddPrepayment}
                  onRemovePrepayment={handleRemovePrepayment}
                />
              </div>
            </div>
          )}

          {/* Amortization Schedule (Global) */}
          <div className="flex flex-col gap-2.5 mt-2">
            <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider px-1">
              {state.mode === "compare" ? (
                <span>Schedule for Best Deal: <strong className="text-[var(--text-primary)] font-extrabold">{bestScenarioName}</strong></span>
              ) : state.mode === "prepayment" && state.prepayments.length > 0 ? (
                <span>Schedule with prepayments applied</span>
              ) : (
                <span>Standard amortization schedule</span>
              )}
            </div>
            <AmortizationSchedule
              schedule={displaySchedule}
              breakEvenMonth={displayBreakEven}
              startDate={startDate}
            />
          </div>

        </main>
      </div>
    </ConfigProvider>
  );
}
