import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NotificationDrawer from '../NotificationDrawer';

describe('NotificationDrawer', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    notifications: [
      { id: 1, text: 'تم تحديث المهمة', type: 'status' },
      { id: 2, text: 'رسالة جديدة', type: 'chat' }
    ],
    onClear: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  const flushClose = () => {
    act(() => {
      vi.advanceTimersByTime(250);
    });
  };

  it('renders when open', () => {
    render(<NotificationDrawer {...defaultProps} />);
    expect(screen.getByText('مركز التنبيهات')).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<NotificationDrawer {...defaultProps} isOpen={false} />);
    expect(container.querySelector('.drawer-overlay')).not.toBeInTheDocument();
  });

  it('renders notification items', () => {
    render(<NotificationDrawer {...defaultProps} />);
    expect(screen.getByText('تم تحديث المهمة')).toBeInTheDocument();
    expect(screen.getByText('رسالة جديدة')).toBeInTheDocument();
  });

  it('calls onClose when overlay is clicked', () => {
    render(<NotificationDrawer {...defaultProps} />);
    fireEvent.click(screen.getByText('مركز التنبيهات').closest('.drawer-overlay'));
    flushClose();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when X button is clicked', () => {
    render(<NotificationDrawer {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('إغلاق'));
    flushClose();
    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when content area is clicked', () => {
    render(<NotificationDrawer {...defaultProps} />);
    fireEvent.click(screen.getByText('تم تحديث المهمة'));
    expect(defaultProps.onClose).not.toHaveBeenCalled();
  });

  it('shows clear button when notifications exist', () => {
    render(<NotificationDrawer {...defaultProps} />);
    expect(screen.getByText('مسح الإشعارات')).toBeInTheDocument();
  });

  it('calls onClear when clear button clicked', () => {
    render(<NotificationDrawer {...defaultProps} />);
    fireEvent.click(screen.getByText('مسح الإشعارات'));
    expect(defaultProps.onClear).toHaveBeenCalledTimes(1);
  });

  it('hides clear button when no notifications', () => {
    render(<NotificationDrawer {...defaultProps} notifications={[]} />);
    expect(screen.queryByText('مسح الإشعارات')).not.toBeInTheDocument();
  });

  it('shows empty state when no notifications', () => {
    render(<NotificationDrawer {...defaultProps} notifications={[]} />);
    expect(screen.getByText('لا توجد تنبيهات جديدة حالياً.')).toBeInTheDocument();
  });
});
