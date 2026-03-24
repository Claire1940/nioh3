# Shawarma Kiosk Hub

**🌐 Official Website:** [https://shawarmakiosk.com](https://shawarmakiosk.com)

Your ultimate guide for Shawarma Kiosk - the popular Roblox horror night-shift game. Get survival guides, anomaly databases, event fixes, endings, and essential tools to enhance your gameplay experience.

## 🌟 About This Website

Shawarma Kiosk Hub is a comprehensive resource platform designed to help players survive their night shifts at Shawarma 24. We provide:

- **✅ Complete Anomaly Database**: All anomalies with threat levels and response protocols
- **🛠️ Interactive Tools**: Anomaly Radar, Serve-or-Shut Helper, Controls Finder
- **📊 Event Guides**: Flicker events, fog, knocking, and how to respond
- **🔗 Endings Guide**: All endings, routes, and failure points to avoid
- **📰 Survival Tips**: Fast, no-fluff guides for controls, customers, and the inspector
- **📚 Practical Resources**: Quick survival rules and strategy guides

## 🎮 Key Features

### 🔍 Anomaly Tracking System
- Visual threat × frequency board
- Instant response protocols
- Complete anomaly database
- Serve-or-shut decision helper

### 🛠️ Interactive Tools
- **Anomaly Radar**: Visual threat and frequency board for all anomalies
- **Serve-or-Shut Helper**: 10-second decision tool for customer encounters
- **Controls Finder**: PC controls, sprint keys, and movement tips

### 📰 Content Hub
- Anomalies database
- Event guides (flicker, fog, knocking)
- Endings and routes
- Controls and movement
- Customer behavior
- Inspector mechanics
- Download safety guide

### 🌍 Language Support
- 🇺🇸 **English** (Primary)

## 🚀 Technology Stack

This website is built with modern web technologies for optimal performance:

- **Framework**: Next.js 15.5.7 (App Router)
- **Rendering**: Static Site Generation (SSG)
- **Styling**: Tailwind CSS with custom Shawarma Kiosk theme
- **Internationalization**: next-intl for multilingual support
- **Content**: MDX for rich article content
- **Typography**: Geist Sans & Geist Mono fonts
- **Analytics**: Google Analytics, Microsoft Clarity, Ahrefs
- **Monetization**: Google AdSense
- **Deployment**: Vercel

## 📦 Project Structure

```
shawarma-kiosk/
├── public/
│   ├── data/             # JSON data (videos, reddit posts, anomalies)
│   │   ├── shawarma-anomalies.json
│   │   ├── shawarma-videos.json
│   │   └── shawarma-reddit.json
│   ├── images/           # Static images
│   │   ├── hero.webp     # Hero section image
│   │   └── backend.webp  # Background image
│   └── favicons...
├── src/
│   ├── app/              # Next.js app router pages
│   │   └── [locale]/     # Localized routes
│   │       ├── anomalies/ # Anomaly guides
│   │       ├── controls/  # Controls guide
│   │       ├── customers/ # Customer behavior
│   │       ├── events/    # Event guides
│   │       ├── endings/   # Endings guide
│   │       ├── inspector/ # Inspector guide
│   │       ├── download/  # Download safety
│   │       ├── guides/    # General guides
│   │       └── tools/     # Interactive tools
│   │           ├── anomaly-radar/
│   │           └── serve-or-shut/
│   ├── components/       # Reusable React components
│   │   ├── anomaly-radar/       # Anomaly tracking component
│   │   ├── serve-or-shut/       # Decision helper component
│   │   ├── Header.tsx           # Navigation header
│   │   ├── Footer.tsx           # Site footer
│   │   ├── CursorEffect.tsx     # Custom cursor effect
│   │   └── LanguageSwitcher.tsx # Language selector
│   ├── i18n/             # Internationalization config
│   ├── lib/              # Utility libraries
│   └── messages/         # Translation files
├── tools/                # Build scripts and utilities
└── scripts/              # Automation scripts
```

## 🛠️ Development

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shawarma-kiosk.git

# Navigate to project directory
cd shawarma-kiosk

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

The site will be available at `http://localhost:3000`

### Build for Production

```bash
# Run type checking and linting
npm run lint

# Create production build
npm run build

# Start production server
npm start
```

## 📝 Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Create production build
npm run start            # Start production server
npm run lint             # Run TypeScript type checking and ESLint
npm run format           # Format code with Biome
npm run convert:webp     # Convert images to WebP format
```

## 🎨 Design Philosophy

**Shawarma Kiosk Dark Theme**
- Primary: Golden (#F4B860)
- Secondary: Blue (#3B82F6)
- Background: Deep Purple (#080B14)
- Text: Light Gray (#EAF6F6)

The design focuses on:
- High contrast for readability
- Smooth animations and transitions
- Responsive layouts for all devices
- Accessible color combinations
- Interactive visual feedback
- Custom cursor effects
- Floating CTA elements

## 📊 Performance

- ✅ **Static Pages**: Pre-rendered for optimal speed
- ✅ **Image Optimization**: WebP format with quality optimization
  - Hero image: 50KB
  - Background: 5.3KB
- ✅ **Type Safe**: Full TypeScript coverage
- ✅ **No ESLint Warnings**: Clean code quality

## 🌐 Environment Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_CLARITY_ID=your_clarity_id
NEXT_PUBLIC_AHREFS_KEY=your_ahrefs_key
NEXT_PUBLIC_ADSENSE_ID=your_adsense_id
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your_verification_code

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.shawarmakiosk.com
```

## 📄 Content Management

### Adding New Articles

Create MDX files in the appropriate directory under `src/content/{locale}/`:
- **Anomalies:** `src/content/{locale}/anomalies/`
- **Controls:** `src/content/{locale}/controls/`
- **Customers:** `src/content/{locale}/customers/`
- **Events:** `src/content/{locale}/events/`
- **Endings:** `src/content/{locale}/endings/`
- **Inspector:** `src/content/{locale}/inspector/`
- **Download:** `src/content/{locale}/download/`
- **Guides:** `src/content/{locale}/guides/`

### Frontmatter Template

```mdx
---
title: "Your Article Title"
description: "SEO-optimized description"
keywords: ["shawarma kiosk", "anomalies", "keyword3"]
category: "Guides"
priority: 1
date: "2025-12-18"
---

Your content here...
```

## 🔗 Official Game Links

- **🎮 Roblox Game**: [Play Shawarma Kiosk](https://www.roblox.com/games/shawarma-kiosk)

## 🤝 Contributing

We welcome contributions! If you find outdated information or want to suggest improvements:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is a fan-made resource website and is not officially affiliated with Shawarma Kiosk or Roblox. All game content, images, and trademarks are property of their respective owners.

## 📧 Contact

For questions, suggestions, or partnerships, please visit our website at [shawarmakiosk.com](https://shawarmakiosk.com)

---

**Built with ❤️ for the Shawarma Kiosk community**

*Last Updated: December 18, 2025*
