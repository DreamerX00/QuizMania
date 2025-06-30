"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser as useClerkUser } from '@clerk/nextjs';

// User type for context consumers
export interface AppUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isSignedIn, isLoaded } = useClerkUser();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncUser() {
      if (isLoaded && isSignedIn && user) {
        console.log('Syncing user to DB:', user.id, user.emailAddresses[0]?.emailAddress);
        const res = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : undefined,
            avatarUrl: user.imageUrl,
          }),
        });
        const dbUser = await res.json();
        console.log('DB user after sync:', dbUser);
        setAppUser({
          id: dbUser.clerkId,
          email: dbUser.email,
          name: dbUser.name,
          avatarUrl: dbUser.avatarUrl,
        });
        setLoading(false);
      } else {
        setAppUser(null);
        setLoading(false);
      }
    }
    syncUser();
  }, [isLoaded, isSignedIn, user]);

  return (
    <AuthContext.Provider value={{ user: appUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 