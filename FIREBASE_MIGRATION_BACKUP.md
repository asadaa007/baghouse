# 🔥 Firebase Migration Backup - BugKiller

This file contains all the Firebase configuration, rules, and settings from your previous "baghouse-cc3b1" project that you can use to set up your new "bugkiller" Firebase project.

## 📋 **Firebase Project Setup Checklist**

### 1. **Create New Firebase Project**
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Add project"
- Name: `bugkiller` or `bugkiller-app`
- Enable Google Analytics (optional)
- Follow setup wizard

### 2. **Enable Required Services**

#### Authentication
- Go to Authentication → Sign-in method
- Enable these providers:
  - ✅ Email/Password
  - ✅ Google
  - ✅ GitHub (if you want OAuth)

#### Firestore Database
- Go to Firestore Database
- Click "Create database"
- Choose "Start in test mode" (we'll add rules later)
- Select location closest to your users

#### Storage
- Go to Storage
- Click "Get started"
- Choose "Start in test mode" (we'll add rules later)
- Select location closest to your users

## 🔒 **Firestore Security Rules**

Copy this to your new project's `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    // Users collection
    match /users/{userId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }

    // Projects collection
    match /projects/{projectId} {
      allow read, write: if isAuthenticated();
    }

    // Bugs collection - More permissive for development
    match /bugs/{bugId} {
      allow read, write: if isAuthenticated();
    }

    // Comments collection (subcollection of bugs)
    match /bugs/{bugId}/comments/{commentId} {
      allow read, write: if isAuthenticated();
    }

    // Attachments collection (subcollection of bugs)
    match /bugs/{bugId}/attachments/{attachmentId} {
      allow read, write: if isAuthenticated();
    }

    // Project members collection (subcollection of projects)
    match /projects/{projectId}/members/{memberId} {
      allow read, write: if isAuthenticated();
    }

    // Project settings collection (subcollection of projects)
    match /projects/{projectId}/settings/{settingId} {
      allow read, write: if isAuthenticated();
    }

    // Notifications collection
    match /notifications/{notificationId} {
      allow read, write: if isAuthenticated() && isOwner(resource.data.userId);
    }

    // Activity logs collection
    match /activity_logs/{logId} {
      allow read, write: if isAuthenticated();
    }

    // Default deny all
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 📁 **Storage Security Rules**

Copy this to your new project's `storage.rules`:

```javascript
rules_version = '2';

// Craft rules based on data in your Firestore database
// allow write: if firestore.get(
//    /databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin;
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🔧 **Firebase Configuration**

Copy this to your new project's `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "emulators": {
    "auth": {
      "port": 9099
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
```

## 📊 **Firestore Indexes**

Copy this to your new project's `firestore.indexes.json`:

```json
{
  "indexes": [],
  "fieldOverrides": []
}
```

## 🌐 **Environment Variables**

After creating your new Firebase project, update your `.env` file with the new project details:

```env
# Firebase Configuration (Update with your new project details)
VITE_FIREBASE_API_KEY=your_new_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_new_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_new_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_new_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_new_sender_id
VITE_FIREBASE_APP_ID=your_new_app_id

# Cloudinary Configuration (Keep existing)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 **Deployment Steps**

### 1. **Update Local Configuration**
```bash
# Update .firebaserc with your new project ID
firebase use your_new_project_id

# Or manually edit .firebaserc:
{
  "projects": {
    "default": "your_new_project_id"
  }
}
```

### 2. **Deploy Rules and Indexes**
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

### 3. **Test Configuration**
```bash
# Start emulators to test locally
firebase emulators:start

# Test your app locally
npm run dev
```

## 📝 **Additional Settings to Configure**

### Authentication Settings
- **Authorized domains**: Add your domain (e.g., `your-app.netlify.app`)
- **OAuth redirect domains**: Add your domain for OAuth providers

### Firestore Settings
- **Backup and restore**: Configure if needed
- **Data export**: Set up if required

### Storage Settings
- **CORS configuration**: If needed for file uploads
- **Lifecycle rules**: Configure file retention policies

## 🔄 **Data Migration (Optional)**

If you want to migrate data from your old project:

1. **Export data from old project**:
   ```bash
   # Export Firestore data
   firebase firestore:export ./backup-data
   ```

2. **Import to new project**:
   ```bash
   # Import to new project
   firebase firestore:import ./backup-data
   ```

## ✅ **Verification Checklist**

After setting up your new Firebase project:

- [ ] Authentication methods enabled
- [ ] Firestore database created
- [ ] Storage bucket created
- [ ] Security rules deployed
- [ ] Environment variables updated
- [ ] Local configuration updated
- [ ] App connects successfully
- [ ] Authentication works
- [ ] File uploads work
- [ ] Database operations work

## 🆘 **Troubleshooting**

### Common Issues
1. **Authentication errors**: Check OAuth redirect domains
2. **Storage upload failures**: Verify CORS configuration
3. **Firestore permission errors**: Check security rules
4. **Environment variable issues**: Verify all variables are set

### Debug Commands
```bash
# Check Firebase project
firebase projects:list

# Check current project
firebase use

# Test rules locally
firebase emulators:start --only firestore

# View logs
firebase functions:log
```

---

**Your new BugKiller Firebase project is now ready!** 🚀

Remember to update your deployment scripts and documentation with the new project ID.
