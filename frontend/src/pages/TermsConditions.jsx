import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';
import LoginOverlay from '../components/LandingComponent/LoginOverlay';

const TermsConditions = () => {
  const [showLoginOverlay, setShowLoginOverlay] = useState(false);

  const handleLoginClick = () => {
    setShowLoginOverlay(true);
  };

  const handleCloseOverlay = () => {
    setShowLoginOverlay(false);
  };

  const handleLoginSuccess = () => {
    setShowLoginOverlay(false);
    window.location.href = '/dashboard/overview';
  };

  return (
    <LegalPageLayout onLoginClick={handleLoginClick}>
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-8 font-medium">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-indigo-100">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Terms & Conditions
              </h1>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Shorthand LMS, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="mb-4">
                Permission is granted to temporarily access the materials (information or software) on Shorthand LMS for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="mb-4">
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms.
              </p>
              <p>
                You are responsible for safeguarding the password and for all activities that occur under your account. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Payment Terms</h2>
              <p className="mb-4">
                All payments are processed securely through Razorpay. By making a payment, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Provide accurate payment information</li>
                <li>Pay all fees and charges incurred</li>
                <li>Comply with Razorpay's terms of service</li>
                <li>Accept our refund policy as stated separately</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Course Access</h2>
              <p className="mb-4">
                Upon successful payment:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You will receive access to enrolled courses for the subscription period</li>
                <li>Access is non-transferable</li>
                <li>Course content may be updated without prior notice</li>
                <li>We reserve the right to modify or discontinue courses</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p>
                All course materials, including but not limited to text, graphics, logos, audio clips, and software, are the property of Shorthand LMS and are protected by copyright laws. Unauthorized use or distribution is prohibited.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Activities</h2>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Share your account credentials with others</li>
                <li>Download or distribute course materials without permission</li>
                <li>Use the service for any illegal purpose</li>
                <li>Interfere with or disrupt the service</li>
                <li>Attempt to gain unauthorized access to any portion of the service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p>
                Shorthand LMS shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
              <p>
                We may terminate or suspend your account immediately, without prior notice, for any breach of these Terms. Upon termination, your right to use the service will immediately cease.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any changes by updating the "Last updated" date. Your continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Information</h2>
              <p>
                For questions about these Terms, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="font-semibold">Email: support@shorthandlms.com</p>
                <p className="font-semibold">Phone: +91 1234567890</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showLoginOverlay && (
        <LoginOverlay 
          onClose={handleCloseOverlay}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
    </LegalPageLayout>
  );
};

export default TermsConditions;
