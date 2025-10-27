import { Link } from 'react-router-dom';
import { Shield, Lock, AlertTriangle, CheckCircle, Users, FileText, MessageCircle, Ban } from 'lucide-react';

export default function TrustAndSafety() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Trust & Safety</h1>
          </div>
          <p className="text-gray-600">Last Updated: October 23, 2025</p>
          <p className="text-gray-600 text-lg mt-2">
            Your safety and security are our top priorities. Learn how we protect our community and what you can do to stay safe on Vyldo.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment to Safety</h2>
            <div className="space-y-3 text-gray-700">
              <p>
                At Vyldo, we are committed to creating a safe, secure, and trustworthy marketplace for freelancers and clients. We have implemented multiple layers of protection to ensure that every transaction is secure and every user is treated fairly.
              </p>
              <p>
                Our Trust & Safety team works around the clock to monitor activities, investigate reports, and take action against violations. We use advanced technology and human review to maintain the integrity of our platform.
              </p>
            </div>
          </section>

          {/* 1. Secure Payments */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">1.</span> Secure Payment System
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">Blockchain-Powered Security</h3>
                <p className="mb-2">We use Hive blockchain technology to ensure secure and transparent payments:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Escrow Protection:</strong> Payments are held securely until work is completed and approved</li>
                  <li><strong>Transparent Transactions:</strong> All payments are recorded on the blockchain for complete transparency</li>
                  <li><strong>No Chargebacks:</strong> Blockchain transactions are final, protecting sellers from fraudulent chargebacks</li>
                  <li><strong>Fast Processing:</strong> Payments are processed within seconds, not days</li>
                  <li><strong>Low Fees:</strong> Minimal transaction fees compared to traditional payment processors</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">✓ How Escrow Works:</h4>
                <ol className="list-decimal pl-6 space-y-1 text-green-800 text-sm">
                  <li>Buyer places order and payment is held in escrow</li>
                  <li>Seller delivers work according to requirements</li>
                  <li>Buyer reviews and approves the delivery</li>
                  <li>Payment is released to seller's wallet</li>
                  <li>If there's a dispute, our team mediates and makes a fair decision</li>
                </ol>
              </div>
            </div>
          </section>

          {/* 2. Identity Verification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">2.</span> User Verification
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>We verify users to maintain trust and prevent fraud:</p>
              
              <div>
                <h3 className="font-semibold mb-2">Account Verification</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Email Verification:</strong> All users must verify their email address</li>
                  <li><strong>Phone Verification:</strong> Optional but recommended for enhanced security</li>
                  <li><strong>Hive Account:</strong> Users must link a valid Hive blockchain account</li>
                  <li><strong>Profile Completion:</strong> Complete profiles help build trust in the community</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Seller Verification</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Portfolio review to ensure quality and authenticity</li>
                  <li>Skills assessment for certain categories</li>
                  <li>Identity verification for high-volume sellers</li>
                  <li>Regular performance monitoring</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Community Guidelines */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">3.</span> Community Guidelines
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>All users must follow our community guidelines to maintain a safe environment:</p>
              
              <div>
                <h3 className="font-semibold mb-2">✓ Expected Behavior</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Treat all users with respect and professionalism</li>
                  <li>Communicate clearly and honestly</li>
                  <li>Deliver work as described in gig listings</li>
                  <li>Respond to messages within 24 hours</li>
                  <li>Resolve disputes amicably and professionally</li>
                  <li>Provide accurate information in your profile and gigs</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-red-700">✗ Prohibited Behavior</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Fraud and Scams:</strong> Any attempt to deceive or defraud other users</li>
                  <li><strong>Harassment:</strong> Bullying, threats, or abusive language</li>
                  <li><strong>Spam:</strong> Unsolicited messages or promotional content</li>
                  <li><strong>Impersonation:</strong> Pretending to be someone else</li>
                  <li><strong>Off-Platform Transactions:</strong> Attempting to bypass Vyldo's payment system</li>
                  <li><strong>Multiple Accounts:</strong> Creating multiple accounts to manipulate reviews or ratings</li>
                  <li><strong>Fake Reviews:</strong> Posting false reviews or buying/selling reviews</li>
                  <li><strong>Copyright Infringement:</strong> Using copyrighted material without permission</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Reporting System */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">4.</span> Report Violations
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>If you encounter any violations or suspicious activity, please report it immediately:</p>
              
              <div>
                <h3 className="font-semibold mb-2">How to Report</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>User Profiles:</strong> Click the "Report User" button on any profile</li>
                  <li><strong>Gigs:</strong> Use the "Report Gig" option on gig pages</li>
                  <li><strong>Messages:</strong> Report inappropriate messages directly in the chat</li>
                  <li><strong>Orders:</strong> Contact support through the order page</li>
                  <li><strong>General Issues:</strong> Submit a support ticket through our <Link to="/help-center" className="text-primary-600 hover:underline">Help Center</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">What to Include in Your Report</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Detailed description of the issue</li>
                  <li>Screenshots or evidence (if available)</li>
                  <li>Usernames or order numbers involved</li>
                  <li>Date and time of the incident</li>
                  <li>Any relevant communication or transaction records</li>
                </ul>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">📞 Emergency Contact</h4>
                <p className="text-blue-800 text-sm">
                  For urgent safety concerns or threats, contact our Trust & Safety team immediately at <strong>safety@vyldo.com</strong>. We respond to urgent reports within 1 hour.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">5.</span> Dispute Resolution
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>If you have a disagreement with another user, follow these steps:</p>
              
              <div>
                <h3 className="font-semibold mb-2">Step 1: Direct Communication</h3>
                <p>Try to resolve the issue directly with the other party through Vyldo's messaging system. Most disputes can be resolved through clear communication.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 2: Request Revision</h3>
                <p>If you're a buyer and the work doesn't meet requirements, request a revision. Sellers should accommodate reasonable revision requests as specified in their gig packages.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Step 3: Open a Dispute</h3>
                <p>If direct communication fails, you can open a formal dispute:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Go to the order page and click "Open Dispute"</li>
                  <li>Provide detailed information and evidence</li>
                  <li>Our team will review within 24-48 hours</li>
                  <li>Both parties will have a chance to present their case</li>
                  <li>We'll make a fair decision based on evidence and platform policies</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Our Commitment</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fair and impartial review of all disputes</li>
                  <li>Decisions based on evidence and platform policies</li>
                  <li>Protection for both buyers and sellers</li>
                  <li>Clear communication throughout the process</li>
                  <li>Final decisions are binding and enforced</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Account Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">6.</span> Protect Your Account
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <p>Follow these best practices to keep your account secure:</p>
              
              <div>
                <h3 className="font-semibold mb-2">Password Security</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use a strong, unique password (at least 8 characters with uppercase, lowercase, numbers, and symbols)</li>
                  <li>Never share your password with anyone</li>
                  <li>Change your password regularly</li>
                  <li>Don't use the same password for multiple sites</li>
                  <li>Enable two-factor authentication if available</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recognize Phishing Attempts</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Vyldo will never ask for your password via email or message</li>
                  <li>Be suspicious of urgent requests for personal information</li>
                  <li>Check email sender addresses carefully</li>
                  <li>Don't click on suspicious links</li>
                  <li>Always access Vyldo directly through your browser</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Safe Communication</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Keep all communication on Vyldo's platform</li>
                  <li>Don't share personal contact information unnecessarily</li>
                  <li>Be cautious of requests to move communication off-platform</li>
                  <li>Report suspicious messages immediately</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Enforcement Actions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Ban className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">7.</span> Enforcement Actions
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>When violations are confirmed, we take appropriate action to protect our community:</p>
              
              <div>
                <h3 className="font-semibold mb-2">Warning System</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>First Offense:</strong> Written warning and education about policies</li>
                  <li><strong>Second Offense:</strong> Temporary suspension (7-30 days)</li>
                  <li><strong>Third Offense:</strong> Permanent account ban</li>
                  <li><strong>Severe Violations:</strong> Immediate permanent ban without warning</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Immediate Ban Offenses</h3>
                <p className="mb-2">The following violations result in immediate permanent ban:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fraud or scamming</li>
                  <li>Identity theft or impersonation</li>
                  <li>Threats or harassment</li>
                  <li>Illegal activities</li>
                  <li>Sharing explicit or harmful content</li>
                  <li>Repeated policy violations after warnings</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Appeal Process</h3>
                <p>If you believe your account was suspended or banned in error:</p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Email appeals@vyldo.com with your case details</li>
                  <li>Provide evidence supporting your appeal</li>
                  <li>We'll review within 7 business days</li>
                  <li>Our decision after review is final</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 8. Safety Tips */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">8.</span> Safety Tips
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">For Buyers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Check seller ratings and reviews before ordering</li>
                  <li>Read gig descriptions carefully</li>
                  <li>Communicate requirements clearly</li>
                  <li>Use Vyldo's messaging system for all communication</li>
                  <li>Review delivered work within 3 days</li>
                  <li>Leave honest reviews to help other buyers</li>
                  <li>Report any suspicious behavior immediately</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">For Sellers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create accurate and detailed gig descriptions</li>
                  <li>Set realistic delivery times</li>
                  <li>Respond to buyer inquiries promptly</li>
                  <li>Deliver high-quality work on time</li>
                  <li>Keep all files and communication on Vyldo</li>
                  <li>Be professional in all interactions</li>
                  <li>Report unreasonable or abusive buyers</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Red Flags to Watch For</h4>
                <ul className="list-disc pl-6 space-y-1 text-yellow-800 text-sm">
                  <li>Requests to communicate off-platform</li>
                  <li>Offers that seem too good to be true</li>
                  <li>Pressure to complete transactions quickly</li>
                  <li>Requests for personal financial information</li>
                  <li>Sellers with no reviews or incomplete profiles</li>
                  <li>Buyers asking for work before payment</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="border-t pt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Trust & Safety Team</h2>
            
            <div className="space-y-3 text-gray-700">
              <p>Our Trust & Safety team is here to help. Contact us if you have concerns:</p>
              
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <div>
                  <p className="font-semibold text-gray-900">General Safety Concerns:</p>
                  <p className="text-primary-600">safety@vyldo.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Report Violations:</p>
                  <Link to="/help-center" className="text-primary-600 hover:underline">Submit a Support Ticket</Link>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Appeal Suspensions:</p>
                  <p className="text-primary-600">appeals@vyldo.com</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Response Time:</p>
                  <p className="text-gray-700">Urgent: Within 1 hour | Standard: Within 24 hours</p>
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
              Back to Home
            </Link>
            <Link
              to="/help-center"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 text-center font-semibold"
            >
              Get Help
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
