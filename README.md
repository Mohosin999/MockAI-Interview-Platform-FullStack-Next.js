# MockAI - AI-Powered Mock Interview Platform

## 📚 Table of Contents

- [Description](#-description)
- [Live Demo](#-live-demo)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Setup and Installation](#️-setup-and-installation)
- [Environment Variables](#-environment-variables)
- [Author Info](#-author-info)

## 📝 Description

MockAI is an intelligent web application that helps users prepare for real interviews using AI-driven mock sessions, personalized feedback, and smart question recommendations. The platform provides a realistic interview experience powered by VAP, allowing users to talk directly with the AI interviewer. It uses secure Firebase Authentication to protect user data, feedback history, and interview performance.

Built with Next.js, TypeScript, Firebase, VAPI, Google Gemini AI and Tailwind CSS, MockAI offers a modern, fast, and secure environment for practicing and improving your interview skills.

## 🚀 Live Demo

[![Project Screenshot](./public/project_photo.png)](https://mockai.vercel.app/)

## ✨ Features

#### `Secure Authentication`

- Fully protected authentication using **Firebase Authentication**.
- Only authenticated users can access the app.
- User sessions and data are securely stored in Firebase Firestore.

#### `AI-Guided Navigation`

- Talk to the AI directly from the Home Page to decide your next step.
- The AI can redirect you to the **Mock Interview** or **Interview Question Bank** automatically, without using the navbar.

#### `AI-Guided Mock Interview`

- Conduct full mock interviews with the AI acting as your interviewer.
- The AI asks questions, listens to your responses, and provides instant feedback.

#### `Feedback History`

- Every mock interview attempt and feedback is stored securely in Firebase.
- View your performance history, delete old sessions, or retake interviews anytime.

## 🛠️ Tech Stack

- **`Framework:`**

  - Next.js 15
  - TypeScript
  - Tailwind CSS + shadcn/ui

- **`Backend & Database:`**

  - Next.js API Routes & Server Actions
  - Firebase (Firestore, Authentication)

- **`AI Integration:`**

  - Google Gemini AI & VAPI

## ⚙️ Setup and Installation

### Step-by-step instructions for cloning and running locally:

```bash
# Clone the repository
git clone https://github.com/Mohosin999/MockAI-Interview-Platform-FullStack-Next.js.git

# Navigate to project folder
cd MockAI-Interview-Platform-FullStack-Next.js

# Install dependencies
npm install

# Run the development server
npm run dev
```

## 🔑 Environment Variables

Create a `.env.local` file in the root directory of the project and add the following variables:

```
NEXT_PUBLIC_BASE_URL=
GOOGLE_GENERATIVE_AI_API_KEY=

NEXT_PUBLIC_VAPI_WEB_TOKEN=
NEXT_PUBLIC_VAPI_ASSISTANT_ID=
NEXT_PUBLIC_VAPI_HOME_ASSISTANT_ID=

FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=
```

## 📬 Author Info

👤 **Mohosin Hasan Akash**

- 💼 **LinkedIn:** [linkedin.com/in/mohosinh99/](https://www.linkedin.com/in/mohosinh99/)
- 🌐 **Portfolio:** [personal-portfolio.com](https://personal-portfolio-website-brown-nine.vercel.app/)
- 📧 **Email:** mohosin.hasan.akash@gmail.com
