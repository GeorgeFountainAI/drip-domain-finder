import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SelectedDomainsSummary from './SelectedDomainsSummary';

// Mock Zustand stores
const mockClear = vi.fn();

vi.mock('@/lib/store', () => ({
  useSelectedDomains: vi.fn(() => ({
    selectedDomains: [],
    clear: mockClear,
  })),
}));

describe('SelectedDomainsSummary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset store mocks to default state
    const { useSelectedDomains } = require('@/lib/store');
    vi.mocked(useSelectedDomains).mockReturnValue({
      selectedDomains: [],
      clear: mockClear,
    });
  });

  it('does not render when no domains are selected', () => {
    const { container } = render(<SelectedDomainsSummary />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders selected domains count and list', () => {
    const { useSelectedDomains } = require('@/lib/store');
    vi.mocked(useSelectedDomains).mockReturnValue({
      selectedDomains: ['example1.com', 'example2.net'],
      clear: mockClear,
    });

    const { getByText } = render(<SelectedDomainsSummary />);
    
    expect(getByText('Selected Domains (2)')).toBeInTheDocument();
    expect(getByText('example1.com')).toBeInTheDocument();
    expect(getByText('example2.net')).toBeInTheDocument();
  });

  it('calls clear function when Clear All button is clicked', async () => {
    const user = userEvent.setup();
    
    const { useSelectedDomains } = require('@/lib/store');
    vi.mocked(useSelectedDomains).mockReturnValue({
      selectedDomains: ['example1.com', 'example2.net'],
      clear: mockClear,
    });

    const { getByText } = render(<SelectedDomainsSummary />);
    
    const clearButton = getByText('Clear All');
    await user.click(clearButton);
    
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('calls clear function when X button is clicked', async () => {
    const user = userEvent.setup();
    
    const { useSelectedDomains } = require('@/lib/store');
    vi.mocked(useSelectedDomains).mockReturnValue({
      selectedDomains: ['example1.com'],
      clear: mockClear,
    });

    const { getByRole } = render(<SelectedDomainsSummary />);
    
    const xButton = getByRole('button', { name: /close/i }) || getByRole('button');
    await user.click(xButton);
    
    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  it('handles long domain lists with scroll', () => {
    const longDomainList = Array.from({ length: 10 }, (_, i) => `example${i + 1}.com`);
    
    const { useSelectedDomains } = require('@/lib/store');
    vi.mocked(useSelectedDomains).mockReturnValue({
      selectedDomains: longDomainList,
      clear: mockClear,
    });

    const { getByText, container } = render(<SelectedDomainsSummary />);
    
    expect(getByText('Selected Domains (10)')).toBeInTheDocument();
    
    // Check that scroll container exists
    const scrollContainer = container.querySelector('.max-h-40.overflow-y-auto');
    expect(scrollContainer).toBeInTheDocument();
  });
});