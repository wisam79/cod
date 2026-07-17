import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';
import { useAppStore } from '../../../store/useAppStore';

let mockState = {
  login: vi.fn(),
  authLoading: false,
  authError: null
};

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: Object.assign(
    vi.fn((selector) => selector ? selector(mockState) : mockState),
    {
      getState: vi.fn(() => mockState)
    }
  )
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      login: vi.fn(),
      authLoading: false,
      authError: null
    };
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByText('تسجيل الدخول للمتابعة')).toBeInTheDocument();
  });

  it('renders username input', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('اسم المستخدم (5 حروف)')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('رمز الدخول PIN (6 أرقام)')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument();
  });

  it('renders app name', () => {
    render(<Login />);
    expect(screen.getByText('مُهِمَّة')).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    mockState.authError = 'Invalid credentials';
    render(<Login />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables button and shows loading text when loading', () => {
    mockState.authLoading = true;
    render(<Login />);
    const btn = screen.getByRole('button', { name: /جاري التحقق/i });
    expect(btn).toBeDisabled();
  });

  it('calls login on form submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    mockState.login = mockLogin;

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('اسم المستخدم (5 حروف)'), { target: { value: 'jasem' } });
    fireEvent.change(screen.getByPlaceholderText('رمز الدخول PIN (6 أرقام)'), { target: { value: '123456' } });
    fireEvent.submit(screen.getByRole('button', { name: /تسجيل الدخول/i }).closest('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('jasem', '123456');
    });
  });
});
