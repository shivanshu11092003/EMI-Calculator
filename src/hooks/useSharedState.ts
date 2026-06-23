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

function generateUUID(): string {
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    window.crypto.randomUUID
  ) {
    return window.crypto.randomUUID();
  }
  return (
    'ws-' +
    Math.random().toString(36).substring(2, 15) +
    '-' +
    Math.random().toString(36).substring(2, 15)
  );
}

function decodeState(base64: string): AppState | null {
  try {
    const jsonStr = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(''),
    );
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to decode shared state', e);
    return null;
  }
}

export function useSharedState() {
  const [tabId] = useState(() => {
    if (typeof window === 'undefined') return 'Tab-INIT';
    return `Tab-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  });

  const [workspaceId, setWorkspaceId] = useState<string>('');
  const workspaceIdRef = useRef('');
  useEffect(() => {
    workspaceIdRef.current = workspaceId;
  }, [workspaceId]);

  const [container, setContainer] = useState<SharedStateContainer>({
    state: DEFAULTS,
    past: [],
    future: [],
  });

  const [createdAt] = useState(() => Date.now());
  const createdAtRef = useRef(createdAt);

  const [presenceMap, setPresenceMap] = useState<
    Record<string, {lastSeen: number; createdAt: number}>
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

  // Determine leader tab sorted by creation time
  const allTabs = [
    {id: tabId, createdAt},
    ...Object.entries(presenceMap).map(([id, info]) => ({
      id,
      createdAt: info.createdAt,
    })),
  ].sort((a, b) => {
    if (a.createdAt !== b.createdAt) {
      return a.createdAt - b.createdAt;
    }
    return a.id.localeCompare(b.id);
  });

  const isLeader = allTabs[0]?.id === tabId;
  const activeTabsCount = allTabs.length;
  const tabNumber = allTabs.findIndex((t) => t.id === tabId) + 1;

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

  const getInitialStateFromUrl = useCallback((): Partial<AppState> | null => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const amount = params.get('amount');
    const rate = params.get('rate');
    const tenure = params.get('tenure');
    const start = params.get('start');

    if (amount || rate || tenure || start) {
      const parsedAmount = amount
        ? Math.max(10000, Math.min(5000000, Number(amount)))
        : DEFAULTS.singleInputs.loanAmount;

      const parsedRate = rate
        ? Math.max(1, Math.min(36, Number(rate)))
        : DEFAULTS.singleInputs.interestRate;

      const parsedTenure = tenure
        ? Math.max(1, Math.min(84, Number(tenure)))
        : DEFAULTS.singleInputs.tenure;

      return {
        singleInputs: {
          loanAmount: parsedAmount,
          interestRate: parsedRate,
          tenure: parsedTenure,
          startDate: start || DEFAULTS.singleInputs.startDate,
        },
        scenarios: DEFAULTS.scenarios.map((sc, idx) => ({
          ...sc,
          loanAmount: parsedAmount,
          interestRate: parsedRate,
          tenure: idx === 0 ? parsedTenure : sc.tenure,
        })),
      };
    }
    return null;
  }, []);

  // Run Side Effects (Broadcasting, Theme, LocalStorage Save) on State Change in useEffect!
  useEffect(() => {
    const currentState = container.state;

    // Apply document theme immediately
    applyTheme(currentState.theme);

    // Debounce LocalStorage saving and broadcasting by 100ms to avoid UI lag on drags
    const timer = setTimeout(() => {
      // Save state to LocalStorage
      if (workspaceIdRef.current) {
        try {
          localStorage.setItem(
            `emi_config_${workspaceIdRef.current}`,
            JSON.stringify(currentState),
          );
        } catch (e) {
          console.error('Failed to save state to localStorage', e);
        }
      }

      // Broadcast state updates if they originated locally
      if (isLocalUpdateRef.current && bcRef.current && workspaceIdRef.current) {
        bcRef.current.postMessage({
          type: isUndoRedoRef.current ? 'undo_redo' : 'state_change',
          workspaceId: workspaceIdRef.current,
          state: currentState,
          past: container.past,
          future: container.future,
          sender: tabId,
          createdAt: createdAtRef.current,
        });
        isLocalUpdateRef.current = false;
        isUndoRedoRef.current = false;
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [container.state, container.past, tabId, applyTheme, container.future]);

  const updateState = (
    updater: Partial<AppState> | ((prev: AppState) => AppState),
  ) => {
    setContainer((prevContainer) => {
      let nextState =
        typeof updater === 'function'
          ? updater(prevContainer.state)
          : {...prevContainer.state, ...updater};

      if (JSON.stringify(nextState) === JSON.stringify(prevContainer.state)) {
        return prevContainer;
      }

      // Automatically sync scenarios' loanAmount and interestRate if they change
      let scenariosChanged = false;
      const nextScenarios = nextState.scenarios.map((sc, idx) => {
        let updated = false;
        let scAmount = sc.loanAmount;
        let scRate = sc.interestRate;
        let scTenure = sc.tenure;

        if (
          nextState.singleInputs.loanAmount !==
          prevContainer.state.singleInputs.loanAmount
        ) {
          scAmount = nextState.singleInputs.loanAmount;
          updated = true;
        }

        if (
          nextState.singleInputs.interestRate !==
          prevContainer.state.singleInputs.interestRate
        ) {
          scRate = nextState.singleInputs.interestRate;
          updated = true;
        }

        if (
          nextState.singleInputs.tenure !==
          prevContainer.state.singleInputs.tenure
        ) {
          // Sync tenure of Scenario A (first scenario) with the main tenure
          if (idx === 0) {
            scTenure = nextState.singleInputs.tenure;
            updated = true;
          }
        }

        if (updated) {
          scenariosChanged = true;
          return {
            ...sc,
            loanAmount: scAmount,
            interestRate: scRate,
            tenure: scTenure,
          };
        }
        return sc;
      });

      if (scenariosChanged) {
        nextState = {
          ...nextState,
          scenarios: nextScenarios,
        };
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

  const generateShareUrl = useCallback(() => {
    if (typeof window === 'undefined') return '';
    try {
      const stateStr = JSON.stringify(container.state);
      const base64 = btoa(
        encodeURIComponent(stateStr).replace(
          /%([0-9A-F]{2})/g,
          (_match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
          },
        ),
      );
      const url = new URL(window.location.href);
      url.search = '';
      url.searchParams.set('share', base64);
      return url.toString();
    } catch (e) {
      console.error('Error generating share URL', e);
      return '';
    }
  }, [container.state]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const shareParam = params.get('share');
    const idParam = params.get('id');

    let activeId = idParam || '';
    let loadedState: AppState | null = null;

    if (shareParam) {
      const decoded = decodeState(shareParam);
      if (decoded) {
        loadedState = decoded;
        activeId = generateUUID();
        try {
          localStorage.setItem(
            `emi_config_${activeId}`,
            JSON.stringify(decoded),
          );
        } catch (e) {
          console.error('Failed to save shared state to localStorage', e);
        }
      }
    } else if (idParam) {
      try {
        const item = localStorage.getItem(`emi_config_${idParam}`);
        if (item) {
          loadedState = JSON.parse(item);
        }
      } catch (e) {
        console.error('Failed to load state from localStorage', e);
      }
    } else {
      // Check if we can parse the legacy query params first!
      const legacyInit = getInitialStateFromUrl();
      if (legacyInit) {
        loadedState = {...DEFAULTS, ...legacyInit} as AppState;
      }
      activeId = generateUUID();
      try {
        localStorage.setItem(
          `emi_config_${activeId}`,
          JSON.stringify(loadedState || DEFAULTS),
        );
      } catch (e) {
        console.error('Failed to save initial state to localStorage', e);
      }
    }

    if (!activeId) {
      activeId = generateUUID();
    }

    setWorkspaceId(activeId);

    // Rewrite URL to have clean ?id=<activeId>
    const url = new URL(window.location.href);
    url.search = '';
    url.searchParams.set('id', activeId);
    window.history.replaceState({}, '', url.toString());

    if (loadedState) {
      setContainer({
        state: loadedState,
        past: [],
        future: [],
      });
    }

    const bc = new BroadcastChannel('groww_emi_sync_channel');
    bcRef.current = bc;

    // Join channel
    bc.postMessage({
      type: 'join',
      workspaceId: activeId,
      sender: tabIdRef.current,
      createdAt: createdAtRef.current,
    });

    bc.onmessage = (event) => {
      const {
        type,
        state: msgState,
        past: msgPast,
        future: msgFuture,
        sender,
        tabId: msgTabId,
        createdAt: msgCreatedAt,
        workspaceId: msgWorkspaceId,
      } = event.data;

      // Filter out messages belonging to other workspaces!
      if (msgWorkspaceId !== activeId) return;

      const activeSender = sender || msgTabId;
      if (activeSender === tabIdRef.current) return;

      const fallbackCreatedAt = msgCreatedAt || Date.now();

      switch (type) {
        case 'join':
          bc.postMessage({
            type: 'pong',
            workspaceId: activeId,
            tabId: tabIdRef.current,
            createdAt: createdAtRef.current,
          });
          setPresenceMap((prev) => ({
            ...prev,
            [activeSender]: {
              lastSeen: Date.now(),
              createdAt: fallbackCreatedAt,
            },
          }));
          break;

        case 'pong':
        case 'heartbeat':
          setPresenceMap((prev) => ({
            ...prev,
            [activeSender]: {
              lastSeen: Date.now(),
              createdAt: fallbackCreatedAt,
            },
          }));
          break;

        case 'request_state':
          if (isLeaderRef.current) {
            bc.postMessage({
              type: 'respond_state',
              workspaceId: activeId,
              state: containerRef.current.state,
              past: containerRef.current.past,
              future: containerRef.current.future,
              sender: tabIdRef.current,
              createdAt: createdAtRef.current,
            });
          }
          break;

        case 'respond_state':
        case 'state_change':
        case 'undo_redo':
          isLocalUpdateRef.current = false; // Block broadcasting this update
          setContainer({
            state: msgState,
            past: msgPast || [],
            future: msgFuture || [],
          });
          // Also save the synchronized state to LocalStorage!
          try {
            localStorage.setItem(
              `emi_config_${activeId}`,
              JSON.stringify(msgState),
            );
          } catch (e) {
            console.error('Failed to sync received state to localStorage', e);
          }
          break;

        default:
          break;
      }
    };

    // If we did not find the state in localStorage, we request the state.
    if (!loadedState) {
      bc.postMessage({
        type: 'request_state',
        workspaceId: activeId,
        sender: tabIdRef.current,
      });
    }

    // Heartbeat: 1.5s
    const heartbeatInterval = setInterval(() => {
      bc.postMessage({
        type: 'heartbeat',
        workspaceId: activeId,
        sender: tabIdRef.current,
        createdAt: createdAtRef.current,
      });
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
    workspaceId,
    state: container.state,
    past: container.past,
    future: container.future,
    updateState,
    isLeader,
    activeTabsCount,
    undo: triggerUndo,
    redo: triggerRedo,
    generateShareUrl,
  };
}
