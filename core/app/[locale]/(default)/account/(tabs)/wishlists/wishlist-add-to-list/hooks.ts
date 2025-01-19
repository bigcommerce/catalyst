'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useWishlists() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchWishlists = async () => {
      try {
        const response = await fetch('/api/wishlists');
        if (response.status === 401) {
          // User is not authenticated
          setIsAuthenticated(false);
          return;
        }

        const data = await response.json();
        if (data?.wishlists) {
          setWishlists(data.wishlists);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Error fetching wishlists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlists();
  }, []);

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      router.push('/login'); // Redirect to login page
      return;
    }
  };

  return { wishlists, loading, isAuthenticated, handleWishlistClick };
}
