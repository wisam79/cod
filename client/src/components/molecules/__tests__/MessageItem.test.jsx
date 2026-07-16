import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MessageItem from '../MessageItem';

describe('MessageItem', () => {
  const baseMessage = {
    id: 1,
    text: 'مرحباً بالجميع',
    senderId: 1,
    createdAt: '2025-01-15T10:30:00Z'
  };

  const members = [
    { id: 1, name: 'أحمد', avatar: '/ahmed.jpg' },
    { id: 2, name: 'سارة', avatar: '' }
  ];

  it('renders message text', () => {
    render(<MessageItem message={baseMessage} members={members} />);
    expect(screen.getByText('مرحباً بالجميع')).toBeInTheDocument();
  });

  it('shows sender name for other users', () => {
    render(<MessageItem message={baseMessage} members={members} isCurrentUser={false} />);
    expect(screen.getByText('أحمد')).toBeInTheDocument();
  });

  it('hides sender name for current user', () => {
    render(<MessageItem message={baseMessage} members={members} isCurrentUser={true} />);
    expect(screen.queryByText('أ Ahmad')).not.toBeInTheDocument();
  });

  it('uses inline sender if provided', () => {
    const msgWithSender = { ...baseMessage, sender: { name: 'محمد', avatar: '' } };
    render(<MessageItem message={msgWithSender} members={[]} />);
    expect(screen.getByText('محمد')).toBeInTheDocument();
  });

  it('falls back to unknown sender when not in members', () => {
    const msg = { id: 1, text: 'hi', senderId: 99 };
    render(<MessageItem message={msg} members={[]} />);
    expect(screen.getByText('مستكشف غير معروف')).toBeInTheDocument();
  });

  it('applies my-message class for current user', () => {
    const { container } = render(
      <MessageItem message={baseMessage} members={members} isCurrentUser={true} />
    );
    expect(container.querySelector('.my-message')).toBeInTheDocument();
  });

  it('renders avatar', () => {
    render(<MessageItem message={baseMessage} members={members} />);
    expect(screen.getByRole('img', { name: /أحمد/i })).toBeInTheDocument();
  });

  it('formats time correctly', () => {
    render(<MessageItem message={baseMessage} members={members} />);
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });
});
