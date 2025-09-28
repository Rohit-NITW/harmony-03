# 🔥 Firebase Setup Guide for Harmony App - UPDATED

## 🚨 IMPORTANT: Follow these steps to fix the connection error

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: "harmony-app" (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Set up Authentication

1. In Firebase Console, go to "Authentication" → "Get started"
2. Go to "Sign-in method" tab
3. Enable "Email/Password" authentication
4. Optionally enable "Google" for social login

## 3. Set up Firestore Database

1. Go to "Firestore Database" → "Create database"
2. Start in "Test mode" (for development)
3. Choose a location close to your users

## 4. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. In "General" tab, scroll to "Your apps"
3. Click "Web" icon (</>) to add a web app
4. Register app with name "Harmony"
5. Copy the Firebase configuration object
6. Replace the config in `src/config/firebase.ts`

Example config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
}
```

## 5. Set up Firestore Collections

The app will automatically create collections when users interact with it, but here's the structure:

### Collections:

#### `users`
- Document ID: User UID
- Fields:
  - `uid`: string
  - `email`: string
  - `name`: string
  - `role`: "student" | "admin"
  - `bio`: string (optional)
  - `university`: string (optional)
  - `year`: string (optional)
  - `major`: string (optional)
  - `preferences`: object
  - `createdAt`: timestamp
  - `lastLogin`: timestamp

#### `assessments`
- Document ID: Auto-generated
- Fields:
  - `userId`: string
  - `answers`: object
  - `scores`: object
  - `recommendation`: object
  - `createdAt`: timestamp

#### `supportGroups`
- Document ID: Auto-generated
- Fields:
  - `name`: string
  - `description`: string
  - `members`: array of user IDs
  - `createdBy`: string (user ID)
  - `createdAt`: timestamp

#### `resources`
- Document ID: Auto-generated
- Fields:
  - `title`: string
  - `description`: string
  - `content`: string
  - `category`: string
  - `type`: "article" | "video" | "tool"
  - `createdAt`: timestamp

## 6. Create Admin User

To create an admin user:

1. First, create a regular student account through the app
2. Go to Firestore Console
3. Find the user document in the `users` collection
4. Change the `role` field from "student" to "admin"
5. The user can now access the admin dashboard

## 7. Security Rules (Optional)

For production, update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can read/write their own assessments
    match /assessments/{document} {
      allow read, write: if request.auth != null && resource.data.userId == request.auth.uid;
    }
    
    // Anyone can read resources
    match /resources/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";
    }
    
    // Support groups
    match /supportGroups/{document} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

## 8. Testing

1. Start the development server: `npm run dev`
2. Try creating a student account
3. Complete an assessment
4. Create an admin account (follow step 6)
5. Test admin dashboard functionality

## Features Implemented

### Authentication System
- ✅ Separate student and admin login pages
- ✅ Role-based routing and access control
- ✅ Firebase Authentication integration
- ✅ Automatic user document creation

### Student Features
- ✅ Attractive, animated dashboard
- ✅ Interactive mental health assessment with Firebase saving
- ✅ Profile management with preferences
- ✅ Assessment history tracking
- ✅ Responsive design

### Admin Features
- ✅ Professional admin dashboard
- ✅ User management interface
- ✅ Platform analytics
- ✅ Settings management
- ✅ Tabbed interface for different functions

### Visual Enhancements
- ✅ Framer Motion animations
- ✅ Custom CSS animations
- ✅ Loading spinners
- ✅ Gradient backgrounds
- ✅ Interactive hover effects
- ✅ Responsive design

### Firebase Integration
- ✅ User profile management
- ✅ Assessment result storage
- ✅ Real-time data updates
- ✅ Service functions for all operations

## Next Steps for Full Production

1. **Add more content**: Populate resources, support groups, crisis information
2. **Email notifications**: Integrate with services like SendGrid
3. **Push notifications**: Add service worker for browser notifications
4. **Advanced analytics**: Add charts and data visualization
5. **Mobile app**: Consider React Native version
6. **Content moderation**: Add admin tools for managing user content
7. **Backup and monitoring**: Set up proper Firebase monitoring
8. **Performance optimization**: Add caching and lazy loading

The website is now fully functional with a modern, attractive interface and comprehensive Firebase backend integration!