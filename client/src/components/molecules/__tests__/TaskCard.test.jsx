import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TaskCard from '../TaskCard';

describe('TaskCard', () => {
  const baseTask = {
    id: 1,
    title: 'تصميم واجهة المستخدم',
    description: 'تصميم الصفحة الرئيسية',
    priority: 'high',
    status: 'todo',
    dueDate: '2025-06-01',
    comments: []
  };

  const assignee = { id: 1, name: 'أحمد', avatar: '/a.jpg' };

  it('renders task title', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByText('تصميم واجهة المستخدم')).toBeInTheDocument();
  });

  it('renders task description', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByText('تصميم الصفحة الرئيسية')).toBeInTheDocument();
  });

  it('renders priority badge', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByText('عالية')).toBeInTheDocument();
  });

  it('renders due date', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.getByText('2025-06-01')).toBeInTheDocument();
  });

  it('shows comment count when comments exist', () => {
    const task = { ...baseTask, comments: [{ id: 1 }, { id: 2 }] };
    render(<TaskCard task={task} />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not show comment count when no comments', () => {
    render(<TaskCard task={baseTask} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders assignee avatar', () => {
    render(<TaskCard task={baseTask} assignee={assignee} />);
    expect(screen.getByRole('img', { name: /أحمد/i })).toBeInTheDocument();
  });

  it('calls onSelect when clicked', () => {
    const handleSelect = vi.fn();
    render(<TaskCard task={baseTask} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText('تصميم واجهة المستخدم'));
    expect(handleSelect).toHaveBeenCalledWith(baseTask);
  });

  it('does not crash when no onSelect', () => {
    render(<TaskCard task={baseTask} />);
    fireEvent.click(screen.getByText('تصميم واجهة المستخدم'));
  });

  it('shows status dot with correct class', () => {
    const { container } = render(<TaskCard task={baseTask} />);
    const dot = container.querySelector('.task-status-dot');
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain('status-todo');
  });

  it('renders different priority labels', () => {
    const { rerender } = render(<TaskCard task={{ ...baseTask, priority: 'low' }} />);
    expect(screen.getByText('منخفضة')).toBeInTheDocument();

    rerender(<TaskCard task={{ ...baseTask, priority: 'medium' }} />);
    expect(screen.getByText('متوسطة')).toBeInTheDocument();
  });
});
