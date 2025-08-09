# OnlinePanthi - Liquid Course Website Context

## Project Overview
OnlinePanthi is a community-driven learning platform built with modern web technologies. The platform offers structured courses with expert guidance, allowing users to learn without limits. The website features a liquid-themed design with glassmorphism effects and smooth animations.

## Technology Stack
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom animations
- **UI Components**: shadcn/ui components
- **Routing**: React Router DOM
- **State Management**: React Query (TanStack Query)
- **Form Handling**: React Hook Form with Zod validation
- **Icons**: Lucide React

## Key Features
1. **Responsive Design**: Mobile-first approach with responsive layouts
2. **Liquid Theme**: Custom liquid wave animations and glassmorphism effects
3. **Course Catalog**: Filterable and searchable course listings
4. **Community Features**: Dedicated community section
5. **User Dashboard**: Personalized learning dashboard
6. **Modern UI Components**: Custom components like LiquidButton, GlassCard, and Navbar

## Project Structure
```
liquid-course/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   ├── LiquidBackground.tsx
│   │   ├── LiquidButton.tsx
│   │   ├── GlassCard.tsx
│   │   └── Navbar.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Courses.tsx
│   │   ├── CourseViewing.tsx
│   │   ├── Community.tsx
│   │   ├── Dashboard.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   └── NotFound.tsx
│   ├── hooks/
│   ├── lib/
│   └── App.tsx
├── public/
└── index.html
```

## Design System
The website uses a custom color palette with ocean and teal tones:
- **Primary Color**: Ocean Blue (#1A4B8C)
- **Accent Color**: Teal (#00C9B1)
- **Glass Effects**: Custom glassmorphism utilities
- **Animations**: Liquid wave backgrounds, floating elements, and ripple effects

## Key Components
1. **LiquidBackground**: Creates animated liquid wave effects in the background
2. **LiquidButton**: Custom animated buttons with ripple effects
3. **GlassCard**: Cards with glassmorphism effects
4. **Navbar**: Responsive navigation with mobile menu

## Pages
1. **Home**: Hero section with features and statistics
2. **Courses**: Filterable course catalog with search functionality
3. **Course Viewing**: Individual course details (implementation pending)
4. **Community**: Community features (implementation pending)
5. **Dashboard**: User dashboard (implementation pending)
6. **About**: Company information
7. **Contact**: Contact form (implementation pending)
8. **NotFound**: 404 error page

## Custom Animations
- Liquid wave background animations
- Floating bubble effects
- Button ripple effects
- Hover animations for interactive elements
- Smooth transitions between states

## Routing
The application uses React Router DOM with the following routes:
- `/` - Home page
- `/courses` - Course catalog
- `/course/:id` - Individual course viewing
- `/community` - Community section
- `/dashboard` - User dashboard
- `/about` - About page
- `/contact` - Contact page
- `*` - NotFound page for undefined routes

## Development
- **Package Manager**: npm
- **Development Server**: `npm run dev`
- **Build**: `npm run build`
- **Linting**: ESLint with TypeScript support

## Deployment
The project is designed to be deployed through Lovable platform, with options for custom domain configuration.
