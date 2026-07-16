import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Navbar from '../Navbar';

describe('Navbar', () => {
  const defaultProps = {
    activeTab: 'dashboard',
    setActiveTab: vi.fn(),
    currentUser: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 4 default tabs', () => {
    render(<Navbar {...defaultProps} />);
    expect(screen.getByRole('button', { name: /الرئيسية/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /المهام/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /المحادثة/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /الفريق/i })).toBeInTheDocument();
  });

  it('shows admin tab for super admin role', () => {
    render(<Navbar {...defaultProps} currentUser={{ role: 'الادمن المطور' }} />);
    expect(screen.getByRole('button', { name: /الإدارة/i })).toBeInTheDocument();
  });

  it('hides admin tab for regular user', () => {
    render(<Navbar {...defaultProps} currentUser={{ role: 'developer' }} />);
    expect(screen.queryByRole('button', { name: /الإدارة/i })).not.toBeInTheDocument();
  });

  it('calls setActiveTab when tab is clicked', () => {
    render(<Navbar {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /المهام/i }));
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('tasks');
  });

  it('highlights active tab', () => {
    render(<Navbar {...defaultProps} activeTab="chat" />);
    const chatBtn = screen.getByRole('button', { name: /المحادثة/i });
    expect(chatBtn.className).toContain('active');
  });

  it('does not highlight inactive tabs', () => {
    render(<Navbar {...defaultProps} activeTab="chat" />);
    const tasksBtn = screen.getByRole('button', { name: /المهام/i });
    expect(tasksBtn.className).not.toContain('active');
  });

  it('shows label only for active tab', () => {
    render(<Navbar {...defaultProps} activeTab="dashboard" />);
    expect(screen.getByText('الرئيسية')).toBeInTheDocument();
    expect(screen.queryByText('المهام')).not.toBeInTheDocument();
  });

  it('sets aria-current on active tab', () => {
    render(<Navbar {...defaultProps} activeTab="tasks" />);
    const tasksBtn = screen.getByRole('button', { name: /المهام/i });
    expect(tasksBtn).toHaveAttribute('aria-current', 'page');
  });
});
