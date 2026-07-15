import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../Button';

describe('Button Component', () => {
  it('renders children correctly', () => {
    render(<Button>اضغط هنا</Button>);
    expect(screen.getByRole('button', { name: /اضغط هنا/i })).toBeInTheDocument();
  });

  it('triggers onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>اضغط هنا</Button>);
    const button = screen.getByRole('button', { name: /اضغط هنا/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies disabled attributes and styling', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick} disabled={true}>مغلق</Button>);
    const button = screen.getByRole('button', { name: /مغلق/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="danger">حذف</Button>);
    const button = screen.getByRole('button', { name: /حذف/i });
    expect(button).toHaveClass('btn-danger');
  });
});
