import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Truck } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';
import LoginOverlay from '../components/LandingComponent/LoginOverlay';

const ShippingDelivery = () => {
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
              <Truck className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Shipping & Delivery Policy
              </h1>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6 text-gray-700">
            <section className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">Digital Service - No Physical Shipping</h2>
              <p className="text-blue-800">
                Shorthand LMS is a completely digital learning platform. We do not ship any physical products. All our courses, materials, and services are delivered electronically through our online platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Instant Digital Delivery</h2>
              <p className="mb-4">
                Upon successful payment verification:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Course access is granted immediately (within 5 minutes)</li>
                <li>Login credentials are sent to your registered email</li>
                <li>All course materials are available online 24/7</li>
                <li>No waiting period or shipping time required</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Access Delivery Process</h2>
              <p className="mb-4">
                Here's how you receive access to your courses:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Complete payment through Razorpay</li>
                <li>Payment verification (usually instant)</li>
                <li>Account activation email sent to your registered email</li>
                <li>Login to your dashboard</li>
                <li>Start accessing your enrolled courses immediately</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Course Materials</h2>
              <p className="mb-4">
                All course materials are delivered digitally:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Video lectures - Stream online or download</li>
                <li>Audio passages - Available for online playback</li>
                <li>PDF documents - Downloadable study materials</li>
                <li>Practice exercises - Interactive online tools</li>
                <li>Progress tracking - Real-time updates</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Access Duration</h2>
              <p className="mb-4">
                Your course access is based on your subscription:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>2 Months Subscription - Access for 60 days</li>
                <li>4 Months Subscription - Access for 120 days</li>
                <li>6 Months Subscription - Access for 180 days</li>
                <li>Access starts immediately upon payment confirmation</li>
                <li>24/7 availability during subscription period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Technical Requirements</h2>
              <p className="mb-4">
                To access our digital services, you need:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Stable internet connection (minimum 2 Mbps recommended)</li>
                <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Email account for notifications and updates</li>
                <li>Device: Computer, laptop, tablet, or smartphone</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Delivery Issues</h2>
              <p className="mb-4">
                If you don't receive access within 5 minutes of payment:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Check your email inbox and spam folder</li>
                <li>Verify payment was successful in your bank statement</li>
                <li>Contact our support team immediately</li>
                <li>Provide your transaction ID and registered email</li>
                <li>We will resolve the issue within 24 hours</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Download Policy</h2>
              <p className="mb-4">
                For downloadable content:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Study materials can be downloaded for offline use</li>
                <li>Downloads are for personal use only</li>
                <li>Sharing or distributing downloads is prohibited</li>
                <li>Downloaded content remains accessible during subscription</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Support & Assistance</h2>
              <p>
                For any delivery or access issues, contact us:
              </p>
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="font-semibold">Email: support@shorthandlms.com</p>
                <p className="font-semibold">Phone: +91 1234567890</p>
                <p className="font-semibold mt-2">Support Hours: Monday - Saturday, 9 AM - 6 PM IST</p>
              </div>
            </section>

            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-semibold mb-2">✓ 100% Digital Delivery</p>
              <p className="text-green-700 text-sm">
                As a digital service provider, we ensure instant access to all our courses and materials. No physical shipping means no delays, no shipping costs, and immediate learning!
              </p>
            </div>
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

export default ShippingDelivery;
