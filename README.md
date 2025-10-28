# PPTX AI Generator

A professional presentation generator powered by AI (Gemini), built with Next.js 16, TypeScript, and Tailwind CSS.

## 🚀 Features

- ✨ **Streaming generation** - Real-time presentation generation
- 🎨 **Automatic Brand Kit** - Smart color palette and style generation
- 🖼️ **AI Image Generation** - Unsplash integration for relevant images
- 📝 **Speaker Notes** - Detailed notes for presenters
- 🎥 **Presentation Mode** - Full-screen presentation view
- 📥 **PPTX Export** - Download presentations in PowerPoint format

## 📋 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS 4
- **AI**: Google Generative AI (Gemini)
- **State Management**: Zustand
- **PPTX Generation**: pptxgenjs
- **Image Processing**: Sharp
- **UI Components**: Lucide React
- **Animations**: Framer Motion
- **Notifications**: Sonner
- **Validation**: Zod

## 🛠️ Installation

### Prerequisites

- Node.js 20+ and npm

### Setup

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` from `.env.example`:
```bash
cp .env.example .env.local
```

4. Add your API keys:
   - `NEXT_PUBLIC_GEMINI_API_KEY`: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
   - `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`: Get from [Unsplash Developers](https://unsplash.com/developers)

## 📁 Project Structure

```
├── app/                          # Next.js app router
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── presentation/             # Presentation-specific components
│   ├── brand-kit/                # Brand kit components
│   └── generation/               # Generation workflow components
├── lib/
│   ├── ai/                       # Gemini AI integration
│   ├── pptx/                     # PPTX generation utilities
│   ├── hooks/                    # Custom React hooks
│   ├── store/                    # Zustand store
│   ├── utils/                    # Utility functions
│   └── types/                    # TypeScript types
├── config/                       # Configuration files
└── public/                       # Static assets
```

## 🚀 Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Build

```bash
npm run build
npm start
```

## 📝 Conventional Commits

This project uses conventional commits for clear commit history:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `build:` - Build or dependency changes
- `refactor:` - Code refactoring
- `style:` - Code style changes
- `chore:` - Maintenance tasks
- `ci:` - CI/CD configuration

## 📄 License

MIT
