import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Badge from '../Badge';

describe('Badge', () => {
  it('renders content', () => {
    render(<Badge content="عالية" />);
    expect(screen.getByText('عالية')).toBeInTheDocument();
  });

  it('applies type class', () => {
    render(<Badge type="high" content="عالية" />);
    expect(screen.getByText('عالية').className).toContain('badge-high');
  });

  it('applies default class when no type', () => {
    render(<Badge content="نص" />);
    expect(screen.getByText('نص').className).toContain('badge-default');
  });

  it('applies custom className', () => {
    render(<Badge type="low" content="منخفضة" className="extra" />);
    expect(screen.getByText('منخفضة').className).toContain('extra');
  });

  it('renders with node content', () => {
    render(<Badge type="info" content={<span data-testid="inner">custom</span>} />);
    expect(screen.getByTestId('inner')).toBeInTheDocument();
  });
});
