import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ToastContainer from '../ToastContainer';

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders toast messages', () => {
    const toasts = [
      { id: 1, text: 'تم بنجاح', type: 'success' },
      { id: 2, text: 'خطأ في الشبكة', type: 'error' }
    ];
    render(<ToastContainer activeToasts={toasts} />);
    expect(screen.getByText('تم بنجاح')).toBeInTheDocument();
    expect(screen.getByText('خطأ في الشبكة')).toBeInTheDocument();
  });

  it('applies correct background color for success type', () => {
    const toasts = [{ id: 1, text: 'نجاح', type: 'success' }];
    render(<ToastContainer activeToasts={toasts} />);
    const toastEl = screen.getByText('نجاح').closest('.toast-item');
    expect(toastEl.style.background).toContain('120');
  });

  it('applies correct background color for error type', () => {
    const toasts = [{ id: 1, text: 'خطأ', type: 'error' }];
    render(<ToastContainer activeToasts={toasts} />);
    const toastEl = screen.getByText('خطأ').closest('.toast-item');
    expect(toastEl.style.background).toContain('38');
  });

  it('applies correct background for warning type', () => {
    const toasts = [{ id: 1, text: 'تحذير', type: 'warning' }];
    render(<ToastContainer activeToasts={toasts} />);
    const toastEl = screen.getByText('تحذير').closest('.toast-item');
    expect(toastEl.style.background).toContain('83');
  });

  it('defaults to info color for unknown type', () => {
    const toasts = [{ id: 1, text: 'معلومة', type: 'unknown' }];
    render(<ToastContainer activeToasts={toasts} />);
    const toastEl = screen.getByText('معلومة').closest('.toast-item');
    expect(toastEl.style.background).toContain('64');
  });

  it('displays nothing when no toasts', () => {
    const { container } = render(<ToastContainer activeToasts={[]} />);
    expect(container.querySelectorAll('.toast-item').length).toBe(0);
  });

  it('hides toast on click (dismiss)', () => {
    const toasts = [{ id: 1, text: 'محذوف', type: 'info' }];
    render(<ToastContainer activeToasts={toasts} />);
    fireEvent.click(screen.getByText('محذوف'));
    expect(screen.queryByText('محذوف')).not.toBeInTheDocument();
  });

  it('hides dismissed toasts even if still in activeToasts prop', () => {
    const toasts = [{ id: 1, text: 'X', type: 'info' }];
    const { rerender } = render(<ToastContainer activeToasts={toasts} />);
    fireEvent.click(screen.getByText('X'));
    rerender(<ToastContainer activeToasts={toasts} />);
    expect(screen.queryByText('X')).not.toBeInTheDocument();
  });
});
