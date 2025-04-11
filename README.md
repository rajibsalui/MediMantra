# Mediमंत्र - AI-Powered Healthcare Platform

![Mediमंत्र Logo](client/public/image.png)

## Overview

Mediमंत्र is a comprehensive healthcare platform that combines advanced AI technology with medical expertise to deliver personalized healthcare solutions. The platform connects patients with qualified healthcare professionals, provides intelligent symptom analysis, enables seamless appointment booking, and offers digital prescription management.

## Features

### For Patients
- **Doctor Appointments**: Schedule in-person, video, or phone appointments with specialists
- **Symptom Checker**: Advanced AI analysis to identify possible conditions based on symptoms
- **Lab Tests**: Book and manage lab tests with digital results
- **Find Specialists**: Search for doctors by specialty, name, or availability
- **Digital Prescriptions**: View, download, and manage prescriptions
- **Medical Records**: Store and share your medical history securely
- **Insurance Management**: Track and manage insurance claims and coverage

### For Doctors
- **Patient Management**: View and manage patient profiles and medical records
- **Appointment Scheduling**: Manage availability and appointments
- **Prescription System**: Create, modify, and send digital prescriptions
- **Video Consultations**: Conduct virtual appointments through integrated telehealth
- **Analytics Dashboard**: Track patient metrics and practice performance
- **Secure Messaging**: Communicate with patients through encrypted messaging

### Technical Features
- **HIPAA Compliant**: End-to-end encryption and secure data handling
- **Multi-language Support**: Platform available in 45+ languages
- **Accessibility**: WCAG 2.1 AAA standards for universal access
- **AI Integration**: Machine learning for symptom analysis and personalized care
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Offline Capabilities**: Core functionality available without internet connection

## Tech Stack

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS
- **Animations**: GSAP
- **State Management**: React Context API
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication
- **File Storage**: Cloud storage for medical documents and images
- **Email Service**: Nodemailer for notifications and alerts

### AI Components
- **Natural Language Processing**: For symptom analysis and medical text comprehension
- **Recommendation Engine**: For doctor matching and treatment suggestions
- **Computer Vision**: For medical image processing (optional)

## Getting Started

### Prerequisites
- Node.js (v16.x or higher)
- MongoDB (v5.x or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/medimantra.git
cd medimantra
```

2. Install server dependencies

```bash
cd server
npm install
```

3. Install client dependencies

```bash
cd ../client
npm install
```

4. Set up environment variables

Create .env file in the server directory based on .env.example
Create .env.local file in the client directory based on .env.example

5. Start the development server

```bash
# In server directory
npm run dev

# In client directory
npm start
```

6. Open http://localhost:3000 in your browser to view the application

### Project Structure

```bash
medimantra/
├── client/               # Frontend Next.js application
│   ├── public/           # Static files
│   ├── src/              # Source code
│   │   ├── app/          # Next.js app router components
│   │   ├── components/   # Reusable components
│   │   ├── contexts/     # React Context providers
│   │   ├── data/         # Static data and constants
│   │   └── ...
├── server/               # Backend Node.js/Express application
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions
│   └── ...
└── ...
```