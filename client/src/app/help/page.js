'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('patients');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqs, setExpandedFaqs] = useState({});
  
  // Toggle FAQ expansion
  const toggleFaq = (id) => {
    setExpandedFaqs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Filter help articles based on search query
  const filterContent = (items) => {
    if (!searchQuery) return items;
    return items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  // Help article data for patients
  const patientHelpArticles = [
    {
      id: 'p1',
      title: 'Getting Started with MediBot',
      content: 'Learn how to set up your account, personalize your health profile, and navigate the MediBot dashboard.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      )
    },
    {
      id: 'p2',
      title: 'Booking Appointments',
      content: 'Step-by-step guide on how to schedule, reschedule, or cancel appointments with your healthcare providers.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'p3',
      title: 'Medication Reminders',
      content: 'How to set up medication reminders, tracking your medications, and receiving notifications.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
        </svg>
      )
    },
    {
      id: 'p4',
      title: 'Health Monitoring',
      content: 'Instructions for logging health metrics, setting goals, and interpreting your health data trends.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      )
    },
    {
      id: 'p5',
      title: 'Telehealth Consultations',
      content: 'Learn how to join virtual appointments, test your equipment, and make the most of your telehealth visits.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'p6',
      title: 'Managing Health Records',
      content: 'How to view, download, and share your medical records securely through the MediBot platform.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    }
  ];
  
  // Help article data for doctors
  const doctorHelpArticles = [
    {
      id: 'd1',
      title: 'Dashboard Overview for Providers',
      content: 'Learn how to navigate the provider dashboard, access patient information, and manage your practice efficiently.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
        </svg>
      )
    },
    {
      id: 'd2',
      title: 'Patient Management',
      content: 'Instructions for managing patient records, reviewing medical histories, and organizing patient information.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      )
    },
    {
      id: 'd3',
      title: 'Scheduling and Calendar',
      content: 'How to configure your availability, manage appointment slots, and optimize your clinic schedule.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'd4',
      title: 'Telehealth for Providers',
      content: 'Guide to conducting virtual visits, sharing screens, and utilizing advanced telehealth features.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
        </svg>
      )
    },
    {
      id: 'd5',
      title: 'Prescription Management',
      content: 'Step-by-step instructions for writing prescriptions, managing refills, and monitoring patient medication adherence.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
        </svg>
      )
    },
    {
      id: 'd6',
      title: 'Billing and Practice Analytics',
      content: 'Information on accessing billing features, generating reports, and analyzing practice performance metrics.',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      )
    }
  ];

  // FAQ data
  const faqs = [
    {
      id: 'faq1',
      question: 'How do I reset my password?',
      answer: 'To reset your password, click on the "Forgot Password" link on the login page. Enter your registered email address, and we\'ll send you instructions to reset your password. Follow the link in the email to create a new password.'
    },
    {
      id: 'faq2',
      question: 'Is my health data secure with MediBot?',
      answer: 'Yes, security is our top priority. MediBot uses end-to-end encryption to protect all your health data. We are fully HIPAA compliant and follow industry best practices for data security and privacy. Your information is never shared without your explicit consent.'
    },
    {
      id: 'faq3',
      question: 'How can I sync my wearable devices with MediBot?',
      answer: 'Go to Settings > Connected Devices in your MediBot account. Select your device brand and follow the on-screen instructions to connect. We support most major health wearables including Apple Health, Fitbit, Garmin, and Google Fit.'
    },
    {
      id: 'faq4',
      question: 'Can I use MediBot without internet connection?',
      answer: 'MediBot offers limited offline functionality. You can view previously loaded data and scheduled reminders, but real-time features like chat, appointment booking, and data synchronization require an internet connection.'
    },
    {
      id: 'faq5',
      question: 'How do doctors access the platform?',
      answer: 'Healthcare providers use a special provider portal with enhanced features. If you\'re a healthcare provider, contact our support team to verify your credentials and set up your professional account.'
    },
    {
      id: 'faq6',
      question: 'How can I export my health records?',
      answer: 'In your account settings, navigate to "Health Records" and select "Export Data." You can choose to export in various formats including PDF and CSV. You can also select specific date ranges and categories of health data to export.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Help Center
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-xl">
              Find answers, guides, and resources to help you make the most of MediBot
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0% 100%)' }}></div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-8 -mt-16 relative z-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">What can we help you with today?</h2>
          <div className="flex items-center border-2 border-gray-300 rounded-lg overflow-hidden">
            <div className="px-4 py-2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            <input 
              type="text" 
              placeholder="Search for help articles, guides, and more..."
              className="w-full py-3 px-4 outline-none text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Quick Access Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Access</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link href="#getting-started" className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition">
            <div className="rounded-full bg-blue-100 p-3 mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </div>
            <span className="font-medium">Getting Started</span>
          </Link>
          
          <Link href="#faqs" className="flex items-center p-4 bg-green-50 border border-green-100 rounded-lg hover:bg-green-100 transition">
            <div className="rounded-full bg-green-100 p-3 mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span className="font-medium">Frequently Asked Questions</span>
          </Link>
          
          <Link href="#video-tutorials" className="flex items-center p-4 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition">
            <div className="rounded-full bg-purple-100 p-3 mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </div>
            <span className="font-medium">Video Tutorials</span>
          </Link>
          
          <Link href="#contact-support" className="flex items-center p-4 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 transition">
            <div className="rounded-full bg-red-100 p-3 mr-3">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <span className="font-medium">Contact Support</span>
          </Link>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="getting-started">
        <div className="flex border-b border-gray-200">
          <button
            className={`py-4 px-6 font-medium text-lg ${activeTab === 'patients' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('patients')}
          >
            For Patients
          </button>
          <button
            className={`py-4 px-6 font-medium text-lg ${activeTab === 'doctors' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('doctors')}
          >
            For Healthcare Providers
          </button>
        </div>
      </div>

      {/* Help Articles Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {activeTab === 'patients' ? 'Patient Resources' : 'Healthcare Provider Resources'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filterContent(activeTab === 'patients' ? patientHelpArticles : doctorHelpArticles).map(article => (
            <div key={article.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="rounded-full bg-blue-100 p-3 mr-3 text-blue-600">
                    {article.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">{article.title}</h3>
                </div>
                <p className="text-gray-600 mb-4">{article.content}</p>
                <Link 
                  href={`#${article.id}`}
                  className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
                >
                  Read more
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Tutorials */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16" id="video-tutorials">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Video Tutorials</h2>
          <p className="mt-4 text-xl text-gray-600">Learn how to use MediBot with our step-by-step video guides</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="flex items-center justify-center h-full">
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Getting Started with MediBot</h3>
              <p className="text-gray-600">A complete overview of MediBot's features and how to set up your account.</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                5:32
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="flex items-center justify-center h-full">
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Using the Telehealth Features</h3>
              <p className="text-gray-600">Learn how to join virtual appointments and communicate with your doctor.</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                4:15
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 bg-gray-200">
              <div className="flex items-center justify-center h-full">
                <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">Provider Dashboard Tutorial</h3>
              <p className="text-gray-600">For healthcare providers: managing appointments, patients, and using clinical tools.</p>
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                8:47
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-gray-50" id="faqs">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
          <p className="mt-4 text-xl text-gray-600">Find quick answers to common questions</p>
        </div>

        <div className="max-w-3xl mx-auto">
          {faqs.map(faq => (
            <div key={faq.id} className="mb-4">
              <button
                className="flex justify-between items-center w-full px-6 py-4 text-left bg-white rounded-lg shadow-md hover:shadow-lg focus:outline-none"
                onClick={() => toggleFaq(faq.id)}
              >
                <span className="text-lg font-medium text-gray-900">{faq.question}</span>
                <svg 
                  className={`w-5 h-5 text-gray-500 transform ${expandedFaqs[faq.id] ? 'rotate-180' : ''} transition-transform`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {expandedFaqs[faq.id] && (
                <div className="px-6 py-4 bg-white border-t-0 rounded-b-lg shadow-md">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Downloads Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Helpful Resources</h2>
          <p className="mt-4 text-xl text-gray-600">Download guides, manuals, and other useful documents</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-blue-100 p-3 mb-4 text-blue-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">User Manual</h3>
            <p className="text-gray-600 mb-4">Complete guide to all MediBot features and functionality</p>
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Download PDF
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-green-100 p-3 mb-4 text-green-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Provider Guide</h3>
            <p className="text-gray-600 mb-4">Technical guide for healthcare professionals</p>
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Download PDF
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-purple-100 p-3 mb-4 text-purple-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Quick Start Guide</h3>
            <p className="text-gray-600 mb-4">Get started with MediBot in 10 minutes or less</p>
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Download PDF
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center text-center">
            <div className="rounded-full bg-yellow-100 p-3 mb-4 text-yellow-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path>
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Privacy Policy</h3>
            <p className="text-gray-600 mb-4">Detailed information about data usage and protection</p>
            <a href="#" className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
              Download PDF
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
            </a>
          </div>
        </div>
      </div>

      {/* Contact Support Section */}
      <div className="bg-blue-600 text-white py-16" id="contact-support">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h2 className="text-3xl font-extrabold tracking-tight">Need additional help?</h2>
              <p className="mt-4 text-lg">Our support team is available 24/7 to assist you with any questions or technical issues.</p>
              <div className="mt-8 space-y-4">
                <div className="flex items-center">
                  <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  <span>+1 (800) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <svg className="h-6 w-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  <span>support@medibot.com</span>
                </div>
              </div>
            </div>
            
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="bg-white rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Send us a message</h3>
                <form>
                  <div className="mb-4">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="issue" className="block text-sm font-medium text-gray-700 mb-1">Issue Type</label>
                    <select id="issue" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900">
                      <option>Technical Problem</option>
                      <option>Account Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea id="message" rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"></textarea>
                  </div>
                  <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Submit Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
