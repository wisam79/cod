import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskFilter from '../TaskFilter';

describe('TaskFilter', () => {
  const defaultProps = {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    onAddClick: vi.fn(),
    members: [
      { id: 1, name: 'أحمد', avatar: '' },
      { id: 2, name: 'سارة', avatar: '' }
    ],
    activeAssigneeFilter: 'all',
    setActiveAssigneeFilter: vi.fn(),
    activeFilterStatus: 'all',
    setActiveFilterStatus: vi.fn(),
    tasks: [
      { id: 1, status: 'todo' },
      { id: 2, status: 'progress' },
      { id: 3, status: 'done' }
    ],
    getStatusLabel: (s) => ({ todo: 'قيد الانتظار', progress: 'قيد العمل', review: 'قيد المراجعة', done: 'مكتمل' }[s] || s)
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input', () => {
    render(<TaskFilter {...defaultProps} />);
    expect(screen.getByPlaceholderText('البحث عن مهمة...')).toBeInTheDocument();
  });

  it('calls setSearchQuery on search input change', () => {
    render(<TaskFilter {...defaultProps} />);
    fireEvent.change(screen.getByPlaceholderText('البحث عن مهمة...'), { target: { value: 'test' } });
    expect(defaultProps.setSearchQuery).toHaveBeenCalledWith('test');
  });

  it('renders add button', () => {
    render(<TaskFilter {...defaultProps} />);
    expect(screen.getByText('جديد')).toBeInTheDocument();
  });

  it('calls onAddClick when add button is clicked', () => {
    render(<TaskFilter {...defaultProps} />);
    fireEvent.click(screen.getByText('جديد'));
    expect(defaultProps.onAddClick).toHaveBeenCalledTimes(1);
  });

  it('renders "All" assignee pill', () => {
    render(<TaskFilter {...defaultProps} />);
    const allButtons = screen.getAllByText('الكل');
    expect(allButtons.length).toBeGreaterThan(0);
  });

  it('renders member filter pills', () => {
    render(<TaskFilter {...defaultProps} />);
    expect(screen.getByText('أحمد')).toBeInTheDocument();
    expect(screen.getByText('سارة')).toBeInTheDocument();
  });

  it('calls setActiveAssigneeFilter when member pill clicked', () => {
    render(<TaskFilter {...defaultProps} />);
    fireEvent.click(screen.getByText('أحمد'));
    expect(defaultProps.setActiveAssigneeFilter).toHaveBeenCalledWith('1');
  });

  it('calls setActiveAssigneeFilter("all") when "all" pill clicked', () => {
    render(<TaskFilter {...defaultProps} />);
    const allButtons = screen.getAllByText('الكل');
    const assigneeAll = allButtons.find(btn => btn.className.includes('filter-pill'));
    fireEvent.click(assigneeAll);
    expect(defaultProps.setActiveAssigneeFilter).toHaveBeenCalledWith('all');
  });

  it('highlights active assignee filter', () => {
    render(<TaskFilter {...defaultProps} activeAssigneeFilter="1" />);
    const pills = document.querySelectorAll('.filter-pill');
    const activePill = Array.from(pills).find(p => p.textContent.includes('أحمد'));
    expect(activePill?.className).toContain('active');
  });

  it('renders status tabs with labels', () => {
    render(<TaskFilter {...defaultProps} />);
    expect(screen.getByText('قيد الانتظار')).toBeInTheDocument();
    expect(screen.getByText('قيد العمل')).toBeInTheDocument();
    expect(screen.getByText('مكتمل')).toBeInTheDocument();
  });

  it('shows task count in status tabs', () => {
    render(<TaskFilter {...defaultProps} />);
    const allBadge = screen.getByText('3');  // total tasks
    expect(allBadge).toBeInTheDocument();
  });

  it('calls setActiveFilterStatus when status tab clicked', () => {
    render(<TaskFilter {...defaultProps} />);
    fireEvent.click(screen.getByText('قيد الانتظار'));
    expect(defaultProps.setActiveFilterStatus).toHaveBeenCalledWith('todo');
  });
});
