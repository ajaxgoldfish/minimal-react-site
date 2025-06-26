'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

export interface UserWithRole {
  id: number;
  clerkId: string;
  name: string | null;
  role: 'admin' | 'customer';
}

export function useUserRole() {
  const { user, isLoaded } = useUser();
  const [userWithRole, setUserWithRole] = useState<UserWithRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) {
      setUserWithRole(null);
      return;
    }

    setLoading(true);
    setError(null);

    fetch('/api/user/me')
      .then((res) => {
        if (!res.ok) {
          throw new Error('获取用户信息失败');
        }
        return res.json();
      })
      .then((data) => {
        setUserWithRole(data);
      })
      .catch((err) => {
        console.error('Error fetching user role:', err);
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isLoaded]);

  return {
    userWithRole,
    loading,
    error,
    isAdmin: userWithRole?.role === 'admin',
    isCustomer: userWithRole?.role === 'customer',
  };
} 