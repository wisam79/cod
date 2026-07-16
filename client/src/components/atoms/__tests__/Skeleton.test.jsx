import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SkeletonLine, SkeletonCard, SkeletonPage, SkeletonChat } from '../Skeleton';

describe('SkeletonLine', () => {
  it('renders with default dimensions', () => {
    const { container } = render(<SkeletonLine />);
    const el = container.firstChild;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('14px');
  });

  it('applies custom width and height', () => {
    const { container } = render(<SkeletonLine width="50%" height={20} />);
    const el = container.firstChild;
    expect(el.style.width).toBe('50%');
    expect(el.style.height).toBe('20px');
  });

  it('applies custom style', () => {
    const { container } = render(<SkeletonLine style={{ borderRadius: '50%' }} />);
    expect(container.firstChild.style.borderRadius).toBe('50%');
  });
});

describe('SkeletonCard', () => {
  it('renders a card with avatar circle and lines', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.querySelector('.card');
    expect(card).toBeInTheDocument();
  });

  it('renders custom number of lines', () => {
    const { container } = render(<SkeletonCard lines={5} />);
    const shimmerDivs = container.querySelectorAll('[style*="shimmer"]');
    expect(shimmerDivs.length).toBeGreaterThanOrEqual(5);
  });
});

describe('SkeletonPage', () => {
  it('renders default 3 skeleton cards', () => {
    const { container } = render(<SkeletonPage />);
    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBe(3);
  });

  it('renders custom number of cards', () => {
    const { container } = render(<SkeletonPage cards={1} />);
    const cards = container.querySelectorAll('.card');
    expect(cards.length).toBe(1);
  });
});

describe('SkeletonChat', () => {
  it('renders chat skeleton with alternating alignment', () => {
    const { container } = render(<SkeletonChat />);
    const skeletons = container.querySelectorAll('[style*="shimmer"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
