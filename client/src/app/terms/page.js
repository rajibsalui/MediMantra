'use client';
import { useState } from 'react';
import Link from 'next/link';

// This ensures the page is only rendered on the client side
export const dynamic = 'force-dynamic';
export const runtime = 'edge';


export default function TermsPage() {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  // Handle smooth scrolling to sections
  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section */}
      <div className="relative bg-blue-600 dark:bg-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Terms of Service
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-xl">
              Please read these terms carefully before using Mediमंत्र
            </p>
            <p className="mt-4 text-sm">
              Last Updated: May 15, 2023
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white dark:bg-slate-950" style={{ clipPath: 'polygon(0 0, 100% 100%, 100% 100%, 0% 100%)' }}></div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar - Table of Contents */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-4">Table of Contents</h3>
              <nav className="space-y-1">
                {[
                  { id: 'acceptance', title: '1. Acceptance of Terms' },
                  { id: 'changes', title: '2. Changes to Terms' },
                  { id: 'access', title: '3. Access and Use' },
                  { id: 'accounts', title: '4. User Accounts' },
                  { id: 'content', title: '5. User Content' },
                  { id: 'ip', title: '6. Intellectual Property' },
                  { id: 'health', title: '7. Health Information' },
                  { id: 'disclaimers', title: '8. Disclaimers' },
                  { id: 'liability', title: '9. Limitation of Liability' },
                  { id: 'indemnification', title: '10. Indemnification' },
                  { id: 'termination', title: '11. Termination' },
                  { id: 'governing', title: '12. Governing Law' },
                  { id: 'contact', title: '13. Contact Information' }
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(item.id);
                    }}
                    className={`block px-3 py-2 rounded-md text-sm font-medium ${
                      activeSection === item.id 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' 
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-gray-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {item.title}
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-8 lg:mt-0 lg:col-span-9">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8">
              <div className="prose prose-blue dark:prose-invert max-w-none">
                <section id="acceptance" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">1. Acceptance of Terms</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    By accessing or using Mediमंत्र services, website, mobile applications, or any other services provided by Mediमंत्र Health, Inc. (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use our Services.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    These Terms constitute a legal agreement between you and Mediमंत्र Health, Inc., a Delaware corporation with its principal place of business in San Francisco, California ("Mediमंत्र," "we," "us," or "our").
                  </p>
                </section>
                
                <section id="changes" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">2. Changes to Terms</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    We reserve the right to modify these Terms at any time. We will always post the most current version on our website. If we make material changes, we will notify you either through the Services, email, or other means. Your continued use of the Services after any changes constitute your acceptance of the new Terms.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    It is your responsibility to review these Terms periodically. We recommend reviewing them each time you use our Services.
                  </p>
                </section>
                
                <section id="access" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">3. Access and Use</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    Mediमंत्र grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to access and use the Services for your personal, non-commercial use, subject to these Terms.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-5 mb-3 text-gray-600 dark:text-slate-300">
                    <li>Use the Services in any way that violates applicable laws or regulations</li>
                    <li>Use the Services to harm, threaten, or harass any person or to impersonate or misrepresent your identity</li>
                    <li>Attempt to gain unauthorized access to any part of the Services or any system or network connected to the Services</li>
                    <li>Use any automated means to access or interact with the Services</li>
                    <li>Reverse engineer, decompile, disassemble, or attempt to derive the source code of any part of the Services</li>
                    <li>Remove, alter, or obscure any copyright, trademark, or other proprietary notices</li>
                  </ul>
                </section>
                
                <section id="accounts" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">4. User Accounts</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    To access certain features of the Services, you may need to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    You agree to:
                  </p>
                  <ul className="list-disc pl-5 mb-3 text-gray-600 dark:text-slate-300">
                    <li>Provide accurate and complete information when creating your account</li>
                    <li>Update your information to keep it current</li>
                    <li>Protect your account credentials from unauthorized access</li>
                    <li>Notify us immediately of any unauthorized use of your account</li>
                  </ul>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    We reserve the right to suspend or terminate your account if any information you provide is inaccurate, out-of-date, or incomplete, or if we believe you have violated these Terms.
                  </p>
                </section>
                
                <section id="content" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">5. User Content</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    You retain ownership of any content you submit, post, or display on or through the Services ("User Content"). By providing User Content, you grant Mediमंत्र a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, distribute, and display such User Content for the purpose of providing and improving our Services.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    You are solely responsible for your User Content. You represent and warrant that:
                  </p>
                  <ul className="list-disc pl-5 mb-3 text-gray-600 dark:text-slate-300">
                    <li>You own or have the necessary rights to your User Content</li>
                    <li>Your User Content does not violate the privacy, publicity, intellectual property, or other rights of any person</li>
                    <li>Your User Content does not contain material that is unlawful, defamatory, harassing, abusive, fraudulent, or obscene</li>
                  </ul>
                </section>
                
                <section id="ip" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">6. Intellectual Property</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    The Services and all content and materials included on the Services, including without limitation the Mediमंत्र logo, design, text, graphics, and other files, are the property of Mediमंत्र or our licensors. These are protected by copyright, trademark, and other intellectual property laws.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    Nothing in these Terms grants you any right to use any trademark, design, or logo without our express written permission.
                  </p>
                </section>
                
                <section id="health" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">7. Health Information</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    Mediमंत्र is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    The use of any information provided through the Services is solely at your own risk. Mediमंत्र strives to provide accurate and up-to-date health information, but we make no guarantees regarding the accuracy, completeness, or reliability of any health information provided.
                  </p>
                </section>
                
                <section id="disclaimers" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">8. Disclaimers</h2>
                  <div className="bg-gray-50 dark:bg-slate-700/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-3">
                    <p className="text-gray-700 dark:text-slate-200">
                      THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK.
                    </p>
                    <p className="text-gray-700 dark:text-slate-200 mt-2">
                      Mediमंत्र DOES NOT WARRANT THAT (A) THE SERVICES WILL MEET YOUR REQUIREMENTS, (B) THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE, (C) THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES WILL BE ACCURATE OR RELIABLE, OR (D) ANY ERRORS IN THE SERVICES WILL BE CORRECTED.
                    </p>
                  </div>
                </section>
                
                <section id="liability" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">9. Limitation of Liability</h2>
                  <div className="bg-gray-50 dark:bg-slate-700/30 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 mb-3">
                    <p className="text-gray-700 dark:text-slate-200">
                      IN NO EVENT SHALL Mediमंत्र, ITS AFFILIATES, OR THEIR RESPECTIVE OFFICERS, DIRECTORS, EMPLOYEES, OR AGENTS, BE LIABLE TO YOU FOR ANY INDIRECT, INCIDENTAL, SPECIAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES WHATSOEVER RESULTING FROM ANY (A) USE OR INABILITY TO USE THE SERVICES, (B) ERRORS, MISTAKES, OR INACCURACIES OF CONTENT, (C) PERSONAL INJURY OR PROPERTY DAMAGE RELATED TO YOUR USE OF THE SERVICES, (D) UNAUTHORIZED ACCESS TO OR USE OF OUR SECURE SERVERS AND/OR ANY PERSONAL INFORMATION STORED THEREIN, OR (E) ANY OTHER MATTER RELATING TO THE SERVICES.
                    </p>
                    <p className="text-gray-700 dark:text-slate-200 mt-2">
                      IN NO EVENT SHALL Mediमंत्र'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, OR CAUSES OF ACTION EXCEED THE AMOUNT YOU HAVE PAID TO Mediमंत्र IN THE LAST SIX (6) MONTHS, OR, IF YOU HAVE NOT PAID Mediमंत्र FOR THE USE OF ANY SERVICES, ONE HUNDRED DOLLARS ($100).
                    </p>
                  </div>
                </section>
                
                <section id="indemnification" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">10. Indemnification</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    You agree to defend, indemnify, and hold harmless Mediमंत्र, its affiliates, and their respective officers, directors, employees, and agents, from and against any and all claims, damages, obligations, losses, liabilities, costs or debt, and expenses (including but not limited to attorney's fees) arising from: (a) your use of and access to the Services; (b) your violation of any term of these Terms; (c) your violation of any third-party right, including without limitation any copyright, property, or privacy right; or (d) any claim that your User Content caused damage to a third party.
                  </p>
                </section>
                
                <section id="termination" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">11. Termination</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    We may terminate or suspend your access to all or part of the Services, without notice, for any violation of these Terms or for any other reason at our discretion. Upon termination, your right to use the Services will immediately cease.
                  </p>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    All provisions of these Terms which by their nature should survive termination shall survive, including without limitation, ownership provisions, warranty disclaimers, indemnity, and limitations of liability.
                  </p>
                </section>
                
                <section id="governing" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">12. Governing Law</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    These Terms are governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law. Any dispute arising from or relating to these Terms or your use of the Services shall be subject to the exclusive jurisdiction of the state and federal courts located in San Francisco County, California.
                  </p>
                </section>
                
                <section id="contact" className="mb-10">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">13. Contact Information</h2>
                  <p className="text-gray-600 dark:text-slate-300 mb-3">
                    If you have any questions about these Terms, please contact us at:
                  </p>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-gray-800 dark:text-slate-200">Mediमंत्र Health, Inc.</p>
                    <p className="text-gray-800 dark:text-slate-200">123 MediTech Boulevard</p>
                    <p className="text-gray-800 dark:text-slate-200">Suite 456</p>
                    <p className="text-gray-800 dark:text-slate-200">San Francisco, CA 94107</p>
                    <p className="text-gray-800 dark:text-slate-200 mt-2">Email: legal@Mediमंत्र.com</p>
                    <p className="text-gray-800 dark:text-slate-200">Phone: +1 (800) 123-4567</p>
                  </div>
                </section>
              </div>
              
              {/* Agreement Checkbox */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-700">
                <div className="flex items-center">
                  <input 
                    id="terms-checkbox" 
                    name="terms-checkbox" 
                    type="checkbox" 
                    checked={acceptedTerms}
                    onChange={() => setAcceptedTerms(!acceptedTerms)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-slate-600 rounded dark:bg-slate-700 dark:checked:bg-blue-600"
                  />
                  <label htmlFor="terms-checkbox" className="ml-3 text-gray-700 dark:text-slate-300">
                    I have read and agree to the Terms of Service
                  </label>
                </div>
                
                <div className="mt-6">
                  <button 
                    className={`w-full py-3 px-6 rounded-lg font-medium ${
                      acceptedTerms 
                        ? 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800' 
                        : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    } transition-colors duration-300`}
                    disabled={!acceptedTerms}
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="bg-white dark:bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-slate-100 text-center mb-8">Related Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/privacy" className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl p-6 text-center transition duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Privacy Policy</h3>
              <p className="text-gray-600 dark:text-slate-300">Learn how we collect, use, and protect your personal information.</p>
            </Link>
            
            <Link href="/help" className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl p-6 text-center transition duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Help Center</h3>
              <p className="text-gray-600 dark:text-slate-300">Find answers to frequently asked questions about our services.</p>
            </Link>
            
            <Link href="/contact" className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl p-6 text-center transition duration-300">
              <h3 className="text-lg font-bold text-gray-900 dark:text-slate-100 mb-2">Contact Us</h3>
              <p className="text-gray-600 dark:text-slate-300">Reach out to our team for any questions or concerns.</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
