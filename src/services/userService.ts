import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from '../firebase/config';
import type { AppUser, UserRole } from '../types/auth';

const USERS_COLLECTION = 'users';

export interface CreateUserData {
  name: string;
  email: string;
  role: UserRole;
  teamId?: string;
  createdBy: string;
}

export interface UpdateUserData {
  name?: string;
  role?: UserRole;
  teamId?: string;
  updatedBy: string;
}

// Create a new user
export const createUser = async (userData: CreateUserData): Promise<string> => {
  try {
    console.log('Creating user document only (Firebase Auth will be created on first password reset)...');
    
    // Generate a unique ID for the user
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create Firestore document first
    const userDoc = {
      id: userId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      teamId: userData.teamId || null,
      createdBy: userData.createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      status: 'pending_activation',
      firebaseAuthUid: null // Will be set when user first resets password
    };

    console.log('Creating Firestore document...');
    await setDoc(doc(db, USERS_COLLECTION, userId), userDoc);
    console.log('✅ Firestore user document created');
    
    // Try to send password reset email
    // This will fail if the user doesn't exist in Firebase Auth yet, but that's expected
    try {
      console.log('Attempting to send password reset email...');
      await sendPasswordResetEmail(auth, userData.email);
      console.log('✅ Password reset email sent');
    } catch (emailError: any) {
      console.log('⚠️ Password reset email failed (user not in Firebase Auth yet):', emailError.message);
      // This is expected - the user will need to use "Forgot Password" to create their Firebase Auth account
    }
    
    return userId;
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    // Provide specific error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('An account with this email already exists');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Please enter a valid email address');
    } else {
      throw new Error('Failed to create user: ' + error.message);
    }
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<AppUser | null> => {
  try {
    const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
    
    if (userDoc.exists()) {
      const data = userDoc.data() as any;
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        teamId: data.teamId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Not part of AppUser type but useful for filtering in UI
        createdBy: data.createdBy,
      } as any;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user');
  }
};

// Get all users (with optional filtering)
export const getAllUsers = async (filters?: {
  role?: UserRole;
  teamId?: string;
  createdBy?: string;
}): Promise<AppUser[]> => {
  try {
    let q = query(collection(db, USERS_COLLECTION));
    
    if (filters?.role) {
      q = query(q, where('role', '==', filters.role));
    }
    
    if (filters?.teamId) {
      q = query(q, where('teamId', '==', filters.teamId));
    }
    
    if (filters?.createdBy) {
      q = query(q, where('createdBy', '==', filters.createdBy));
    }
    
    const querySnapshot = await getDocs(q);
    const users: AppUser[] = [] as any;
    
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      users.push({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        teamId: data.teamId,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        // Not part of AppUser type but useful for filtering in UI
        createdBy: data.createdBy,
      } as any);
    });
    
    return users as any;
  } catch (error) {
    console.error('Error getting users:', error);
    throw new Error('Failed to get users');
  }
};

// Get users by role
export const getUsersByRole = async (role: UserRole): Promise<AppUser[]> => {
  return getAllUsers({ role });
};

// Get users by team
export const getUsersByTeam = async (teamId: string): Promise<AppUser[]> => {
  return getAllUsers({ teamId });
};

// Update user
export const updateUser = async (userId: string, userData: UpdateUserData): Promise<void> => {
  try {
    const updateData: any = {
      updatedAt: serverTimestamp(),
      updatedBy: userData.updatedBy
    };
    
    if (userData.name !== undefined) updateData.name = userData.name;
    if (userData.role !== undefined) updateData.role = userData.role;
    if (userData.teamId !== undefined) updateData.teamId = userData.teamId;
    
    // Update Firestore document
    await updateDoc(doc(db, USERS_COLLECTION, userId), updateData);
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Failed to update user');
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // Delete Firestore document first
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
    console.log('✅ Firestore user document deleted');
    
    // Note: Deleting Firebase Auth user requires admin SDK or user to be signed in
    // For now, we'll only delete the Firestore document
    // The Firebase Auth user will remain but won't have access to the app
    console.log('⚠️ Firebase Auth user deletion requires admin SDK');
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
};

// Assign user to team
export const assignUserToTeam = async (userId: string, teamId: string, updatedBy: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      teamId,
      updatedAt: serverTimestamp(),
      updatedBy
    });
  } catch (error) {
    console.error('Error assigning user to team:', error);
    throw new Error('Failed to assign user to team');
  }
};

// Remove user from team
export const removeUserFromTeam = async (userId: string, updatedBy: string): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), {
      teamId: null,
      updatedAt: serverTimestamp(),
      updatedBy
    });
  } catch (error) {
    console.error('Error removing user from team:', error);
    throw new Error('Failed to remove user from team');
  }
};

// Get users created by a specific user (for managers to see their team members)
export const getUsersCreatedBy = async (createdBy: string): Promise<AppUser[]> => {
  return getAllUsers({ createdBy });
};

// Send password reset email to user
export const sendPasswordResetToUser = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ Password reset email sent to:', email);
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    if (error.code === 'auth/user-not-found') {
      throw new Error('No user found with this email address');
    } else {
      throw new Error('Failed to send password reset email: ' + error.message);
    }
  }
};

// Link Firestore user document with Firebase Auth user
export const linkUserWithFirebaseAuth = async (email: string, firebaseAuthUid: string): Promise<void> => {
  try {
    // Find the user document by email
    const q = query(collection(db, USERS_COLLECTION), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('No user found with this email address');
    }
    
    const userDoc = querySnapshot.docs[0];
    
    // Update the document with Firebase Auth UID and change status
    await updateDoc(doc(db, USERS_COLLECTION, userDoc.id), {
      firebaseAuthUid: firebaseAuthUid,
      status: 'active',
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ User document linked with Firebase Auth:', firebaseAuthUid);
  } catch (error) {
    console.error('Error linking user with Firebase Auth:', error);
    throw new Error('Failed to link user with Firebase Auth');
  }
};

export const getUserNamesByIds = async (userIds: string[]): Promise<Record<string, string>> => {
  const userNames: Record<string, string> = {};
  
  try {
    // Get users from all role-based collections
    const allUsers = await getAllUsers();
    
    // Create a map of user IDs to names
    allUsers.forEach(user => {
      if (userIds.includes(user.id)) {
        userNames[user.id] = user.name;
      }
    });
  } catch (error) {
    console.error('Error fetching user names:', error);
  }
  
  return userNames;
};

export const getUserDetailsByIds = async (userIds: string[]): Promise<Record<string, { name: string; role: string }>> => {
  const userDetails: Record<string, { name: string; role: string }> = {};
  
  try {
    // Get users from all role-based collections
    const allUsers = await getAllUsers();
    
    // Create a map of user IDs to details
    allUsers.forEach(user => {
      if (userIds.includes(user.id)) {
        userDetails[user.id] = {
          name: user.name,
          role: user.role
        };
      }
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
  }
  
  return userDetails;
};
