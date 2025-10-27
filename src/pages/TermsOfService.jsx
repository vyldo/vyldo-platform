import { Link } from 'react-router-dom';
import { Shield, AlertCircle, CheckCircle, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
          </div>
          <p className="text-gray-600">Last Updated: October 23, 2025</p>
          <p className="text-sm text-gray-500 mt-2">
            Please read these terms carefully before using Vyldo platform
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">1.</span> Acceptance of Terms
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                By accessing and using Vyldo ("Platform", "Service", "Website"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
              </p>
              <p>
                Vyldo is a freelancing marketplace that connects buyers and sellers for digital services. We facilitate transactions using Hive blockchain technology for secure and transparent payments.
              </p>
            </div>
          </section>

          {/* 2. User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">2.</span> User Accounts and Registration
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">2.1 Account Creation</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You must notify us immediately of any unauthorized access to your account</li>
                <li>One person or entity may maintain only one account</li>
              </ul>
              
              <p className="font-semibold mt-4">2.2 Account Suspension and Termination</p>
              <p>We reserve the right to suspend or terminate your account if:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You violate these Terms of Service</li>
                <li>You engage in fraudulent or illegal activities</li>
                <li>You provide false or misleading information</li>
                <li>Your account remains inactive for more than 12 months</li>
                <li>We receive multiple complaints about your services or behavior</li>
              </ul>
            </div>
          </section>

          {/* 3. Services and Gigs */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">3.</span> Services and Gigs
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">3.1 Seller Responsibilities</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sellers must accurately describe their services and deliverables</li>
                <li>Sellers must deliver work as described in the gig listing</li>
                <li>Sellers must respond to buyer inquiries within 24 hours</li>
                <li>Sellers must complete orders within the specified delivery time</li>
                <li>Sellers are responsible for the quality and originality of their work</li>
              </ul>

              <p className="font-semibold mt-4">3.2 Buyer Responsibilities</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Buyers must provide clear requirements and necessary materials</li>
                <li>Buyers must respond to seller questions in a timely manner</li>
                <li>Buyers must review delivered work within 3 days of delivery</li>
                <li>Buyers must treat sellers with respect and professionalism</li>
              </ul>

              <p className="font-semibold mt-4">3.3 Prohibited Services</p>
              <p>The following services are strictly prohibited on Vyldo:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Illegal activities or services that violate any laws</li>
                <li>Adult content, pornography, or sexually explicit material</li>
                <li>Fake reviews, testimonials, or engagement manipulation</li>
                <li>Hacking, phishing, or any malicious software services</li>
                <li>Plagiarized or copyright-infringing content</li>
                <li>Academic dishonesty (writing essays, taking exams for others)</li>
                <li>Pyramid schemes or multi-level marketing</li>
              </ul>
            </div>
          </section>

          {/* 4. Orders and Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">4.</span> Orders and Payments
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">4.1 Payment Processing</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All payments are processed in HIVE tokens through Hive blockchain</li>
                <li>Buyers must have sufficient balance before placing an order</li>
                <li>Payments are held in escrow until order completion</li>
                <li>Vyldo charges a 10% service fee on all completed transactions</li>
              </ul>

              <p className="font-semibold mt-4">4.2 Order Completion</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders are automatically marked as complete if not reviewed within 3 days</li>
                <li>Buyers can request revisions as specified in the gig package</li>
                <li>Sellers receive payment after successful order completion</li>
                <li>Completed orders cannot be cancelled or refunded</li>
              </ul>

              <p className="font-semibold mt-4">4.3 Cancellations and Refunds</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Orders can be cancelled by mutual agreement before delivery</li>
                <li>Buyers can request cancellation if seller fails to deliver on time</li>
                <li>Refunds are processed within 24-48 hours of cancellation approval</li>
                <li>Service fees are non-refundable on completed orders</li>
              </ul>

              <p className="font-semibold mt-4">4.4 Withdrawals</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sellers can withdraw earnings to their Hive account</li>
                <li>Minimum withdrawal amount is 10 HIVE</li>
                <li>Withdrawal requests are processed within 24-48 hours</li>
                <li>A 2% withdrawal fee is charged on all withdrawals</li>
              </ul>
            </div>
          </section>

          {/* 5. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">5.</span> Intellectual Property Rights
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">5.1 Ownership of Work</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sellers retain ownership of their work until payment is completed</li>
                <li>Upon payment completion, buyers receive full rights to the delivered work</li>
                <li>Sellers may showcase completed work in their portfolio unless otherwise agreed</li>
                <li>Sellers must not use copyrighted materials without proper authorization</li>
              </ul>

              <p className="font-semibold mt-4">5.2 Platform Content</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vyldo owns all rights to the platform design, code, and branding</li>
                <li>Users may not copy, modify, or distribute platform content</li>
                <li>User-generated content remains the property of respective users</li>
              </ul>
            </div>
          </section>

          {/* 6. Disputes and Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">6.</span> Dispute Resolution
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">6.1 Dispute Process</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users should first attempt to resolve disputes directly with each other</li>
                <li>If resolution fails, users can contact Vyldo support for mediation</li>
                <li>Vyldo will review all evidence and make a final decision</li>
                <li>Vyldo's decision in disputes is final and binding</li>
              </ul>

              <p className="font-semibold mt-4">6.2 Evidence Requirements</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Users must provide screenshots, files, and communication records</li>
                <li>All evidence must be submitted within 7 days of dispute opening</li>
                <li>False or misleading evidence may result in account suspension</li>
              </ul>
            </div>
          </section>

          {/* 7. User Conduct */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">7.</span> User Conduct and Prohibited Activities
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>Users must not engage in the following activities:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Harassment, bullying, or abusive behavior towards other users</li>
                <li>Spamming, unsolicited advertising, or promotional content</li>
                <li>Attempting to bypass platform fees or conduct off-platform transactions</li>
                <li>Creating multiple accounts to manipulate reviews or ratings</li>
                <li>Sharing account credentials with others</li>
                <li>Using automated tools or bots to manipulate platform features</li>
                <li>Collecting user data without consent</li>
                <li>Impersonating other users or entities</li>
              </ul>
            </div>
          </section>

          {/* 8. Privacy and Data */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">8.</span> Privacy and Data Protection
            </h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>We collect and process user data as described in our Privacy Policy</li>
                <li>Users are responsible for protecting their personal information</li>
                <li>We use industry-standard security measures to protect user data</li>
                <li>We do not sell or share user data with third parties without consent</li>
                <li>Users can request data deletion by contacting support</li>
              </ul>
            </div>
          </section>

          {/* 9. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">9.</span> Limitation of Liability
            </h2>
            <div className="space-y-3 text-gray-700">
              <p className="font-semibold">9.1 Platform Availability</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service</li>
                <li>We are not liable for service interruptions due to maintenance or technical issues</li>
                <li>We reserve the right to modify or discontinue features without notice</li>
              </ul>

              <p className="font-semibold mt-4">9.2 User Transactions</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Vyldo acts as a marketplace platform and is not party to user transactions</li>
                <li>We are not responsible for the quality, safety, or legality of services offered</li>
                <li>Users engage in transactions at their own risk</li>
                <li>We are not liable for disputes between buyers and sellers</li>
              </ul>

              <p className="font-semibold mt-4">9.3 Financial Losses</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We are not liable for financial losses due to cryptocurrency volatility</li>
                <li>Users are responsible for understanding blockchain transaction risks</li>
                <li>We are not responsible for losses due to user error or negligence</li>
              </ul>
            </div>
          </section>

          {/* 10. Modifications to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">10.</span> Modifications to Terms
            </h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>We reserve the right to modify these Terms of Service at any time</li>
                <li>Users will be notified of significant changes via email or platform notification</li>
                <li>Continued use of the platform after changes constitutes acceptance</li>
                <li>Users who disagree with changes should discontinue use of the platform</li>
              </ul>
            </div>
          </section>

          {/* 11. Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">11.</span> Governing Law and Jurisdiction
            </h2>
            <div className="space-y-3 text-gray-700">
              <ul className="list-disc pl-6 space-y-2">
                <li>These Terms are governed by international e-commerce laws</li>
                <li>Disputes will be resolved through arbitration or mediation</li>
                <li>Users agree to resolve disputes in good faith before legal action</li>
              </ul>
            </div>
          </section>

          {/* 12. Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">12.</span> Contact Information
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>For questions about these Terms of Service, please contact us:</p>
              <div className="bg-gray-50 p-4 rounded-lg mt-3">
                <p><strong>Email:</strong> support@vyldo.com</p>
                <p><strong>Help Center:</strong> <Link to="/help-center" className="text-primary-600 hover:underline">vyldo.com/help-center</Link></p>
                <p><strong>Platform:</strong> Vyldo Freelancing Marketplace</p>
              </div>
            </div>
          </section>

          {/* Acknowledgment */}
          <section className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-blue-900 mb-2">Acknowledgment</h3>
                  <p className="text-blue-800 text-sm">
                    By using Vyldo, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. You also acknowledge that you are responsible for compliance with applicable local laws.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <Link
              to="/"
              className="flex-1 bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 text-center font-semibold"
            >
              I Accept - Continue to Vyldo
            </Link>
            <Link
              to="/help-center"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 text-center font-semibold"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
