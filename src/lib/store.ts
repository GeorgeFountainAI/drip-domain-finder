import { create } from 'zustand';

// Store for selected domains functionality
interface SelectedDomainsState {
  selectedDomains: string[];
  addDomain: (domain: string) => void;
  removeDomain: (domain: string) => void;
  clearDomains: () => void;
  setDomains: (domains: string[]) => void;
}

export const useSelectedDomains = create<SelectedDomainsState>((set) => ({
  selectedDomains: [],
  addDomain: (domain) =>
    set((state) => ({
      selectedDomains: [...state.selectedDomains, domain]
    })),
  removeDomain: (domain) =>
    set((state) => ({
      selectedDomains: state.selectedDomains.filter((d) => d !== domain)
    })),
  clearDomains: () => set({ selectedDomains: [] }),
  setDomains: (domains) => set({ selectedDomains: domains })
}));

// Store for UI state including dark mode
interface UiState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isDarkMode: false,
  toggleDarkMode: () =>
    set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (isDark) => set({ isDarkMode: isDark })
}));

// Existing search store for domain search results
interface SearchState {
  results: any[];
  loading: boolean;
  setResults: (results: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  results: [],
  loading: false,
  setResults: (results) => set({ results }),
  setLoading: (loading) => set({ loading })
}));
