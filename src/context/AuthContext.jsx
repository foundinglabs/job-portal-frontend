import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import api, { setAuthTokenGetter } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Effect to set the token getter for Axios API calls
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  // Effect to handle Supabase authentication state changes and user redirection
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, 'Session:', session);
        if (event === 'SIGNED_IN' && session) {
          console.log('Auth event: SIGNED_IN', session.user);
          setUser(session.user);
          setToken(session.access_token);

          try {
            const response = await api.get('/auth/me', {
              headers: { Authorization: `Bearer ${session.access_token}` }
            });
            setRole(response.data.role);
            setCompanyId(response.data.company_id);
            console.log('User role and company ID from backend:', response.data.role, response.data.company_id);

            if (response.data.role === 'recruiter') {
              navigate('/recruiter/dashboard');
            } else if (response.data.role === 'candidate') {
              navigate('/jobs');
            } else {
              navigate('/');
            }
          } catch (error) {
            console.error('Error fetching user role from backend:', error.response?.data?.message || error.message);
            setRole('candidate');
            setCompanyId(null);
            navigate('/jobs');
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('Auth event: SIGNED_OUT');
          setUser(null);
          setRole(null);
          setCompanyId(null);
          setToken(null);
          navigate('/');
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session);
      if (session) {
        setUser(session.user);
        setToken(session.access_token);
        api.get('/auth/me', {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
        .then(response => {
          setRole(response.data.role);
          setCompanyId(response.data.company_id);
        })
        .catch(error => {
          console.error('Error fetching user role on session load:', error.response?.data?.message || error.message);
          setRole('candidate');
        })
        .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  };

  const loginWithSocial = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
           redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Social login (${provider}) error:`, error.message);
      throw error;
    }
  };

  // Helper function to wait for user ID to be available in session
  const waitForUserId = async (retries = 10, delay = 200) => {
    for (let i = 0; i < retries; i++) {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id && typeof session.user.id === 'string' && session.user.id.length === 36) {
        return session.user;
      }
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return null;
  };

  // Candidate signup function
  const signupCandidate = async (email, password, confirmPassword) => {
    try {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) throw signUpError;

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        console.warn('Explicit sign-in after candidate signup failed:', signInError.message);
        throw signInError;
      }
      
      const authUser = await waitForUserId();
      const { data: { session: authSession } } = await supabase.auth.getSession();

      if (!authUser || !authUser.id || typeof authUser.id !== 'string' || authUser.id.length !== 36) {
        throw new Error("User data not available or invalid UUID after signup/signin/wait. Please ensure 'Confirm email' is OFF in Supabase settings.");
      }

      const response = await api.post('/auth/signup/candidate', {
        email: authUser.email,
        password: password,
        confirmPassword: confirmPassword,
        userId: authUser.id,
        token: authSession?.access_token,
        provider: authUser.app_metadata?.provider || 'email'
      });

      return response.data;
    } catch (error) {
      console.error('Candidate signup error:', error.message);
      throw error;
    }
  };

  // Recruiter signup function
  const signupRecruiter = async (email, password, confirmPassword, companyDetails, socialToken, socialProvider) => {
    try {
      let authUser = null;
      let authSession = null;

      if (socialToken && socialProvider) {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session) throw new Error("Supabase session not found after social redirect for recruiter signup.");
        authUser = session.user;
        authSession = session;
      } else if (email && password) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) throw signUpError;

        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) {
          console.warn('Explicit sign-in after recruiter signup failed:', signInError.message);
          throw signInError;
        }

        authUser = await waitForUserId();
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        authSession = currentSession;
        
        if (!authUser || !authUser.id || typeof authUser.id !== 'string' || authUser.id.length !== 36) {
          throw new Error("User data not available or invalid UUID after signup/signin/wait. Please ensure 'Confirm email' is OFF in Supabase settings.");
        }
      } else {
        throw new Error("Invalid signup details. Provide email/password or social token/provider.");
      }

      if (!authUser || !authUser.id) {
        throw new Error("User not authenticated by Supabase during recruiter signup flow.");
      }

      const response = await api.post('/auth/signup/recruiter', {
        email: authUser.email,
        password: password,
        confirmPassword: confirmPassword,
        userId: authUser.id,
        companyName: companyDetails.name,
        companyWebsite: companyDetails.website,
        companyDescription: companyDetails.description,
        companyLogoUrl: companyDetails.logo_url,
        token: authSession?.access_token,
        provider: authUser.app_metadata?.provider || socialProvider
      });

      return response.data;
    } catch (error) {
      console.error('Recruiter signup error:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Get the current session to check if a user is logged in
      const { data: { session } } = await supabase.auth.getSession();
      
      // If a session exists, perform the sign out.
      if (session) {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;
      } else {
          // If no session exists, log out is not needed.
          console.log('No active session to sign out.');
      }
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  };

  const authContextValue = {
    user,
    role,
    companyId,
    isAuthenticated: !!user,
    loading,
    login,
    loginWithSocial,
    signupCandidate,
    signupRecruiter,
    logout,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};