import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDocs, collection, serverTimestamp, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import type { AppUser, UserRole } from '../types/auth';

interface AuthState {
  user: AppUser | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convert Firebase User to AppUser
const convertFirebaseUser = async (firebaseUser: User | null): Promise<AppUser | null> => {
  if (!firebaseUser) return null;
  
  try {
    // Search for user document by email since we're using custom IDs now
    const q = query(collection(db, 'users'), where('email', '==', firebaseUser.email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data() as any;
      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatar: data.avatar,
        role: data.role,
        teamId: data.teamId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      };
    }
    
    // Fallback to basic user data if Firestore document doesn't exist
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      avatar: firebaseUser.photoURL || undefined,
      role: 'team_member' as UserRole,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('❌ Error fetching user data:', error);
    // Fallback to basic user data
    return {
      id: firebaseUser.uid,
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
      avatar: firebaseUser.photoURL || undefined,
      role: 'team_member' as UserRole,
      createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
      updatedAt: new Date(),
    };
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const appUser = await convertFirebaseUser(firebaseUser);
      setUser(appUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create Firebase Auth user first
      const userCredential = await createUserWithEmailAndPassword(auth, credentials.email, credentials.password);
      const firebaseUser = userCredential.user;
      
      // Now that user is authenticated, check if there are any existing users in the system
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const isFirstUser = usersSnapshot.empty;
      
      // Determine role based on whether this is the first user
      const role: UserRole = isFirstUser ? 'super_admin' : 'team_member';
      
      // Create user document in Firestore
      const userDoc = {
        id: firebaseUser.uid,
        name: credentials.name,
        email: credentials.email,
        role: role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);
      
      // Force refresh user data to ensure it's loaded correctly
      const refreshedUser = await convertFirebaseUser(firebaseUser);
      if (refreshedUser) {
        setUser(refreshedUser);
      }
      
    } catch (error: any) {
      console.error('Registration error details:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/operation-not-allowed') {
        errorMessage = 'Email/password accounts are not enabled. Please contact support.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await signOut(auth);
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 