'use client';

export const checkAuthStatus = async () => {
  try {
    const response = await fetch('/api/auth-wishlist', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Auth check failed');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      isAuthenticated: false,
      user: null,
      message: 'Authentication check failed',
    };
  }
};
