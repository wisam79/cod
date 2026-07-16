import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '../Input';

describe('Input', () => {
  it('renders text input by default', () => {
    render(<Input placeholder="اكتب هنا" />);
    expect(screen.getByPlaceholderText('اكتب هنا')).toBeInTheDocument();
  });

  it('renders textarea when type is textarea', () => {
    render(<Input type="textarea" placeholder="وصف المهمة" />);
    expect(screen.getByPlaceholderText('وصف المهمة').tagName).toBe('TEXTAREA');
  });

  it('renders input for non-textarea types', () => {
    render(<Input type="email" placeholder="البريد" />);
    expect(screen.getByPlaceholderText('البريد').tagName).toBe('INPUT');
  });

  it('fires onChange handler', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('applies required attribute', () => {
    render(<Input required />);
    expect(screen.getByRole('textbox')).toBeRequired();
  });

  it('applies name attribute', () => {
    render(<Input name="email" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email');
  });

  it('renders label when provided', () => {
    render(<Input label="البريد الإلكتروني" />);
    expect(screen.getByText('البريد الإلكتروني')).toBeInTheDocument();
  });

  it('does not render label when empty', () => {
    const { container } = render(<Input label="" />);
    expect(container.querySelector('label')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Input className="my-input" />);
    expect(screen.getByRole('textbox').parentElement.className).toContain('my-input');
  });

  it('sets textarea rows', () => {
    render(<Input type="textarea" rows={5} />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '5');
  });

  it('textarea defaults to 3 rows', () => {
    render(<Input type="textarea" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('rows', '3');
  });

  it('applies value prop', () => {
    render(<Input value="readonly" />);
    expect(screen.getByRole('textbox')).toHaveValue('readonly');
  });
});
