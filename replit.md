# Overview

This is a full-stack web application for content analysis and chat interaction. The application allows users to add various data sources (like YouTube videos, web pages, PDFs) which are processed to extract content, and then provides an AI-powered chat interface to ask questions about the extracted content. It's built as a modern web application with a React frontend and Express backend.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Radix UI primitives with shadcn/ui component library for a consistent design system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management and API caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development**: tsx for TypeScript execution in development
- **Build**: esbuild for production bundling
- **API Design**: RESTful API with JSON responses
- **Error Handling**: Centralized error middleware with structured error responses

## Data Layer
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Storage Strategy**: In-memory storage fallback (MemStorage) for development/testing
- **Data Models**: Sources (URL, title, content, status) and Messages (content, role, source references)

## Content Processing Pipeline
- **Content Extraction**: Dedicated ContentExtractor service for processing various URL types
- **YouTube Support**: Video transcript extraction using yt-dlp
- **Web Content**: General webpage content extraction
- **Async Processing**: Background content extraction with status tracking (processing → ready/error)

## AI Integration
- **AI Service**: OpenAI GPT integration for chat functionality
- **Model**: Uses GPT-5 (as specified in the codebase)
- **Context Building**: Combines user sources with conversation history
- **Response Generation**: Contextual responses referencing specific sources

## Development Tools
- **Component System**: shadcn/ui configuration with path aliases
- **Code Quality**: TypeScript strict mode with comprehensive type checking
- **Build Pipeline**: Separate client/server build processes
- **Development Experience**: Hot reload with Vite, runtime error overlay

## Deployment Architecture
- **Monorepo Structure**: Single repository with client, server, and shared code
- **Shared Types**: Common TypeScript types and schemas shared between frontend and backend
- **Environment Variables**: DATABASE_URL and OPENAI_API_KEY required for operation
- **Static Assets**: Vite handles client-side asset bundling and optimization

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL database hosting
- **Connection**: Uses connection pooling with @neondatabase/serverless driver

## AI Services
- **OpenAI API**: GPT-5 model for chat completions and content analysis
- **Authentication**: Requires OPENAI_API_KEY environment variable

## Content Extraction Tools
- **yt-dlp**: Command-line tool for YouTube video transcript extraction
- **System Dependencies**: Requires yt-dlp to be installed on the system for YouTube processing

## Development Services
- **Replit Integration**: Development environment with cartographer plugin and error modal
- **Vite Plugins**: React plugin, runtime error overlay for development experience

## UI Component Libraries
- **Radix UI**: Comprehensive set of accessible React components
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for interactive content display

## Utility Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management with validation
- **Zod**: Runtime type validation and schema parsing
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Utility for conditional CSS class composition