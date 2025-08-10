# 🐛 BugKiller - Bug Tracking Platform

A comprehensive bug tracking and project management platform built with React, TypeScript, and Firebase. BugKiller provides all the essential features of BugHerd in a modern, user-friendly interface.

## ✨ Features

### 🔐 Authentication & Security
- **Email/Password Authentication** - Secure user registration and login
- **Google OAuth** - One-click login with Google accounts
- **GitHub OAuth** - Developer-friendly GitHub integration
- **Role-based Access Control** - Admin, User, and Viewer roles
- **Firebase Security Rules** - Comprehensive data protection
- **Two-Factor Authentication** - Enhanced security (coming soon)

### 🐛 Bug Management
- **Visual Bug Reporting** - Screenshot and annotation tools
- **Bug Tracking** - Full lifecycle management from creation to resolution
- **Priority Levels** - Critical, High, Medium, Low prioritization
- **Status Tracking** - New, In Progress, Review, Resolved, Closed
- **File Attachments** - Support for images, documents, and screenshots
- **Comments & Collaboration** - Team communication on bugs
- **Labels & Categories** - Organized bug classification

### 📊 Project Management
- **Multi-project Support** - Manage multiple projects simultaneously
- **Team Collaboration** - Add team members with different roles
- **Project Settings** - Customizable project configurations
- **Activity Logs** - Track all project activities
- **Analytics Dashboard** - Project performance insights

### 🎯 Dashboard & Analytics
- **Real-time Statistics** - Live bug counts and project metrics
- **Recent Activity** - Latest updates and changes
- **Quick Actions** - Fast access to common tasks
- **Performance Metrics** - Bug resolution times and trends
- **Team Productivity** - Individual and team performance tracking

### 🔔 Notifications & Communication
- **Real-time Notifications** - Instant updates on bug changes
- **Email Notifications** - Important updates delivered to inbox
- **Comment Threads** - Rich discussion on bugs
- **@mentions** - Direct team member notifications
- **Activity Feed** - Comprehensive project timeline

## 🛠 Tech Stack

### Frontend
- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **React Router DOM** - Client-side routing

### Backend & Services
- **Firebase Authentication** - Secure user management
- **Firestore** - NoSQL database with real-time updates
- **Firebase Storage** - File upload and management
- **Firebase Hosting** - Global CDN hosting
- **Firebase Security Rules** - Comprehensive data protection

### Development Tools
- **ESLint** - Code quality and consistency
- **TypeScript** - Static type checking
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bugkiller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Get your Firebase configuration

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint

# Type check
npm run type-check
```

### Project Structure

```
baghous/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, Modal)
│   │   ├── layout/         # Layout components (Header, Sidebar)
│   │   ├── dashboard/      # Dashboard-specific components
│   │   └── auth/           # Authentication components
│   ├── context/            # React Context providers
│   ├── firebase/           # Firebase configuration
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Page components
│   ├── router/             # Routing configuration
│   ├── services/           # API and service functions
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── firestore.rules         # Firestore security rules
├── storage.rules           # Firebase Storage rules
├── firebase.json           # Firebase configuration
└── firestore.indexes.json  # Firestore indexes
```

## 🔒 Security Features

### Firestore Security Rules
- **Authentication Required** - All operations require user authentication
- **Role-based Access** - Different permissions for different user roles
- **Project-based Access** - Users can only access projects they're members of
- **Data Ownership** - Users can only modify their own data
- **Immutable Logs** - Activity logs cannot be modified once created

### Storage Security Rules
- **File Type Validation** - Only allowed file types can be uploaded
- **Size Limits** - Prevents abuse with file size restrictions
- **User-specific Access** - Users can only access their own files
- **Project-based Access** - Team members can access project files

### Authentication Security
- **Secure Password Requirements** - Strong password policies
- **Email Verification** - Verified email addresses required
- **Session Management** - Secure session handling
- **OAuth Integration** - Secure third-party authentication

## 🚀 Deployment

### Firebase Deployment

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done)
   ```bash
   firebase init
   ```

4. **Deploy using the script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy Firestore rules**
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Deploy Firestore indexes**
   ```bash
   firebase deploy --only firestore:indexes
   ```

4. **Deploy Storage rules**
   ```bash
   firebase deploy --only storage
   ```

5. **Deploy hosting**
   ```bash
   firebase deploy --only hosting
   ```

### Environment Setup

1. **Production Environment Variables**
   - Set up environment variables in your hosting platform
   - Ensure all Firebase configuration is properly set

2. **Custom Domain** (Optional)
   - Configure custom domain in Firebase Hosting
   - Set up SSL certificates automatically

3. **CDN Configuration**
   - Firebase Hosting provides global CDN
   - Configure cache headers for optimal performance

## 📊 Performance Optimization

### Frontend Optimization
- **Code Splitting** - Automatic route-based code splitting
- **Lazy Loading** - Components loaded on demand
- **Image Optimization** - Compressed and optimized images
- **Bundle Analysis** - Monitor bundle size and performance

### Database Optimization
- **Indexed Queries** - Optimized Firestore indexes
- **Pagination** - Efficient data loading
- **Real-time Updates** - Minimal data transfer
- **Offline Support** - Works without internet connection

### Caching Strategy
- **Browser Caching** - Static assets cached for 1 year
- **Service Worker** - Offline functionality (coming soon)
- **Firestore Caching** - Automatic data caching
- **CDN Caching** - Global content delivery

## 🔧 Configuration

### Firebase Configuration
- **Authentication Methods** - Configure OAuth providers
- **Firestore Rules** - Customize security rules
- **Storage Rules** - Configure file upload permissions
- **Hosting Settings** - Custom domain and SSL

### Application Settings
- **Theme Configuration** - Customize colors and branding
- **Feature Flags** - Enable/disable features
- **Notification Settings** - Configure notification preferences
- **Performance Settings** - Optimize for your use case

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow the existing code style
- Ensure all tests pass

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Common Issues

1. **Firebase Configuration**
   - Ensure all environment variables are set correctly
   - Check Firebase project settings
   - Verify authentication methods are enabled

2. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check TypeScript configuration
   - Verify all imports are correct

3. **Deployment Issues**
   - Ensure Firebase CLI is installed and logged in
   - Check Firebase project permissions
   - Verify hosting configuration

### Getting Help
- **Documentation** - Check this README and inline code comments
- **Issues** - Create an issue on GitHub
- **Discussions** - Use GitHub Discussions for questions
- **Email Support** - Contact support@bugkiller.com

## 🎯 Roadmap

### Upcoming Features
- **Real-time Collaboration** - Live editing and commenting
- **Advanced Analytics** - Detailed performance metrics
- **API Integration** - Webhook and API support
- **Mobile App** - Native iOS and Android apps
- **Advanced Reporting** - Custom reports and exports
- **Workflow Automation** - Automated bug assignment and notifications

### Performance Improvements
- **Service Worker** - Offline functionality
- **Progressive Web App** - Installable web app
- **Advanced Caching** - Intelligent data caching
- **Performance Monitoring** - Real-time performance tracking

---

**Built with ❤️ using React, TypeScript, and Firebase** 