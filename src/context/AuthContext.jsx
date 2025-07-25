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

  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);

  useEffect(() => {
    // Correctly get the subscription object directly
    const { data: { subscription } } = supabase.auth.onAuthStateChange( // <-- Change here: destructure `subscription`
      async (event, session) => {
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

    // Cleanup: Use the `subscription` object to unsubscribe
    return () => {
      if (subscription) { // Ensure subscription exists before unsubscribing
        subscription.unsubscribe(); // <-- Corrected line
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

  const signupCandidate = async (email, password) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      const response = await api.post('/auth/signup/candidate', {
        email: authData.user.email,
        password: password,
        token: authData.session?.access_token,
        provider: authData.user?.app_metadata?.provider || 'email'
      });
      return response.data;
    } catch (error) {
      console.error('Candidate signup error:', error.message);
      throw error;
    }
  };

  const signupRecruiter = async (email, password, companyDetails, socialToken, socialProvider) => {
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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        authUser = data.user;
        authSession = data.session;
      } else {
        throw new Error("Invalid signup details. Provide email/password or social token/provider.");
      }

      if (!authUser || !authUser.id) {
        throw new Error("User not authenticated by Supabase during recruiter signup flow.");
      }

      const response = await api.post('/auth/signup/recruiter', {
        email: authUser.email,
        password: password,
        companyName: companyDetails.name,
        companyWebsite: companyDetails.website,
        companyDescription: companyDetails.description,
        companyLogoUrl: companyDetails.logo_url,
        token: authSession?.access_token || socialToken,
        provider: authUser.app_metadata.provider || socialProvider
      });
      return response.data;
    } catch (error) {
      console.error('Recruiter signup error:', error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
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