# Developer Portfolio

Personal portfolio web application built with Next.js 15, React 19, and Tailwind CSS.

## Features

- Next.js 15 App Router: Uses server components, server actions, and API routes.
- Gemini AI chat assistant: Embedded assistant that answers visitor questions about projects and tech stack.
- Resume Analyzer: Parses resume text and calculates scoring based on formatting guidelines.
- Tavily search integration: Connects to Tavily API for real-time web search capability.
- Micro-animations: Page transitions built with Framer Motion and Tailwind CSS.
- MongoDB database: Stores article data and research entries.

## Tech Stack

- Framework: Next.js 15, React 19
- Styling: Tailwind CSS, Framer Motion
- Database: MongoDB Atlas, Firebase Admin
- APIs: Google Gemini API, Tavily API

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/nabaraj-kc/portfolio.git
   cd portfolio
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   # Fill in your local MongoDB URI, Gemini API key, etc.
   ```

4. Run the development server:
   ```bash
   npm run dev
   # Open http://localhost:3000
   ```
