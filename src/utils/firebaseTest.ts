import {db } from '../firebase/config';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    
    // Test Firestore connection by trying to read from users collection
    const usersCollection = collection(db, 'users');
    await getDocs(usersCollection);
    console.log('✅ Firestore connection successful');
    
    // Test Auth connection
    console.log('✅ Auth connection successful');
    
    // Test write permission by creating a temporary test document
    const testDocRef = doc(db, 'test', 'connection-test');
    await setDoc(testDocRef, { 
      timestamp: new Date(),
      test: true 
    });
    console.log('✅ Firestore write permission successful');
    
    // Clean up test document
    await deleteDoc(testDocRef);
    console.log('✅ Firestore cleanup successful');
    
    return true;
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('❌ Permission denied - check Firestore rules');
    } else if (error.code === 'unavailable') {
      console.error('❌ Service unavailable - check Firebase project status');
    } else if (error.code === 'unenticated') {
      console.error('❌ Authentication required');
    }
    
    return false;
  }
};
