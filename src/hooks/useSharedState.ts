import {useCallback, useEffect, useRef, useState} from 'react';
import type {Prepayment} from '../utils/formulas';

export interface AppState {
  mode: 'single' | 'compare' | 'prepayment';
  singleInputs: {
    loanAmount: number;
    interestRate: number;
    tenure: number;
    startDate: string;
  };
  scenarios: Array<{
    id: string;
    name: string;
    loanAmount: number;
    interestRate: number;
    tenure: number;
  }>;
  prepayments: Prepayment[];
  theme: 'light' | 'dark';
}

const DEFAULTS: AppState = {
  mode: 'single',
  singleInputs: {
    loanAmount: 1500000,
    interestRate: 11,
    tenure: 48,
    startDate: '2026-06',
  },
  scenarios: [
    {
      id: '1',
      name: 'Scenario A',
      loanAmount: 1500000,
      interestRate: 11,
      tenure: 24,
    },
    {
      id: '2',
      name: 'Scenario B',
      loanAmount: 1500000,
      interestRate: 11,
      tenure: 48,
    },
    {
      id: '3',
      name: 'Scenario C',
      loanAmount: 1500000,
      interestRate: 11,
      tenure: 60,
    },
  ],
  prepayments: [],
  theme: 'light',
};

interface SharedStateContainer {
  state: AppState;
  past: AppState[];
  future: AppState[];
}

export function useSharedState() {
  const [tabId] = useState(() => {
    if (typeof window === 'undefined') return 'Tab-INIT';
    return `Tab-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  });

  const [container, setContainer] = useState<SharedStateContainer>({
    state: DEFAULTS,
    past: [],
    future: [],
  });

  const [presenceMap, setPresenceMap] = useState<
    Record<string, {lastSeen: number}>
  >({});

  const bcRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef(tabId);
  const isLeaderRef = useRef(false);

  const isLocalUpdateRef = useRef(false);
  const isUndoRedoRef = useRef(false);

  const containerRef = useRef(container);
  useEffect(() => {
    containerRef.current = container;
  }, [container]);

  useEffect(() => {
    tabIdRef.current = tabId;
  }, [tabId]);

  // Determine leader tab
  const activeTabs = [tabId, ...Object.keys(presenceMap)].sort();
  const isLeader = activeTabs[0] === tabId;
  const activeTabsCount = activeTabs.length;
  const tabNumber = activeTabs.indexOf(tabId) + 1;

  useEffect(() => {
    isLeaderRef.current = isLeader;
  }, [isLeader]);

  const applyTheme = useCallback((theme: 'light' | 'dark') => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  const updateUrlParams = useCallback(
    (inputs: {
      loanAmount: number;
      interestRate: number;
      tenure: number;
      startDate: string;
    }) => {
      if (typeof window === 'undefined') return;
      const url = new URL(window.location.href);
      url.searchParams.set('amount', inputs.loanAmount.toString());
      url.searchParams.set('rate', inputs.interestRate.toString());
      url.searchParams.set('tenure', inputs.tenure.toString());
      url.searchParams.set('start', inputs.startDate);
      window.history.replaceState({}, '', url.toString());
    },
    [],
  );

  const getInitialStateFromUrl = useCallback((): Partial<AppState> | null => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const rate = params.get('rate');
    const tenure = params.get('tenure');
    const start = params.get('start');

    if (amount || rate || tenure || start) {
      return {
        singleInputs: {
          loanAmount: amount
            ? Math.max(10000, Math.min(5000000, Number(amount)))
            : DEFAULTS.singleInputs.loanAmount,
          interestRate: rate
            ? Math.max(1, Math.min(36, Number(rate)))
            : DEFAULTS.singleInputs.interestRate,
          tenure: tenure
            ? Math.max(1, Math.min(84, Number(tenure)))
            : DEFAULTS.singleInputs.tenure,
          startDate: start || DEFAULTS.singleInputs.startDate,
        },
      };
    }
    return null;
  }, []);

  // Run Side Effects (Broadcasting, Theme, URL Parameters) on State Change in useEffect!
  useEffect(() => {
    const currentState = container.state;

    // Apply document theme immediately
    applyTheme(currentState.theme);

    // Debounce URL updates and broadcasting by 100ms to avoid UI lag on drags
    const timer = setTimeout(() => {
      // Sync URL queries if in single mode
      if (currentState.mode === 'single') {
        updateUrlParams(currentState.singleInputs);
      }

      // Broadcast state updates if they originated locally
      if (isLocalUpdateRef.current && bcRef.current) {
        bcRef.current.postMessage({
          type: isUndoRedoRef.current ? 'undo_redo' : 'state_change',
          state: currentState,
          past: container.past,
          future: container.future,
          sender: tabId,
        });
        isLocalUpdateRef.current = false;
        isUndoRedoRef.current = false;
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [
    container.state,
    container.past,
    updateUrlParams,
    tabId, // Apply document theme immediately
    applyTheme,
    container.future,
  ]);
  const updateState = (
    updater: Partial<AppState> | ((prev: AppState) => AppState),
  ) => {
    setContainer((prevContainer) => {
      const nextState =
        typeof updater === 'function'
          ? updater(prevContainer.state)
          : {...prevContainer.state, ...updater};

      if (JSON.stringify(nextState) === JSON.stringify(prevContainer.state)) {
        return prevContainer;
      }

      isLocalUpdateRef.current = true;
      const newPast = [...prevContainer.past, prevContainer.state].slice(-50);
      const newFuture: AppState[] = [];

      return {
        state: nextState,
        past: newPast,
        future: newFuture,
      };
    });
  };

  const triggerUndo = useCallback(() => {
    setContainer((prev) => {
      if (prev.past.length === 0) return prev;

      isLocalUpdateRef.current = true;
      isUndoRedoRef.current = true;

      const newPast = [...prev.past];
      const poppedState = newPast.pop();
      if (!poppedState) return prev;
      const newFuture = [prev.state, ...prev.future];

      return {
        state: poppedState,
        past: newPast,
        future: newFuture,
      };
    });
  }, []);

  const triggerRedo = useCallback(() => {
    setContainer((prev) => {
      if (prev.future.length === 0) return prev;

      isLocalUpdateRef.current = true;
      isUndoRedoRef.current = true;

      const newFuture = [...prev.future];
      const poppedState = newFuture.shift();
      if (!poppedState) return prev;
      const newPast = [...prev.past, prev.state];

      return {
        state: poppedState,
        past: newPast,
        future: newFuture,
      };
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const bc = new BroadcastChannel('groww_emi_sync_channel');
    bcRef.current = bc;

    // Join channel
    bc.postMessage({type: 'join', sender: tabIdRef.current});

    bc.onmessage = (event) => {
      const {type, state, past, future, sender, tabId: msgTabId} = event.data;
      const activeSender = sender || msgTabId;

      if (activeSender === tabIdRef.current) return;

      switch (type) {
        case 'join':
          bc.postMessage({type: 'pong', tabId: tabIdRef.current});
          setPresenceMap((prev) => ({
            ...prev,
            [activeSender]: {lastSeen: Date.now()},
          }));
          break;

        case 'pong':
        case 'heartbeat':
          setPresenceMap((prev) => ({
            ...prev,
            [activeSender]: {lastSeen: Date.now()},
          }));
          break;

        case 'request_state':
          if (isLeaderRef.current) {
            bc.postMessage({
              type: 'respond_state',
              state: containerRef.current.state,
              past: containerRef.current.past,
              future: containerRef.current.future,
              sender: tabIdRef.current,
            });
          }
          break;

        case 'respond_state':
        case 'state_change':
        case 'undo_redo':
          isLocalUpdateRef.current = false; // Block broadcasting this update
          setContainer({
            state,
            past: past || [],
            future: future || [],
          });
          break;

        default:
          break;
      }
    };

    // Load initial state from URL parameters or Leader tab
    const urlInit = getInitialStateFromUrl();
    if (urlInit) {
      isLocalUpdateRef.current = true;
      setContainer((prev) => {
        const nextState = {...prev.state, ...urlInit};
        return {state: nextState, past: [], future: []};
      });
    } else {
      bc.postMessage({type: 'request_state', sender: tabIdRef.current});
    }

    // Heartbeat: 1.5s
    const heartbeatInterval = setInterval(() => {
      bc.postMessage({type: 'heartbeat', sender: tabIdRef.current});
    }, 1500);

    // Prune stale tabs: 2.0s
    const pruneInterval = setInterval(() => {
      setPresenceMap((prev) => {
        const now = Date.now();
        const next = {...prev};
        let changed = false;
        Object.keys(next).forEach((id) => {
          if (now - next[id].lastSeen > 4000) {
            delete next[id];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 2000);

    // Undo/Redo keyboard binding
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const isUndo =
        (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey;
      const isRedo =
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'z');

      if (isUndo) {
        e.preventDefault();
        triggerUndo();
      } else if (isRedo) {
        e.preventDefault();
        triggerRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(heartbeatInterval);
      clearInterval(pruneInterval);
      window.removeEventListener('keydown', handleKeyDown);
      bc.close();
    };
  }, [triggerUndo, triggerRedo, getInitialStateFromUrl]);

  return {
    tabId,
    tabNumber,
    state: container.state,
    past: container.past,
    future: container.future,
    updateState,
    isLeader,
    activeTabsCount,
    undo: triggerUndo,
    redo: triggerRedo,
  };
}
