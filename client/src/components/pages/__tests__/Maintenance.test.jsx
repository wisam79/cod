import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Maintenance from '../Maintenance';
import { useAppStore } from '../../../store/useAppStore';

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: Object.assign(
    vi.fn(() => ({
      logout: vi.fn()
    })),
    {
      getState: vi.fn(() => ({
        logout: vi.fn()
      }))
    }
  )
}));

describe('Maintenance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders maintenance title', () => {
    render(<Maintenance />);
    expect(screen.getByText('تحديث النظام قيد التنفيذ')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<Maintenance />);
    expect(screen.getByText(/التطبيق حالياً تحت الصيانة/)).toBeInTheDocument();
  });

  it('renders retry button', () => {
    render(<Maintenance />);
    expect(screen.getByRole('button', { name: /إعادة محاولة الاتصال/i })).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<Maintenance />);
    expect(screen.getByRole('button', { name: /تسجيل الخروج/ })).toBeInTheDocument();
  });

  it('calls window.location.reload on retry click', () => {
    const reloadMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, reload: reloadMock },
    });
    render(<Maintenance />);
    fireEvent.click(screen.getByRole('button', { name: /إعادة محاولة الاتصال/i }));
    expect(reloadMock).toHaveBeenCalled();
  });

  it('calls logout on logout click', () => {
    const mockLogout = vi.fn().mockResolvedValue(undefined);
    useAppStore.mockReturnValueOnce({ logout: mockLogout });

    render(<Maintenance />);
    fireEvent.click(screen.getByRole('button', { name: /تسجيل الخروج/ }));
    expect(mockLogout).toHaveBeenCalled();
  });
});
