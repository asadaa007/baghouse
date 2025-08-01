# 🚀 Deployment Guide - Firebase + Netlify

This guide explains how to deploy Baghous using Firebase for backend services and Netlify for hosting.

## 📋 Prerequisites

### Firebase Setup
- ✅ Firebase CLI installed: `npm install -g firebase-tools`
- ✅ Logged in to Firebase: `firebase login`
- ✅ Project configured: `baghouse-cc3b1`

### Netlify Setup
- ✅ Netlify CLI installed: `npm install -g netlify-cli`
- ✅ Logged in to Netlify: `netlify login`

## 🔧 Current Configuration

### Firebase Project
- **Project ID:** `baghouse-cc3b1`
- **Account:** `to.asadurrehman@gmail.com`
- **Services:** Firestore, Storage, Authentication

### Environment Variables
Make sure your `.env` file contains:
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=baghouse-cc3b1.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=baghouse-cc3b1
VITE_FIREBASE_STORAGE_BUCKET=baghouse-cc3b1.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary Configuration (Free Alternative to Firebase Storage)
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret
```

## 🚀 Deployment Steps

### Option 1: Automated Deployment (Recommended)
```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

### Option 2: Manual Deployment

#### 1. Build the Project
```bash
npm run build
```

#### 2. Deploy Firebase Services
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes

# Deploy Storage rules
firebase deploy --only storage
```

#### 3. Deploy to Netlify
```bash
# Deploy to production
netlify deploy --prod --dir=dist
```

## 🔒 Security Rules Status

### Firestore Rules
- ✅ **Authentication Required** - All operations require user authentication
- ✅ **Project-based Access** - Users only see their projects
- ✅ **Role-based Permissions** - Different access levels
- ✅ **Data Protection** - Users can't access unauthorized data

### Storage Rules
- ✅ **File Type Validation** - Only allowed file types
- ✅ **Size Limits** - Prevents abuse
- ✅ **User-specific Access** - Users only access their files
- ✅ **Project-based Access** - Team members access project files

## 🌐 Netlify Configuration

### Build Settings
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Node Version:** 18

### Redirects
- All routes redirect to `index.html` for SPA routing

### Caching
- Static assets cached for 1 year
- HTML files not cached (always fresh)

## 📊 Monitoring

### Firebase Console
- **URL:** https://console.firebase.google.com/project/baghouse-cc3b1
- **Services:** Firestore, Storage, Authentication

### Netlify Dashboard
- **URL:** https://app.netlify.com
- **Features:** Deployments, Analytics, Forms

## 🔧 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Firebase Permission Errors**
   ```bash
   # Check authentication
   firebase login:list
   
   # Re-login if needed
   firebase logout
   firebase login
   ```

3. **Netlify Deployment Issues**
   ```bash
   # Check Netlify status
   netlify status
   
   # Manual deployment
   netlify deploy --prod --dir=dist
   ```

### Environment Variables
Make sure all environment variables are set in:
- **Development:** `.env` file
- **Production:** Netlify environment variables

## 📈 Performance Optimization

### Firebase
- ✅ **Indexed Queries** - Optimized Firestore indexes
- ✅ **Security Rules** - Efficient permission checking
- ✅ **Caching** - Automatic data caching

### Netlify
- ✅ **CDN** - Global content delivery
- ✅ **Caching** - Optimized cache headers
- ✅ **Compression** - Automatic asset compression

## 🎯 Next Steps

1. **Set up custom domain** in Netlify
2. **Configure SSL certificates** (automatic with Netlify)
3. **Set up monitoring** and analytics
4. **Configure CI/CD** for automatic deployments

---

**Your Baghous application is now ready for production deployment!** 🚀 