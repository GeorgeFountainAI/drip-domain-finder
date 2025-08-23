import { create } from 'zustand';

type SearchResult = {
  domain: string;
  available: boolean;
  price: number;
  flipScore?: number;
};

type SearchState = {
  results: SearchResult[];
  loading: boolean;
  setResults: (results: SearchResult[]) => void;
  setLoading: (loading: boolean) => void;
};

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  loading: false,
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading }),
}));

type SelectedDomainsState = {
  selectedDomains: string[];
  add: (d: string) => void;
  remove: (d: string) => void;
  clear: () => void;
  set: (domains: string[]) => void;
};

export const useSelectedDomains = create<SelectedDomainsState>((set) => ({
  selectedDomains: [],
  add: (d) =>
    set((s) =>
      s.selectedDomains.includes(d)
        ? s
        : { selectedDomains: [...s.selectedDomains, d] }
    ),
  remove: (d) =>
    set((s) => ({
      selectedDomains: s.selectedDomains.filter((x) => x !== d),
    })),
  clear: () => set({ selectedDomains: [] }),
  set: (domains) => set({ selectedDomains: domains }),
}));

type UiState = {
  isDarkMode: boolean;
  toggle: () => void;
  set: (val: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  isDarkMode: false,
  toggle: () => set((s) => ({ isDarkMode: !s.isDarkMode })),
  set: (val) => set({ isDarkMode: val }),
}));
