# 🎉 MERN Time Capsule - Complete Application

A fully functional time capsule application with drag-and-drop media upload, built with the MERN stack.

## ✨ Features

### 🚀 **Drag-and-Drop Media Upload**
- Beautiful drag-and-drop interface
- Real-time file preview
- Support for images and videos
- File validation and error handling
- Progress tracking during upload
- Cloudinary integration for cloud storage

### 📱 **UI**
- Modern dark theme interface
- Responsive grid layout
- Smooth animations with Framer Motion
- Material-UI components
- Mobile-friendly design

### ⏰ **Time Capsule Features**
- Create capsules with future unlock dates
- Automatic unlocking when date arrives
- Public and private capsules
- Rich metadata (tags, descriptions)
- Memory management

## 🛠️ Technology Stack

### Frontend
- **React 19** - Latest React with hooks
- **Material-UI** - Modern component library
- **Framer Motion** - Smooth animations
- **React Dropzone** - Drag-and-drop file uploads
- **Axios** - HTTP client
- **Vite** - Fast development server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **Cloudinary** - Media storage
- **JWT** - Authentication
- **Multer** - File upload handling

## 🚀 Quick Start

### 1. Install Dependencies
```bash
# Install all dependencies at once
npm run install-all

# Or install separately
cd server && npm install
cd ../client && npm install
```

### 2. Environment Setup (Optional)
```bash
cd server
cp .env.example .env
# Edit .env with your credentials (app works with mock data by default)
```
#### .env.example:

```
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
DB_USER=your_db_user
DB_PASSWORD=your_db_password
MONGODB_URI= mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<databaseName>?retryWrites=true&w=majority&appName=<optionalAppName>
# JWT Secret (Change this to a secure random string in production)
JWT_SECRET=a_very_long_and_random_string_for_jwt_secret

# Cloudinary Configuration
CLOUDINARY_URL=cloudinary://your_cloudinary_api_key:your_cloudinary_api_secret@your_cloudinary_cloud_name
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# CORS Origins
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/webm 
```

### 3. Start the Application
```bash
# Start both servers
npm run dev

# Or start separately:
# Terminal 1: npm run server
# Terminal 2: npm run client
```

### 4. Access the App
- **Frontend**: http://localhost:5176
- **Backend**: http://localhost:5001
- **API Health**: http://localhost:5001/health

## 🎯 Key Features Working

✅ **Drag-and-Drop Upload**: Multi-file selection with preview
✅ **Capsule Creation**: Instagram-style creation flow
✅ **Media Management**: Cloud storage integration
✅ **Time-Based Unlocking**: Automatic capsule unlocking
✅ **Public Feed**: Explore public capsules
✅ **Mock Database**: Works without external dependencies
✅ **Responsive Design**: Mobile-friendly interface
✅ **Error Handling**: Graceful fallbacks

## 📱 How to Use

1. **Open the app** at http://localhost:5176
2. **Create a capsule** using the "Create New Capsule" button
3. **Drag and drop** your photos/videos
4. **Add details** like title, description, and unlock date
5. **Review and create** your time capsule
6. **Explore** public capsules from others

---

**The app is fully functional and ready to use! 🎉**
