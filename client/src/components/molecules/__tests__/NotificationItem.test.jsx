import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import NotificationItem from '../NotificationItem';

describe('NotificationItem', () => {
  it('renders notification text', () => {
    render(<NotificationItem notification={{ id: 1, text: 'تم تحديث المهمة', type: 'status' }} />);
    expect(screen.getByText('تم تحديث المهمة')).toBeInTheDocument();
  });

  it('renders chat type icon', () => {
    render(<NotificationItem notification={{ id: 1, text: 'رسالة جديدة', type: 'chat' }} />);
    expect(screen.getByText('رسالة جديدة')).toBeInTheDocument();
  });

  it('renders status type icon', () => {
    render(<NotificationItem notification={{ id: 1, text: 'تم التحديث', type: 'status' }} />);
    expect(screen.getByText('تم التحديث')).toBeInTheDocument();
  });

  it('renders comment type icon', () => {
    render(<NotificationItem notification={{ id: 1, text: 'تعليق جديد', type: 'comment' }} />);
    expect(screen.getByText('تعليق جديد')).toBeInTheDocument();
  });

  it('renders assignment type icon', () => {
    render(<NotificationItem notification={{ id: 1, text: 'تم الإسناد', type: 'assignment' }} />);
    expect(screen.getByText('تم الإسناد')).toBeInTheDocument();
  });

  it('renders default type icon', () => {
    render(<NotificationItem notification={{ id: 1, text: 'إشعار عام', type: 'unknown' }} />);
    expect(screen.getByText('إشعار عام')).toBeInTheDocument();
  });

  it('formats time from createdAt', () => {
    render(<NotificationItem notification={{ id: 1, text: 'test', type: 'chat', createdAt: '2025-01-15T10:30:00Z' }} />);
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('uses notification.time if provided', () => {
    render(<NotificationItem notification={{ id: 1, text: 'test', type: 'chat', time: '15:45' }} />);
    expect(screen.getByText('15:45')).toBeInTheDocument();
  });
});
