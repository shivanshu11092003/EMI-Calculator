'use client';

import {theme as antdTheme, ConfigProvider, Skeleton, Spin, Tabs} from 'antd';
import {useDeferredValue, useEffect, useState} from 'react';
import AmortizationSchedule from '../components/AmortizationSchedule';
import Header from '../components/Header';
import InputPanel from '../components/InputPanel';
import LoanComparison from '../components/LoanComparison';
import PrepaymentPlanner from '../components/PrepaymentPlanner';
import SensitivityTable from '../components/SensitivityTable';
import SummaryCards from '../components/SummaryCards';
import {useSharedState} from '../hooks/useSharedState';
import {calculateEMI, generateAmortizationSchedule} from '../utils/formulas';

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  const {
    tabNumber,
    state,
    past,
    future,
    updateState,
    activeTabsCount,
    undo,
    redo,
  } = useSharedState();

  const {loanAmount, interestRate, tenure, startDate} = state.singleInputs;

  // Defer heavy data computations to allow 60fps butter-smooth slider dragging
  const deferredLoanAmount = useDeferredValue(loanAmount);
  const deferredInterestRate = useDeferredValue(interestRate);
  const deferredTenure = useDeferredValue(tenure);
  const deferredScenarios = useDeferredValue(state.scenarios);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    const isDark = state?.theme === 'dark';
    return (
      <ConfigProvider
        theme={{
          algorithm: isDark
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
          token: {
            colorPrimary: '#2563eb',
            borderRadius: 12,
            fontFamily: "'Inter', system-ui, sans-serif",
          },
        }}
      >
        <div
          className={`flex min-h-screen items-center justify-center p-8 transition-colors ${isDark ? 'bg-[#0b0f19] text-white' : 'bg-[#f8fafc] text-slate-900'}`}
        >
          <div className="flex w-full max-w-xl flex-col items-center gap-4">
            <Spin
              size="large"
              description="Synchronizing Workspace Session..."
            />
            <div className="mt-6 w-full opacity-30">
              <Skeleton active paragraph={{rows: 6}} />
            </div>
          </div>
        </div>
      </ConfigProvider>
    );
  }

  const prepayList = state.mode === 'prepayment' ? state.prepayments : [];

  // Amortization schedule calculated using deferred values for heavy table/chart
  const mainCalc = generateAmortizationSchedule(
    deferredLoanAmount,
    deferredInterestRate,
    deferredTenure,
    prepayList,
  );

  // Keep EMI calculation immediate so numbers in SummaryCards update in real-time
  const monthlyEMI = calculateEMI(loanAmount, interestRate, tenure);

  // Compare mode best calculation using deferred scenarios
  let bestScenarioName = '';
  if (state.mode === 'compare') {
    let bestIndex = 0;
    let minPayable = Infinity;
    deferredScenarios.forEach((sc, idx) => {
      const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
      const payable = emi * sc.tenure;
      if (payable < minPayable) {
        minPayable = payable;
        bestIndex = idx;
      }
    });
    bestScenarioName = deferredScenarios[bestIndex].name;
  }

  const displaySchedule =
    state.mode === 'compare'
      ? (() => {
          let bestIndex = 0;
          let minPayable = Infinity;
          deferredScenarios.forEach((sc, idx) => {
            const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
            const payable = emi * sc.tenure;
            if (payable < minPayable) {
              minPayable = payable;
              bestIndex = idx;
            }
          });
          const bestSc = deferredScenarios[bestIndex];
          return generateAmortizationSchedule(
            bestSc.loanAmount,
            bestSc.interestRate,
            bestSc.tenure,
            [],
          ).schedule;
        })()
      : mainCalc.schedule;

  const displayBreakEven =
    state.mode === 'compare'
      ? (() => {
          let bestIndex = 0;
          let minPayable = Infinity;
          deferredScenarios.forEach((sc, idx) => {
            const emi = calculateEMI(sc.loanAmount, sc.interestRate, sc.tenure);
            const payable = emi * sc.tenure;
            if (payable < minPayable) {
              minPayable = payable;
              bestIndex = idx;
            }
          });
          const bestSc = deferredScenarios[bestIndex];
          return generateAmortizationSchedule(
            bestSc.loanAmount,
            bestSc.interestRate,
            bestSc.tenure,
            [],
          ).breakEvenMonth;
        })()
      : mainCalc.breakEvenMonth;

  const handleInputChange = (updates: {
    loanAmount?: number;
    interestRate?: number;
    tenure?: number;
    startDate?: string;
  }) => {
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
        sc.id === id ? {...sc, ...updates} : sc,
      );
      return {...prev, scenarios: nextScenarios};
    });
  };

  const handleActivateScenario = (sc: any) => {
    updateState({
      mode: 'single',
      singleInputs: {
        loanAmount: sc.loanAmount,
        interestRate: sc.interestRate,
        tenure: sc.tenure,
        startDate: startDate, // Keep the last start date selected
      },
    });
  };

  const handleAddPrepayment = (prepay: {month: number; amount: number}) => {
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
        algorithm:
          state.theme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: 'var(--primary)',
          borderRadius: 12,
          fontFamily: "'Inter', system-ui, sans-serif",
        },
        components: {
          Tabs: {
            itemColor: 'var(--text-secondary)',
            itemSelectedColor: 'var(--primary)',
            itemHoverColor: 'var(--primary)',
            itemActiveColor: 'var(--primary)',
          },
        },
      }}
    >
      <div className="flex min-h-screen flex-col bg-[var(--background)] font-sans">
        <Header
          tabId={`Tab ${tabNumber}`}
          activeTabsCount={activeTabsCount}
          theme={state.theme}
          onThemeToggle={() =>
            updateState({theme: state.theme === 'dark' ? 'light' : 'dark'})
          }
          onUndo={undo}
          onRedo={redo}
          canUndo={past.length > 0}
          canRedo={future.length > 0}
        />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 bg-[var(--background)] px-4 py-8 sm:px-6 lg:px-8">
          {/* Navigation Tabs */}
          <Tabs
            activeKey={state.mode}
            onChange={(key) =>
              updateState({mode: key as 'single' | 'compare' | 'prepayment'})
            }
            items={[
              {key: 'single', label: 'Calculator'},
              {key: 'compare', label: 'Comparison'},
              {key: 'prepayment', label: 'Prepayments'},
            ]}
            className="w-full border-[var(--card-border)] border-b pb-2 font-bold"
          />

          {/* Dashboard Sections */}
          {state.mode === 'single' && (
            <div className="grid animate-fade-in grid-cols-1 items-start gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <InputPanel
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  tenure={tenure}
                  startDate={startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex flex-col gap-6 lg:col-span-2">
                <SummaryCards
                  monthlyEMI={monthlyEMI}
                  totalInterest={mainCalc.totalInterest}
                  totalAmountPayable={mainCalc.totalAmountPayable}
                  principal={loanAmount}
                  interestRate={interestRate}
                  tenure={tenure}
                />
                <SensitivityTable
                  loanAmount={deferredLoanAmount}
                  currentRate={deferredInterestRate}
                  currentTenure={deferredTenure}
                />
              </div>
            </div>
          )}

          {state.mode === 'compare' && (
            <div className="animate-fade-in">
              <LoanComparison
                scenarios={state.scenarios}
                onScenarioChange={handleScenarioChange}
                onActivateScenario={handleActivateScenario}
              />
            </div>
          )}

          {state.mode === 'prepayment' && (
            <div className="grid animate-fade-in grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <InputPanel
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  tenure={tenure}
                  startDate={startDate}
                  onChange={handleInputChange}
                  className="h-full"
                />
              </div>
              <div className="flex h-full flex-col gap-6 lg:col-span-2">
                <PrepaymentPlanner
                  prepayments={state.prepayments}
                  tenure={deferredTenure}
                  interestSaved={mainCalc.interestSaved}
                  tenureReduced={mainCalc.tenureReduced}
                  onAddPrepayment={handleAddPrepayment}
                  onRemovePrepayment={handleRemovePrepayment}
                />
              </div>
            </div>
          )}

          {/* Amortization Schedule (Global) */}
          <div className="mt-2 flex flex-col gap-2.5">
            <div className="px-1 font-bold text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
              {state.mode === 'compare' ? (
                <span>
                  Schedule for Best Deal:{' '}
                  <strong className="font-extrabold text-[var(--text-primary)]">
                    {bestScenarioName}
                  </strong>
                </span>
              ) : state.mode === 'prepayment' &&
                state.prepayments.length > 0 ? (
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
