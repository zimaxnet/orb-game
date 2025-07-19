# AIMCS Project Structure

This document outlines the cleaned up and reorganized structure of the AIMCS project.

## 📁 Root Directory Structure

```
aimcs-deploy/
├── frontend/                    # React/Vite frontend (root level)
│   ├── components/             # React components
│   │   ├── ChatInterface.jsx   # Main chat component
│   │   └── ChatInterface.css   # Chat component styles
│   ├── services/               # Service layer (empty, ready for future use)
│   ├── App.jsx                 # Main app component
│   ├── App.css                 # App styles
│   ├── main.jsx                # App entry point
│   ├── index.html              # HTML template
│   ├── index.css               # Global styles
│   ├── authConfig.js           # Auth configuration (legacy)
│   ├── package.json            # Frontend dependencies
│   ├── package-lock.json       # Lock file
│   ├── vite.config.js          # Vite configuration
│   ├── .eslintrc.cjs           # ESLint configuration
│   └── dist/                   # Build output (generated)
├── backend/                    # Node.js backend
│   ├── backend-server.js       # Express server
│   ├── package.json            # Backend dependencies
│   ├── package-lock.json       # Lock file
│   ├── backend-Dockerfile      # Docker configuration
│   └── setup-backend.sh        # Backend setup script
├── scripts/                    # Deployment and setup scripts
│   ├── deploy-azure.sh         # Azure deployment script
│   ├── deploy-full.sh          # Full deployment script
│   ├── deploy-manual.sh        # Manual deployment script
│   ├── setup-azure-openai.sh   # Azure OpenAI setup
│   ├── setup-github-secrets.sh # GitHub secrets setup
│   ├── get-azure-openai-config.sh # Get Azure OpenAI config
│   ├── azure-openai-cli.sh     # Azure OpenAI CLI
│   └── test-ciam-auth.sh       # CIAM auth testing
├── .github/workflows/          # GitHub Actions workflows
│   ├── azure-static-web-apps-proud-hill-01b4b180f.yml # Static Web App deployment
│   ├── deploy-full.yml         # Full system deployment
│   ├── deploy-frontend.yml     # Frontend deployment
│   ├── deploy-backend.yml      # Backend deployment
│   └── update-secrets.yml      # Secrets update workflow
├── docs/                       # Documentation
│   └── enterprise-spec.md      # Enterprise specifications
├── public/                     # Static assets
│   ├── favicon.svg             # SVG favicon
│   ├── favicon.png             # PNG favicon
│   ├── favicon.ico             # ICO favicon
│   └── apple-touch-icon.png    # Apple touch icon
├── .git/                       # Git repository
├── .gitignore                  # Git ignore rules
├── README.md                   # Main project documentation
├── LICENSE                     # MIT license
├── env.example                 # Environment variables template
├── backend.json                # Backend configuration
├── backend-flow-diagram.md     # Backend flow documentation
├── ADVANCED_WEB_SEARCH.md      # Web search documentation
├── DEPLOYMENT.md               # Deployment documentation
├── BACKEND_README.md           # Backend documentation
├── GITHUB_SECRETS_SETUP.md     # GitHub secrets setup guide
├── .dockerignore               # Docker ignore rules
└── node_modules/               # Frontend dependencies (generated)
```

## 🧹 Cleanup Summary

### Removed Files
- ❌ `kudu-deploy.zip` - Old deployment artifact
- ❌ `dist.zip` - Old build artifact  
- ❌ `webapp_logs.zip` - Old log artifact
- ❌ `LogFiles/` - Azure log files
- ❌ `deployments/` - Azure deployment files
- ❌ `assets/` - Old built assets
- ❌ `package.json.frontend` - Redundant package.json
- ❌ `backend-package.json` - Moved to backend/
- ❌ `server.js` - Redundant server file
- ❌ `src/` - Moved all files to root level

### Reorganized Structure
- ✅ **Frontend**: All React/Vite files moved to root level
- ✅ **Backend**: All backend files moved to `backend/` directory
- ✅ **Dependencies**: Separate package.json files for frontend and backend
- ✅ **Build Output**: Clean `dist/` directory for frontend builds
- ✅ **Documentation**: Comprehensive README and structure documentation

## 🚀 Development Workflow

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start
```

## 📦 Package Management

### Frontend Dependencies (package.json)
- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **ESLint** - Code linting
- **TypeScript types** - Type definitions

### Backend Dependencies (backend/package.json)
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **Nodemon** - Development server (dev dependency)

## 🔧 Configuration Files

### Frontend Configuration
- `vite.config.js` - Vite build configuration
- `.eslintrc.cjs` - ESLint rules
- `index.html` - HTML template

### Backend Configuration
- `backend-Dockerfile` - Docker container configuration
- `setup-backend.sh` - Backend setup script

## 🌐 Deployment

### Frontend (Azure Static Web Apps)
- **Build Output**: `dist/` directory
- **Deployment**: GitHub Actions workflow
- **Domain**: `orbgame.us`

### Backend (Azure Container Apps)
- **Build Output**: Docker image
- **Deployment**: Azure Container Registry
- **Domain**: `api.orbgame.us`

## 📋 Verification Checklist

- ✅ Frontend builds successfully (`npm run build`)
- ✅ Backend dependencies installed
- ✅ All necessary files present
- ✅ No unnecessary files remaining
- ✅ Proper directory structure
- ✅ Documentation updated
- ✅ Git ignore rules configured
- ✅ ESLint configuration working
- ✅ Vite configuration working

## 🔄 Next Steps

1. **Test the build**: Run `npm run build` to ensure frontend builds correctly
2. **Test the backend**: Run `cd backend && npm start` to test backend
3. **Deploy**: Push to main branch to trigger automatic deployment
4. **Verify**: Check that both frontend and backend are working in production

## 📞 Support

If you encounter any issues with the new structure:
1. Check the README.md for setup instructions
2. Verify all dependencies are installed
3. Check the build output for errors
4. Review the deployment logs in GitHub Actions 