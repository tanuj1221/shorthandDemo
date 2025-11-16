import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';
import LoginOverlay from '../components/LandingComponent/LoginOverlay';

const RefundPolicy = () => {
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
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                Refund & Cancellation Policy
              </h1>
            </div>
          </div>
          
          <p className="text-gray-600 mb-8">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Refund Eligibility</h2>
              <p className="mb-4">
                We offer refunds under the following conditions:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request made within 7 days of purchase</li>
                <li>Less than 20% of the course content has been accessed</li>
                <li>Technical issues preventing course access (verified by our team)</li>
                <li>Duplicate payment or billing errors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Non-Refundable Situations</h2>
              <p className="mb-4">
                Refunds will NOT be provided in the following cases:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request made after 7 days of purchase</li>
                <li>More than 20% of course content has been accessed</li>
                <li>Course completion or certificate issuance</li>
                <li>Change of mind after accessing significant course content</li>
                <li>Violation of our Terms & Conditions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Refund Process</h2>
              <p className="mb-4">
                To request a refund:
              </p>
              <ol className="list-decimal pl-6 space-y-2">
                <li>Contact our support team at support@shorthandlms.com</li>
                <li>Provide your order ID and reason for refund</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>If approved, refund will be processed to the original payment method</li>
                <li>Refund amount will reflect in your account within 7-10 business days</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Partial Refunds</h2>
              <p>
                In certain situations, partial refunds may be granted at our discretion:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Technical issues affecting part of the course</li>
                <li>Subscription cancellation mid-term (prorated refund)</li>
                <li>Course content significantly different from description</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cancellation Policy</h2>
              <p className="mb-4">
                You may cancel your subscription at any time:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access will continue until the end of the current billing period</li>
                <li>No refund for the remaining period unless eligible under refund policy</li>
                <li>You can reactivate your subscription at any time</li>
                <li>All your progress and data will be retained for 90 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Gateway Charges</h2>
              <p>
                Please note:
              </p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li>Payment gateway charges (if any) are non-refundable</li>
                <li>Refund amount may be adjusted for transaction fees</li>
                <li>Currency conversion charges (if applicable) are non-refundable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
              <p>
                If you have any concerns about a refund decision:
              </p>
              <ol className="list-decimal pl-6 space-y-2 mt-4">
                <li>Contact our support team with detailed information</li>
                <li>We will review your case within 5 business days</li>
                <li>A senior team member will provide a final decision</li>
                <li>All decisions are final and binding</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact for Refunds</h2>
              <p>
                For refund requests or questions, please contact:
              </p>
              <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
                <p className="font-semibold">Email: support@shorthandlms.com</p>
                <p className="font-semibold">Phone: +91 1234567890</p>
                <p className="font-semibold mt-2">Subject: Refund Request - [Your Order ID]</p>
              </div>
            </section>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-semibold mb-2">Important Note:</p>
              <p className="text-yellow-700 text-sm">
                This refund policy is in compliance with Indian consumer protection laws and Razorpay's guidelines. We reserve the right to modify this policy at any time. Changes will be effective immediately upon posting on our website.
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

export default RefundPolicy;
