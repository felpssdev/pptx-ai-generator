# pptx-ai-generator 🚀

> AI-powered presentation generator using Next.js 16, Gemini AI, and pptxgenjs

Create professional, visually stunning presentations in seconds. Just describe your idea and let AI handle the design, content, and speaker notes.

## ✨ Features

- **AI-Powered Generation**: Describe your presentation and get professional slides with curated content
- **Brand Customization**: Upload your logo and automatically extract colors for brand-consistent presentations
- **Speaker Notes**: Natural, conversational speaker notes with timing and presentation tips
- **Multiple Templates**: Choose from Professional, Modern, or Minimal designs
- **Fullscreen Presentation Mode**: Present directly in browser with speaker notes and timer
- **PPTX Export**: Download fully editable PowerPoint files
- **Image Generation**: AI-powered relevant image suggestions via Unsplash
- **Type-Safe**: Built with TypeScript strict mode

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React, TypeScript
- **Styling**: Tailwind CSS with design system
- **State**: Zustand with persistence
- **Animations**: Framer Motion
- **AI**: Google Gemini 1.5 Flash
- **Export**: pptxgenjs for PPTX generation
- **Image Processing**: Sharp
- **Validation**: Zod
- **Icons**: Lucide React
- **UI Notifications**: Sonner

## 📋 Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Google Gemini API key ([get one here](https://aistudio.google.com))
- Unsplash API key (optional, for image generation - [get here](https://unsplash.com/developers))

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pptx-ai-generator.git
cd pptx-ai-generator
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Setup environment variables

Copy `.env.example` to `.env.local` and fill in your API keys:

```bash
cp .env.example .env.local
```

```env
# .env.local
GEMINI_API_KEY=your_gemini_api_key_here
UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

### 4. Run development server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Usage

### Create a Presentation

1. Go to the landing page
2. Enter your presentation topic (e.g., "AI trends for 2024")
3. Click "Generate" and watch slides appear in real-time
4. Customize with your brand kit and template
5. Download as PPTX or present fullscreen

### Brand Kit Customization

1. Upload your logo in the preview page
2. AI automatically extracts colors
3. Choose from Professional, Modern, or Minimal templates
4. Colors automatically apply to all slides

### Present Fullscreen

1. Click "Presentation Mode" from preview
2. Use keyboard shortcuts:
   - `→` / `Space`: Next slide
   - `←`: Previous slide
   - `Esc`: Exit
3. View speaker notes on the right
4. Monitor time remaining with countdown timer

## 📁 Project Structure

```
app/
├── page.tsx                 # Landing page
├── create/
│   └── page.tsx            # Generation page
├── preview/[id]/
│   └── page.tsx            # Preview & customization
├── present/[id]/
│   └── page.tsx            # Presentation mode
└── api/
    ├── presentations/
    │   └── stream/         # Streaming generation
    │   └── export/         # PPTX export
    ├── brand-kit/
    │   ├── upload/         # Logo upload
    │   └── extract-colors/ # Color extraction
    └── images/
        └── generate/       # Image search

lib/
├── ai/
│   └── gemini/            # Gemini client & prompts
├── pptx/                  # PPTX generation
├── templates/             # Presentation templates
├── store/                 # Zustand stores
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definitions
└── utils/                 # Utility functions

components/
├── ui/                    # Base UI components
├── presentation/          # Presentation components
├── brand-kit/            # Brand customization
└── generation/           # Generation components
```

## 🎨 Design System

### Colors

- **Primary**: Brand color (blue-500 by default)
- **Neutral**: Professional grayscale
- **Accent**: Secondary highlight color

### Typography

- **Display**: Large headings
- **Body**: Regular text
- **Caption**: Small labels

### Components

All components use TypeScript strict mode and support:
- Multiple size variants
- Disabled/loading states
- Full keyboard accessibility
- ARIA labels and descriptions

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `→` / `Space` | Next slide |
| `←` | Previous slide |
| `Esc` | Exit presentation mode |
| `Enter` | Generate presentation (from landing) |

## ♿ Accessibility

- Full keyboard navigation support
- ARIA labels on all interactive elements
- Semantic HTML structure
- Color contrast ratios meet WCAG AA standards
- Focus indicators on all buttons
- Screen reader friendly

## 📊 Performance

- **Lighthouse Score**: >90 (target)
- **First Contentful Paint**: <1s
- **Largest Contentful Paint**: <2s
- **Cumulative Layout Shift**: <0.1
- **Time to Interactive**: <2s

### Optimizations

- Image lazy loading
- Code splitting with dynamic imports
- Memoization of expensive components
- Streaming responses for large data
- CSS-in-JS optimizations with Tailwind

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel
```

Follow prompts and set environment variables in Vercel dashboard.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t pptx-ai .
docker run -p 3000:3000 -e GEMINI_API_KEY=xxx pptx-ai
```

### Environment Variables

Set these in your hosting platform:

- `GEMINI_API_KEY` - Google Gemini API key
- `UNSPLASH_ACCESS_KEY` - Unsplash API key (optional)

## 📝 API Routes

### POST `/api/presentations/stream`

Stream slide generation in real-time.

**Request:**
```json
{
  "prompt": "AI trends for 2024",
  "numSlides": 10
}
```

**Response:** Server-Sent Events (SSE) stream

### POST `/api/presentations/export`

Export presentation to PPTX format.

**Request:**
```json
{
  "slides": [...],
  "brandKit": {...},
  "template": {...},
  "presentationTitle": "My Presentation"
}
```

**Response:** PPTX file (binary)

### POST `/api/brand-kit/upload`

Upload and optimize logo.

**Response:**
```json
{
  "success": true,
  "logo": "base64_encoded_image"
}
```

### POST `/api/brand-kit/extract-colors`

Extract brand colors from logo.

**Request:**
```json
{
  "logoBase64": "data:image/png;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "colors": {
    "primary": "#0066ff",
    "secondary": "#00ccff",
    "accent": "#ff6600",
    "background": "#ffffff",
    "text": "#000000"
  }
}
```

### POST `/api/images/generate`

Generate relevant images for slides.

**Request:**
```json
{
  "prompt": "Team meeting in modern office"
}
```

**Response:**
```json
{
  "url": "https://images.unsplash.com/...",
  "alt": "Team in meeting room"
}
```

## 🧪 Testing

```bash
# Run linting
npm run lint

# Check TypeScript
npm run type-check

# Build for production
npm run build

# Start production server
npm run start
```

## 📦 Dependencies

See `package.json` for full list. Key packages:

- `next@16.x` - React framework
- `@google/generative-ai@0.x` - Gemini API
- `pptxgenjs@3.x` - PowerPoint generation
- `zustand@4.x` - State management
- `framer-motion@10.x` - Animations
- `tailwindcss@3.x` - Styling
- `zod@3.x` - Validation

## 🐛 Troubleshooting

### "GEMINI_API_KEY not found"
- Ensure `.env.local` has `GEMINI_API_KEY=your_key`
- Restart dev server after adding env variables

### "Failed to generate PPTX"
- Check that all slides have required fields
- Verify image URLs are accessible
- Check server logs for detailed errors

### "Streaming times out"
- Increase `maxDuration` in API route (currently 60s)
- Check Gemini API rate limits
- Verify network connectivity

### "Images not loading"
- Unsplash API key might be invalid
- Check Unsplash quota/rate limits
- Images fall back gracefully to placeholder

## 📞 Support

- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/pptx-ai-generator/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/pptx-ai-generator/discussions)

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini](https://ai.google.dev/) - AI engine
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations
- [Unsplash](https://unsplash.com/) - Free images

## 🚀 Roadmap

- [ ] User authentication
- [ ] Presentation history & library
- [ ] Collaboration features
- [ ] Custom brand kit templates
- [ ] Video integration
- [ ] Analytics dashboard
- [ ] API for third-party integrations
- [ ] Mobile app (React Native)

---

**Happy Creating! 🎉**

Built with ❤️ by the pptx-ai team
