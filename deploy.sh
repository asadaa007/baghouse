#!/bin/bash

# Baghous Firebase + Netlify Deployment Script

echo "🚀 Starting Baghous deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ You are not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "❌ Netlify CLI is not installed. Please install it first:"
    echo "npm install -g netlify-cli"
    exit 1
fi

# Build the project
echo "📦 Building the project..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"

# Deploy Firestore rules
echo "🔥 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -ne 0 ]; then
    echo "❌ Firestore rules deployment failed."
    exit 1
fi

# Deploy Firestore indexes
echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -ne 0 ]; then
    echo "❌ Firestore indexes deployment failed."
    exit 1
fi

# Deploy Storage rules
echo "💾 Deploying Storage rules..."
firebase deploy --only storage

if [ $? -ne 0 ]; then
    echo "❌ Storage rules deployment failed."
    exit 1
fi

echo "✅ Firebase services deployed successfully!"

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
netlify deploy --prod --dir=dist

if [ $? -ne 0 ]; then
    echo "❌ Netlify deployment failed."
    exit 1
fi

echo "🎉 Deployment completed successfully!"
echo "Your Baghous application is now live on Netlify!"
echo "Firebase services (Firestore & Storage) are also deployed and ready." 