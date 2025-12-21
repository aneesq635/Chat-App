'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import supabase from "../../components/supabase"

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          // Create user in MongoDB
          const response = await fetch('/api/users/create', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              supabaseId: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata.full_name,
              avatar: session.user.user_metadata.avatar_url,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create user in database');
          }

          // Redirect to dashboard or home
          router.push('/MainApp');
        } else {
          // No session, redirect to login
          router.push('/login');
        }
      } catch (error) {
        console.error('Callback error:', error);
        router.push('/login?error=auth_failed');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div>Processing authentication...</div>
    </div>
  );
}