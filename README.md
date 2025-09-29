# Classroom Copilot

An AI-powered lesson planning and creation platform that helps teachers generate comprehensive, standards-aligned lesson materials with real-time AI assistance.

## ✨ Features

### 🚀 AI-Powered Lesson Generation
- **5-Second Lesson Creation**: Fast, engaging lesson generation with streaming AI reasoning
- **Multi-Modal Content**: Automatic creation of text, slides, video, and audio lesson formats
- **Standards Alignment**: CCSS-aligned content generation for Grade 8 Mathematics
- **Student Differentiation**: Tailored content based on student mastery levels

### 🎯 Interactive Lesson Builder
- **Real-Time AI Assistance**: Chat-based refinement and iteration of lesson content
- **Section-Level Editing**: Granular control over individual lesson components
- **Live/Draft Management**: Seamless transition between draft and live lesson states
- **Professional UI**: Clean, modern interface with skeleton loading and smooth transitions

### 🎨 User Experience
- **Streaming AI Reasoning**: Watch AI think through lesson creation in real-time
- **Responsive Design**: Optimized for desktop and tablet use
- **Modal-Based Editing**: Immersive lesson editing experience
- **Smart Suggestions**: AI-powered lesson suggestions based on student needs

## 🛠️ Technology Stack

- **Framework**: Next.js 15.5.4 with Turbopack
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library with shadcn/ui
- **State Management**: React hooks and context
- **Build Tool**: Turbopack for fast development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/classroom-copilot.git
cd classroom-copilot
```

2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Development

The main application code is in `src/app/page.tsx`. The page auto-updates as you edit the file.

## 📋 Usage

### Creating a New Lesson
1. Enter your lesson prompt in the main text area
2. Select student audience (All students, specific mastery bands, or individual students)  
3. Choose standards alignment (Auto or specific CCSS standards)
4. Click "Generate Lesson" to create your lesson in 5 seconds

### AI-Powered Generation Flow
1. **User Prompt**: Your lesson requirements appear instantly
2. **AI Reasoning**: Watch AI analyze and plan your lesson (2 seconds)
3. **Content Creation**: Lesson materials generate with skeleton loading
4. **Confirmation**: AI confirms successful lesson creation

### Lesson Refinement
- Use "Refine with AI" on any lesson section
- Chat with AI for specific improvements
- Real-time reasoning shows AI's thought process
- Undo/redo support for all changes

### Managing Lessons
- **Draft Mode**: Work on lessons privately before publishing
- **Live Mode**: Share lessons with students immediately  
- **AI Suggestions**: Get recommendations for follow-up lessons
- **Standards Tracking**: Automatic alignment with curriculum standards

## 🎯 Key Components

### Lesson Builder
- Multi-tab interface (Text, Slides, Video, Audio)
- Section-by-section content generation
- Real-time AI assistance panel
- Professional skeleton loading states

### AI Assistant
- Streaming reasoning display
- Context-aware suggestions
- Section-specific refinements
- Natural language interaction

### Lesson Management
- Card-based lesson overview
- Live/Draft status management
- Standards and efficacy tracking
- Student assignment features

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Main application component
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles
│   └── favicon.ico       # App icon
├── components/
│   └── ui/               # Reusable UI components
└── lib/
    └── utils.ts          # Utility functions
```

## 🔧 Configuration

### Tailwind CSS
The project uses Tailwind CSS for styling with custom configurations in `tailwind.config.js`.

### TypeScript
Fully typed with TypeScript configurations in `tsconfig.json`.

### Next.js
Configured for optimal development experience with Turbopack in `next.config.ts`.

## 📚 Learn More

### Next.js Resources
- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial
- [Next.js GitHub repository](https://github.com/vercel/next.js)

### Deployment
The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📝 Recent Updates

See [CHANGELOG.md](./CHANGELOG.md) for detailed information about recent improvements including:
- 5-second lesson generation flow
- Streaming AI reasoning
- Enhanced UI/UX improvements
- Bug fixes and performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Built with ❤️ for educators who want to create amazing learning experiences.