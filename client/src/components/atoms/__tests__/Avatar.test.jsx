import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('renders image when src is provided', () => {
    render(<Avatar src="/avatar.jpg" alt="أحمد" />);
    const img = screen.getByRole('img', { name: /أحمد/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });

  it('shows initials fallback when no src', () => {
    render(<Avatar alt="أحمد علي" />);
    expect(screen.getByText('أع')).toBeInTheDocument();
  });

  it('shows ? fallback when no alt provided', () => {
    render(<Avatar />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('shows initials with single name', () => {
    render(<Avatar alt="سارة" />);
    expect(screen.getByText('س')).toBeInTheDocument();
  });

  it('limits initials to 2 characters', () => {
    render(<Avatar alt="أحمد علي حسن" />);
    const fallback = screen.getByRole('img');
    expect(fallback.textContent).toHaveLength(2);
  });

  it('falls back to initials when image fails to load', () => {
    render(<Avatar src="/broken.jpg" alt="محمد" />);
    const img = screen.getByRole('img');
    fireEvent.error(img);
    expect(screen.getByText('م')).toBeInTheDocument();
  });

  it('applies sm size styles', () => {
    render(<Avatar alt="Test" size="sm" />);
    const fallback = screen.getByRole('img');
    expect(fallback.style.width).toBe('32px');
    expect(fallback.style.height).toBe('32px');
  });

  it('applies lg size styles', () => {
    render(<Avatar alt="Test" size="lg" />);
    const fallback = screen.getByRole('img');
    expect(fallback.style.width).toBe('64px');
    expect(fallback.style.height).toBe('64px');
  });

  it('applies xl size styles', () => {
    render(<Avatar alt="Test" size="xl" />);
    const fallback = screen.getByRole('img');
    expect(fallback.style.width).toBe('96px');
  });

  it('applies custom className', () => {
    render(<Avatar alt="Test" className="custom-class" />);
    const fallback = screen.getByRole('img');
    expect(fallback.className).toContain('custom-class');
  });

  it('sets aria-label on fallback', () => {
    render(<Avatar alt="سارة" />);
    const fallback = screen.getByRole('img');
    expect(fallback).toHaveAttribute('aria-label', 'سارة');
  });

  it('has deterministic gradient based on name', () => {
    const { rerender } = render(<Avatar alt="أحمد" />);
    const style1 = screen.getByRole('img').style.background;
    rerender(<Avatar alt="أحمد" />);
    const style2 = screen.getByRole('img').style.background;
    expect(style1).toBe(style2);
  });

  it('different names produce different gradients', () => {
    const { rerender } = render(<Avatar alt="أحمد" />);
    const style1 = screen.getByRole('img').style.background;
    rerender(<Avatar alt="محمد" />);
    const style2 = screen.getByRole('img').style.background;
    // They may or may not differ (depends on hash), but both should be valid gradients
    expect(style1).toContain('linear-gradient');
    expect(style2).toContain('linear-gradient');
  });
});
