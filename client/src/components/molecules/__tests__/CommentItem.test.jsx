import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CommentItem from '../CommentItem';

describe('CommentItem', () => {
  const members = [
    { id: 1, name: 'أحمد', avatar: '/a.jpg' },
    { id: 2, name: 'سارة', avatar: '' }
  ];

  it('renders comment text', () => {
    const comment = { id: 1, text: 'ممتاز، شكراً!', senderId: 1, createdAt: '2025-01-15T10:30:00Z' };
    render(<CommentItem comment={comment} members={members} />);
    expect(screen.getByText('ممتاز، شكراً!')).toBeInTheDocument();
  });

  it('shows sender name from members', () => {
    const comment = { id: 1, text: 'hi', senderId: 1, createdAt: '2025-01-15T10:30:00Z' };
    render(<CommentItem comment={comment} members={members} />);
    expect(screen.getByText('أحمد')).toBeInTheDocument();
  });

  it('uses inline sender if provided', () => {
    const comment = { id: 1, text: 'test', sender: { name: 'محمد', avatar: '' }, createdAt: '2025-01-15T10:30:00Z' };
    render(<CommentItem comment={comment} members={[]} />);
    expect(screen.getByText('محمد')).toBeInTheDocument();
  });

  it('falls back to unknown user', () => {
    const comment = { id: 1, text: 'test', senderId: 99, createdAt: '2025-01-15T10:30:00Z' };
    render(<CommentItem comment={comment} members={[]} />);
    expect(screen.getByText('مستخدم غير معروف')).toBeInTheDocument();
  });

  it('renders avatar', () => {
    const comment = { id: 1, text: 'hi', senderId: 1, createdAt: '2025-01-15T10:30:00Z' };
    render(<CommentItem comment={comment} members={members} />);
    expect(screen.getByRole('img', { name: /أحمد/i })).toBeInTheDocument();
  });

  it('formats time from createdAt', () => {
    const comment = { id: 1, text: 'hi', senderId: 1, createdAt: '2025-01-15T10:30:00Z' };
    render(<CommentItem comment={comment} members={members} />);
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });

  it('uses comment.time if provided', () => {
    const comment = { id: 1, text: 'hi', senderId: 1, time: '14:30' };
    render(<CommentItem comment={comment} members={members} />);
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });
});
