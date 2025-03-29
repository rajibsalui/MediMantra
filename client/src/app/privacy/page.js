'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  const [expandedSections, setExpandedSections] = useState({});
  const [activeSection, setActiveSection] = useState('');
  
  // Toggle section expansion
  const toggleSection = (id) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };
  
  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Hero Section */}
      <div className="relative bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-xl">
              How we collect, use, and protect your personal information
            </p>
            <p className="mt-4 text-sm">
              Effective Date: May 15, 2023
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0% 100%)' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Navigation</h3>
              <nav className="space-y-1">
                {[
                  { id: 'introduction', title: 'Introduction' },
                  { id: 'information', title: 'Information We Collect' },
                  { id: 'use', title: 'How We Use Your Information' },
                  { id: 'sharing', title: 'Information Sharing' },
                  { id: 'choices', title: 'Your Choices' },
                  { id: 'security', title: 'Data Security' },
                  { id: 'children', title: 'Children\'s Privacy' },
                  { id: 'international', title: 'International Users' },
                  { id: 'changes', title: 'Changes to This Policy' },
                  { id: 'contact', title: 'Contact Us' }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      activeSection === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Your Data Matters</h4>
                <p className="text-sm text-blue-700">
                  We are committed to protecting your privacy and ensuring your data is handled responsibly.
                </p>
              </div>

              <div className="mt-8 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Have Questions?</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Our privacy team is ready to assist you with any questions or concerns.
                </p>
                <Link href="/contact" className="text-blue-600 text-sm font-medium hover:text-blue-800">
                  Contact Us →
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* Introduction */}
              <section id="introduction" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
                <p className="text-gray-600 mb-4">
                  Mediमंत्र Health, Inc. ("Mediमंत्र," "we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile application, and other services (collectively, the "Services").
                </p>
                <p className="text-gray-600 mb-4">
                  Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access or use our Services. By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
                </p>
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-1">HIPAA Compliance</h3>
                  <p className="text-gray-700">
                    Mediमंत्र is fully compliant with the Health Insurance Portability and Accountability Act of 1996 (HIPAA). For information about how we handle your protected health information (PHI), please refer to our separate HIPAA Notice of Privacy Practices.
                  </p>
                </div>
              </section>
              
              {/* Information We Collect */}
              <section id="information" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('information')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.information ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.information ? '' : 'hidden'}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Personal Information</h3>
                  <p className="text-gray-600 mb-3">
                    We may collect personal information that you provide directly to us, including:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li>Contact information (name, email address, phone number, mailing address)</li>
                    <li>Account credentials (username, password)</li>
                    <li>Personal identifiers (date of birth, gender)</li>
                    <li>Payment information (credit card details, billing address)</li>
                    <li>Healthcare provider information</li>
                    <li>Insurance information</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Health Information</h3>
                  <p className="text-gray-600 mb-3">
                    We may collect health information that you provide directly to us or that we receive from your healthcare providers, including:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li>Medical history</li>
                    <li>Diagnoses</li>
                    <li>Treatment information</li>
                    <li>Medication information</li>
                    <li>Allergies</li>
                    <li>Laboratory test results</li>
                    <li>Vital signs and other biometric data</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Usage Information</h3>
                  <p className="text-gray-600 mb-3">
                    We automatically collect certain information when you use our Services, including:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li>Device information (IP address, device type, operating system, browser type)</li>
                    <li>Usage data (pages visited, features used, time spent on the Services)</li>
                    <li>Location information</li>
                    <li>Cookies and similar technologies</li>
                  </ul>
                </div>
              </section>
              
              {/* How We Use Your Information */}
              <section id="use" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('use')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.use ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.use ? '' : 'hidden'}`}>
                  <p className="text-gray-600 mb-3">
                    We may use your information for the following purposes:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li><strong>Provide and Improve Our Services:</strong> To provide you with access to our Services, improve their functionality, develop new features, and ensure a seamless user experience.</li>
                    <li><strong>Personalize Your Experience:</strong> To personalize your experience with our Services, such as by displaying content tailored to your health needs or preferences.</li>
                    <li><strong>Communication:</strong> To communicate with you about your account, respond to your inquiries, send administrative messages, and provide customer support.</li>
                    <li><strong>Healthcare Services:</strong> To facilitate healthcare services, including appointment scheduling, medication reminders, and health monitoring.</li>
                    <li><strong>Marketing:</strong> With your consent, to send you marketing communications about our products and services that may be of interest to you.</li>
                    <li><strong>Research and Analytics:</strong> To conduct research and analysis to better understand how users access and use our Services, and to improve our Services based on this information.</li>
                    <li><strong>Legal and Security:</strong> To protect our rights, your rights, and the rights of others; to detect, prevent, and address fraud, security issues, and technical issues; and to comply with legal obligations.</li>
                  </ul>
                </div>
              </section>
              
              {/* Information Sharing */}
              <section id="sharing" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('sharing')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">Information Sharing</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.sharing ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.sharing ? '' : 'hidden'}`}>
                  <p className="text-gray-600 mb-3">
                    We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li><strong>Healthcare Providers:</strong> With your healthcare providers to facilitate your care and treatment.</li>
                    <li><strong>Service Providers:</strong> With third-party service providers who perform services on our behalf, such as hosting, data analysis, payment processing, and customer service.</li>
                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, reorganization, sale of assets, or bankruptcy, in which case personal information would be among the assets transferred.</li>
                    <li><strong>Legal Requirements:</strong> To comply with applicable laws, regulations, legal processes, or enforceable governmental requests.</li>
                    <li><strong>Protection of Rights:</strong> To protect the rights, property, or safety of Mediमंत्र, our users, or the public.</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">De-identified Information</h3>
                  <p className="text-gray-600 mb-3">
                    We may de-identify and aggregate information collected through our Services and use and disclose it for any purpose. De-identified information does not identify you individually.
                  </p>
                </div>
              </section>
              
              {/* Your Choices */}
              <section id="choices" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('choices')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">Your Choices</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.choices ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.choices ? '' : 'hidden'}`}>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Account Information</h3>
                  <p className="text-gray-600 mb-3">
                    You can update, correct, or delete your account information at any time by logging into your account settings. If you need assistance, please contact us using the information provided below.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Marketing Communications</h3>
                  <p className="text-gray-600 mb-3">
                    You can opt out of receiving marketing communications from us by following the unsubscribe instructions included in our emails or contacting us directly.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Cookies and Tracking Technologies</h3>
                  <p className="text-gray-600 mb-3">
                    Most web browsers are set to accept cookies by default. You can usually set your browser to remove or reject cookies. Please note that doing so may affect the functionality of our Services.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Privacy Rights</h3>
                  <p className="text-gray-600 mb-3">
                    Depending on your location, you may have certain rights regarding your personal information, including:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li>The right to access and receive a copy of your personal information</li>
                    <li>The right to correct or update your personal information</li>
                    <li>The right to request deletion of your personal information</li>
                    <li>The right to restrict or object to processing of your personal information</li>
                    <li>The right to data portability</li>
                  </ul>
                  <p className="text-gray-600 mb-3">
                    To exercise your rights, please contact us using the information provided below. We will respond to your request within the timeframe required by applicable law.
                  </p>
                  
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-3">
                    <p className="text-gray-700">
                      Please note that certain information may be exempt from such requests under applicable law, and we may need to retain certain information for legal purposes, to complete transactions, or to provide you with services you have requested.
                    </p>
                  </div>
                </div>
              </section>
              
              {/* Data Security */}
              <section id="security" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('security')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">Data Security</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.security ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.security ? '' : 'hidden'}`}>
                  <p className="text-gray-600 mb-3">
                    We implement appropriate technical, administrative, and physical safeguards designed to protect the security, confidentiality, and integrity of personal information. However, no method of transmission over the Internet or method of electronic storage is completely secure. Therefore, while we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Our Security Measures</h3>
                  <p className="text-gray-600 mb-3">
                    Our security measures include:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-gray-600">
                    <li>Encryption of sensitive information both in transit and at rest</li>
                    <li>Regular security assessments and vulnerability testing</li>
                    <li>Access controls and authentication procedures</li>
                    <li>Employee training on privacy and security practices</li>
                    <li>Incident response planning</li>
                  </ul>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Your Responsibilities</h3>
                  <p className="text-gray-600 mb-3">
                    You are responsible for maintaining the confidentiality of your account credentials and for any activity that occurs under your account. Please notify us immediately of any unauthorized use of your account or any other security breach.
                  </p>
                </div>
              </section>
              
              {/* Children's Privacy */}
              <section id="children" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('children')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">Children's Privacy</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.children ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.children ? '' : 'hidden'}`}>
                  <p className="text-gray-600 mb-3">
                    Our Services are not directed to children under 13 years of age, and we do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will promptly take steps to delete that information.
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    If you are a parent or guardian and believe that your child has provided us with personal information without your consent, please contact us using the information provided below.
                  </p>
                </div>
              </section>
              
              {/* International Users */}
              <section id="international" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('international')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">International Users</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.international ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.international ? '' : 'hidden'}`}>
                  <p className="text-gray-600 mb-3">
                    Our Services are based in the United States. If you access our Services from outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States, where our servers are located. The data protection and other laws of the United States might not be as comprehensive as those in your country.
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    By using our Services, you consent to your information being transferred to our facilities and to the facilities of those third parties with whom we share it as described in this Privacy Policy.
                  </p>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">European Economic Area (EEA) and UK Users</h3>
                  <p className="text-gray-600 mb-3">
                    If you are located in the EEA or UK, we will comply with applicable data protection laws when transferring your personal information outside of these areas. We may transfer your personal information to countries that have been deemed to provide an adequate level of protection, or we may use specific contractual provisions that have been approved by the European Commission or UK authorities, as applicable.
                  </p>
                </div>
              </section>
              
              {/* Changes to This Policy */}
              <section id="changes" className="mb-12">
                <button 
                  className="flex justify-between items-center w-full text-left"
                  onClick={() => toggleSection('changes')}
                >
                  <h2 className="text-2xl font-bold text-gray-900">Changes to This Policy</h2>
                  <svg 
                    className={`w-6 h-6 text-gray-500 transform ${expandedSections.changes ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                <div className={`mt-4 ${expandedSections.changes ? '' : 'hidden'}`}>
                  <p className="text-gray-600 mb-3">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. When we make changes, we will update the "Effective Date" at the top of this Privacy Policy and post the updated policy on our website. We encourage you to review this Privacy Policy periodically to stay informed about our privacy practices.
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    For significant changes, we will provide notice through our Services or by other means, such as email, prior to the change becoming effective.
                  </p>
                  
                  <p className="text-gray-600 mb-3">
                    Your continued use of our Services after any changes to this Privacy Policy constitutes your acceptance of the revised Privacy Policy.
                  </p>
                </div>
              </section>
              
              {/* Contact Us */}
              <section id="contact" className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-3">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-gray-800">Mediमंत्र Health, Inc.</p>
                  <p className="text-gray-800">Attn: Privacy Officer</p>
                  <p className="text-gray-800">123 MediTech Boulevard</p>
                  <p className="text-gray-800">Suite 456</p>
                  <p className="text-gray-800">San Francisco, CA 94107</p>
                  <p className="text-gray-800 mt-2">Email: privacy@Mediमंत्र.com</p>
                  <p className="text-gray-800">Phone: +1 (800) 123-4567</p>
                </div>
                
                <p className="text-gray-600 mt-4">
                  We will respond to your request within a reasonable timeframe.
                </p>
              </section>
              
              {/* Additional Privacy Resources */}
              <div className="mt-8 bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Additional Privacy Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link href="/terms" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">Terms of Service</h4>
                    <p className="text-gray-600 text-sm">Review our Terms of Service that govern your use of Mediमंत्र.</p>
                  </Link>
                  
                  <Link href="#" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">HIPAA Notice</h4>
                    <p className="text-gray-600 text-sm">Learn how we protect your health information under HIPAA.</p>
                  </Link>
                  
                  <Link href="#" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">Cookie Policy</h4>
                    <p className="text-gray-600 text-sm">Understand how we use cookies and similar technologies.</p>
                  </Link>
                  
                  <Link href="/help" className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                    <h4 className="font-medium text-gray-900 mb-1">Help Center</h4>
                    <p className="text-gray-600 text-sm">Find answers to frequently asked questions about privacy.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated Banner */}
      <div className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-t border-gray-200 pt-6">
            <div className="text-center">
              <p className="text-sm text-gray-500">
                This Privacy Policy was last updated on May 15, 2023.
              </p>
              <div className="mt-4">
                <Link href="/contact" className="inline-flex items-center text-blue-600 hover:text-blue-800">
                  <span className="font-medium">Have feedback on our privacy practices?</span>
                  <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
