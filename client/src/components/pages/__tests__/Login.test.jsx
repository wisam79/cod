import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Login from '../Login';
import { useAppStore } from '../../../store/useAppStore';

vi.mock('../../../store/useAppStore', () => ({
  useAppStore: Object.assign(
    vi.fn(() => ({
      login: vi.fn(),
      isLoading: false,
      error: null
    })),
    {
      getState: vi.fn(() => ({
        login: vi.fn(),
        isLoading: false,
        error: null
      }))
    }
  )
}));

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByText('تسجيل الدخول للمتابعة')).toBeInTheDocument();
  });

  it('renders email input', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('البريد الإلكتروني')).toBeInTheDocument();
  });

  it('renders password input', () => {
    render(<Login />);
    expect(screen.getByPlaceholderText('كلمة المرور')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<Login />);
    expect(screen.getByRole('button', { name: /تسجيل الدخول/i })).toBeInTheDocument();
  });

  it('renders app name', () => {
    render(<Login />);
    expect(screen.getByText('مُهِمَّة')).toBeInTheDocument();
  });

  it('renders admin hint', () => {
    render(<Login />);
    expect(screen.getByText(/wisam@mohemmaty.com/)).toBeInTheDocument();
  });

  it('shows error message when error is present', () => {
    useAppStore.mockReturnValueOnce({
      login: vi.fn(),
      isLoading: false,
      error: 'Invalid credentials'
    });
    render(<Login />);
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('disables button and shows loading text when loading', () => {
    useAppStore.mockReturnValueOnce({
      login: vi.fn(),
      isLoading: true,
      error: null
    });
    render(<Login />);
    const btn = screen.getByRole('button', { name: /جاري التحقق/i });
    expect(btn).toBeDisabled();
  });

  it('calls login on form submit', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    useAppStore.mockImplementation(() => ({
      login: mockLogin,
      isLoading: false,
      error: null
    }));

    render(<Login />);
    fireEvent.change(screen.getByPlaceholderText('البريد الإلكتروني'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('كلمة المرور'), { target: { value: 'pass123' } });
    fireEvent.submit(screen.getByRole('button', { name: /تسجيل الدخول/i }).closest('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'pass123');
    });
  });
});
