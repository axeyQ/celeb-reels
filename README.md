# Sports Celebrity History Reels

A Next.js application that displays AI-generated history reels for sports celebrities in a TikTok-style vertical scrolling interface.

## Project Overview

This application allows users to browse through short, engaging history reels about sports celebrities. The frontend is built with Next.js and features a smooth, mobile-friendly UI with vertical scrolling similar to TikTok or Instagram Reels.

## Features

- **Vertical Scrolling Interface**: Smooth, snap-to-content scrolling for video reels
- **Video Controls**: Play/pause, mute/unmute functionality
- **Like Interaction**: Users can like videos
- **Category Filtering**: Filter reels by sports category
- **Responsive Design**: Optimized for both mobile and desktop
- **API Integration**: Fetches video data from API endpoints

## Tech Stack

- **Frontend**: Next.js with App Router, React, Tailwind CSS
- **Animation**: Framer Motion for UI animations
- **Video Handling**: Custom video player with autoplay capabilities
- **Interaction**: react-swipeable for gesture handling
- **API**: Next.js API routes (to be connected to AWS S3 in production)

## Project Structure

```
sports-celebrity-reels/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── videos/
│   │   │       └── route.js  # API endpoint for videos
│   │   ├── layout.js         # Root layout component
│   │   ├── page.js           # Home page component
│   │   ├── loading.js        # Loading state component
│   │   └── error.js          # Error handling component
│   ├── components/
│   │   ├── ReelContainer.js  # Container for video reels
│   │   ├── ReelCard.js       # Individual video card component
│   │   └── Navigation.js     # Category navigation component
│   └── data/
│       └── mockVideos.js     # Mock data for development
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd sports-celebrity-reels
```

2. Install dependencies
```bash
npm install
# or
yarn
```

3. Run the development server
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Next Steps

### Phase 1: Frontend Enhancements (Current)
- [ ] Add animation transitions between reels
- [ ] Implement preloading for smoother video transitions
- [ ] Add share functionality
- [ ] Implement user authentication

### Phase 2: Backend Integration
- [ ] Set up AWS S3 bucket for video storage
- [ ] Create serverless functions for video processing
- [ ] Implement metadata tagging system
- [ ] Connect frontend to actual S3 storage

### Phase 3: AI Video Generation
- [ ] Implement OpenAI integration for script generation
- [ ] Set up Amazon Polly for text-to-speech
- [ ] Create image sourcing pipeline
- [ ] Develop video compilation service

## Deployment

The application is designed to be deployed on Vercel for optimal Next.js support:

```bash
npm run build
vercel --prod
```

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.