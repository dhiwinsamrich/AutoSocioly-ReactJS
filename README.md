# AutoSocioly Frontend

A modern React-based frontend for the AutoSocioly social media automation platform. Built with Vite, TypeScript, and shadcn/ui components for AI-powered social media content generation and management.

## 🌟 Features

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: shadcn/ui components for consistent design
- **Dark Mode**: Built-in dark/light theme support with next-themes
- **Accessibility**: WCAG compliant with keyboard navigation
- **Animations**: Smooth transitions and micro-interactions with Tailwind CSS Animate
- **Glassmorphism**: Modern glass card design components

### 📱 Pages & Features
- **Dashboard**: Overview of social media performance and analytics with Recharts
- **Content Creation**: AI-powered content generation interface with voice input
- **Account Management**: Connect and manage social media accounts (Facebook, Instagram, LinkedIn, Pinterest, Reddit, X/Twitter)
- **Content Review**: Preview and edit generated content before posting
- **Success Tracking**: Monitor posting status and results with real-time updates
- **Activity Tracking**: Background activity monitoring and notifications

### 🔧 Technical Features
- **TypeScript**: Full type safety and better developer experience
- **React Router**: Client-side routing with protected routes and page transitions
- **State Management**: Zustand for global state management with persistence
- **API Integration**: RESTful API communication with React Query for caching
- **Form Handling**: React Hook Form with Zod validation and error handling
- **Toast Notifications**: Sonner toast system with custom notifications
- **Voice Input**: Web Speech API integration for voice-to-text content creation
- **Real-time Updates**: WebSocket-like activity tracking and notifications
- **Responsive Design**: Mobile-first with custom hooks for mobile detection

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- npm, yarn, or pnpm package manager
- Backend API running (see backend README)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Social-Media-Automation/frontend
   ```

2. **Install dependencies:**
   ```bash
   # Using npm
   npm install
   
   # Using yarn
   yarn install
   
   # Using pnpm
   pnpm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit .env.local with your configuration
   VITE_API_URL=http://localhost:8000
   VITE_APP_NAME=AutoSocioly
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser:**
   Navigate to `http://localhost:5173`

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run build:dev    # Build for development
npm run preview      # Preview production build locally
npm run lint         # Run ESLint for code quality

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
npm audit            # Check for security vulnerabilities
```

### Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── ContentCreationForm.tsx
│   │   ├── Dashboard.tsx
│   │   ├── EditModal.tsx
│   │   ├── GeneratingLoader.tsx
│   │   ├── GlassCard.tsx
│   │   ├── InitialAppLoader.tsx
│   │   ├── Navigation.tsx
│   │   ├── NotificationToast.tsx
│   │   ├── PageLoader.tsx
│   │   └── PageTransition.tsx
│   ├── config/           # Configuration files
│   │   └── network.ts
│   ├── hooks/            # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   ├── use-toast.ts
│   │   ├── useNotification.ts
│   │   └── usePageTransition.ts
│   ├── lib/              # Utility libraries
│   │   └── utils.ts
│   ├── pages/            # Page components
│   │   ├── Accounts.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Error.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   ├── ReviewContent.tsx
│   │   └── Success.tsx
│   ├── services/         # API services
│   │   └── api.ts
│   ├── types/            # TypeScript type definitions
│   │   └── post.ts
│   ├── App.css           # Global styles
│   ├── App.tsx           # Main App component
│   ├── index.css         # Tailwind CSS imports
│   ├── main.tsx          # Application entry point
│   └── vite-env.d.ts     # Vite type definitions
├── dist/                 # Production build output
├── node_modules/         # Dependencies
├── .env.example          # Environment variables template
├── components.json       # shadcn/ui configuration
├── eslint.config.js      # ESLint configuration
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── postcss.config.js     # PostCSS configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
├── tsconfig.app.json     # TypeScript app configuration
├── tsconfig.node.json    # TypeScript node configuration
└── vite.config.ts        # Vite configuration
```

### Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5 with SWC for fast compilation
- **Styling**: Tailwind CSS 3 with custom design system
- **UI Components**: shadcn/ui (Radix UI + Tailwind) with 50+ components
- **Routing**: React Router DOM 6 with page transitions
- **State Management**: Zustand 5 with persistence
- **Data Fetching**: TanStack React Query 5 for server state
- **Forms**: React Hook Form + Zod validation with custom resolvers
- **HTTP Client**: Fetch API with custom service layer and error handling
- **Icons**: Lucide React with FontAwesome integration
- **Charts**: Recharts for analytics and data visualization
- **Animations**: Tailwind CSS Animate with custom transitions
- **Voice**: Web Speech API with custom voice input component
- **Notifications**: Sonner toast system with custom styling
- **Development**: ESLint, TypeScript, Hot Module Replacement, Lovable Tagger

## 🎨 UI Components

### shadcn/ui Integration
This project uses shadcn/ui components built on top of Radix UI primitives and styled with Tailwind CSS.

**Available Components:**
- Accordion, Alert Dialog, Aspect Ratio, Avatar
- Button, Card, Checkbox, Collapsible
- Dialog, Dropdown Menu, Hover Card, Label
- Navigation Menu, Popover, Progress, Radio Group
- Scroll Area, Select, Separator, Slider
- Switch, Tabs, Toast, Toggle, Tooltip

**Adding New Components:**
```bash
# Install a new shadcn/ui component
npx shadcn-ui@latest add [component-name]

# Example: Add a new button variant
npx shadcn-ui@latest add button
```

### Custom Components
- **GlassCard**: Glassmorphism card component with modern styling
- **ContentCreationForm**: AI content generation form with voice input
- **VoiceInput**: Web Speech API integration for voice-to-text
- **ApiKeyChangeModal**: Modal for updating API keys and settings
- **BackgroundActivityPopup**: Real-time activity monitoring popup
- **ActivityDemo**: Demo component for showcasing activity tracking
- **EditModal**: Modal for editing generated content
- **InitialAppLoader**: App initialization loading component
- **Navigation**: Main navigation with responsive design
- **NotificationToast**: Toast notification system with Sonner
- **PageLoader**: Page loading states and transitions
- **PageTransition**: Smooth page transitions with animations

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:8000          # Backend API URL
VITE_API_TIMEOUT=30000                      # API request timeout (ms)

# Application Configuration
VITE_APP_NAME=AutoSocioly                   # Application name
VITE_APP_VERSION=1.0.0                      # Application version
VITE_APP_DESCRIPTION=AI-Powered Social Media Automation

# Feature Flags
VITE_ENABLE_ANALYTICS=true                  # Enable analytics tracking
VITE_ENABLE_DEBUG=false                     # Enable debug mode
VITE_ENABLE_MOCK_API=false                 # Use mock API for development

# External Services
VITE_GEMINI_API_KEY=your_gemini_key         # Google Gemini API key
VITE_GETLATE_API_KEY=your_getlate_key       # GetLate API key

# UI Configuration
VITE_DEFAULT_THEME=dark                     # Default theme (dark/light)
VITE_ANIMATION_DURATION=300                 # Animation duration (ms)
VITE_TOAST_DURATION=5000                    # Toast notification duration (ms)
```

### Tailwind CSS Configuration

The project uses Tailwind CSS with custom configuration:

```typescript
// tailwind.config.ts
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        primary: 'hsl(var(--primary))',
        secondary: 'hsl(var(--secondary))',
        // ... more custom colors
      },
      animation: {
        // Custom animations
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
```

## 🚀 Building for Production

### Build Process

```bash
# Build for production
npm run build

# Build for development
npm run build:dev

# Preview production build
npm run preview
```

### Build Output

The build process creates optimized static files in the `dist/` directory:

```
dist/
├── assets/
│   ├── index-[hash].js      # Main JavaScript bundle
│   ├── index-[hash].css     # Main CSS bundle
│   └── [asset]-[hash].[ext] # Other assets
├── favicon.ico
├── index.html
├── placeholder.svg
└── robots.txt
```

### Optimization Features

- **Code Splitting**: Automatic route-based code splitting
- **Tree Shaking**: Remove unused code from bundles
- **Minification**: JavaScript and CSS minification
- **Asset Optimization**: Image and font optimization
- **Gzip Compression**: Compressed assets for faster loading
- **Cache Busting**: Hash-based file naming for cache invalidation

## 🐳 Docker Support

### Dockerfile

```dockerfile
# Multi-stage build for production
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine as production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend
```

### Running with Docker

```bash
# Build and run
docker-compose up --build

# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Production build
docker-compose -f docker-compose.prod.yml up
```

## 🧪 Testing

### Testing Setup

```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Test Structure

```
src/
├── __tests__/           # Test files
│   ├── components/      # Component tests
│   ├── pages/          # Page tests
│   ├── services/       # Service tests
│   └── utils/          # Utility tests
├── test-utils/         # Testing utilities
└── setupTests.ts       # Test setup configuration
```

## 📊 Performance

### Performance Optimization

- **Lazy Loading**: Route-based code splitting
- **Image Optimization**: WebP format with fallbacks
- **Bundle Analysis**: Webpack Bundle Analyzer integration
- **Caching**: Service worker for offline support
- **CDN Ready**: Static asset optimization for CDN deployment

### Performance Monitoring

```bash
# Analyze bundle size
npm run analyze

# Lighthouse audit
npm run lighthouse

# Performance profiling
npm run profile
```

## 🔒 Security

### Security Features

- **Content Security Policy**: CSP headers for XSS protection
- **HTTPS Only**: Secure cookie and API communication
- **Input Validation**: Zod schema validation for all inputs
- **XSS Protection**: Sanitized user inputs and outputs
- **CSRF Protection**: Cross-site request forgery prevention

### Security Headers

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    }
  }
})
```

## 🚀 Deployment

### Deployment Options

#### 1. Static Hosting (Recommended)
- **Vercel**: Zero-config deployment
- **Netlify**: Git-based deployment with forms
- **GitHub Pages**: Free hosting for public repos
- **AWS S3 + CloudFront**: Scalable static hosting

#### 2. Container Deployment
- **Docker**: Containerized deployment
- **Kubernetes**: Orchestrated container deployment
- **Docker Swarm**: Simple container orchestration

#### 3. Traditional Hosting
- **Nginx**: Reverse proxy with static file serving
- **Apache**: Web server with mod_rewrite
- **CDN**: Content delivery network integration

### Deployment Scripts

```bash
# Deploy to Vercel
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify

# Deploy to AWS S3
npm run deploy:aws

# Build and deploy with Docker
npm run deploy:docker
```

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow the coding standards
4. **Run tests**: `npm run test`
5. **Run linting**: `npm run lint`
6. **Commit changes**: `git commit -m 'Add amazing feature'`
7. **Push to branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Coding Standards

- **TypeScript**: Use strict type checking
- **ESLint**: Follow the configured ESLint rules
- **Prettier**: Use consistent code formatting
- **Conventional Commits**: Use conventional commit messages
- **Component Structure**: Follow the established component patterns

### Code Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Manual Review**: At least one team member reviews the code
3. **Testing**: All new features must have tests
4. **Documentation**: Update documentation for new features

## 📚 Documentation

### Additional Resources

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

### API Documentation

- [Backend API Documentation](../backend/README.md#api-endpoints)
- [API Service Layer](./src/services/api.ts)
- [Type Definitions](./src/types/post.ts)

## 🆘 Support

### Getting Help

- **GitHub Issues**: [Report bugs and request features](https://github.com/your-username/AutoSocioly/issues)
- **Discussions**: [Community discussions](https://github.com/your-username/AutoSocioly/discussions)
- **Documentation**: Check this README and inline code comments

### Common Issues

#### Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version
node --version  # Should be 18+
```

#### API Connection Issues
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify environment variables
echo $VITE_API_URL
```

#### TypeScript Issues
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update type definitions
npm run type-check
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**AutoSocioly Frontend** - Modern React frontend for AI-powered social media automation.