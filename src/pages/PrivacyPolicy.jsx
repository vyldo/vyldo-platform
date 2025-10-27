import { Link } from 'react-router-dom';
import { Shield, Lock, Eye, Database, UserCheck, Bell } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          <p className="text-gray-600">Last Updated: October 23, 2025</p>
          <p className="text-sm text-gray-500 mt-2">
            Your privacy is important to us. This policy explains how we collect, use, and protect your information.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Eye className="w-6 h-6 text-primary-600" />
              Introduction
            </h2>
            <div className="space-y-3 text-gray-700">
              <p>
                Welcome to Vyldo's Privacy Policy. We are committed to protecting your personal information and your right to privacy. This policy describes what information we collect, how we use it, and what rights you have regarding your data.
              </p>
              <p>
                Vyldo is a freelancing marketplace that connects buyers and sellers for digital services. We use Hive blockchain technology for secure payments, which means some transaction data is publicly recorded on the blockchain.
              </p>
              <p>
                By using Vyldo, you agree to the collection and use of information in accordance with this Privacy Policy.
              </p>
            </div>
          </section>

          {/* 1. Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Database className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">1.</span> Information We Collect
            </h2>
            
            <div className="space-y-4 text-gray-700">
              <div>
                <h3 className="font-semibold text-lg mb-2">1.1 Information You Provide to Us</h3>
                <p className="mb-2">When you register and use Vyldo, you provide us with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Account Information:</strong> Email address, username, display name, password</li>
                  <li><strong>Profile Information:</strong> Avatar/profile picture, bio, tagline, skills, languages, education, work experience</li>
                  <li><strong>Contact Information:</strong> Phone number (optional), Hive account username</li>
                  <li><strong>Service Information:</strong> Gig titles, descriptions, pricing, delivery times, portfolio images</li>
                  <li><strong>Payment Information:</strong> Hive wallet address for withdrawals</li>
                  <li><strong>Communication Data:</strong> Messages, order requirements, reviews, support tickets</li>
                  <li><strong>Identity Verification:</strong> Documents submitted for account verification (if required)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">1.2 Information Collected Automatically</h3>
                <p className="mb-2">When you use Vyldo, we automatically collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Device Information:</strong> IP address, browser type, operating system, device type</li>
                  <li><strong>Usage Data:</strong> Pages visited, time spent on pages, clicks, search queries</li>
                  <li><strong>Location Data:</strong> Approximate location based on IP address</li>
                  <li><strong>Cookies and Tracking:</strong> Session cookies, authentication tokens, preferences</li>
                  <li><strong>Transaction Data:</strong> Order history, payment amounts, transaction timestamps</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">1.3 Blockchain Data</h3>
                <p className="mb-2">Because we use Hive blockchain for payments:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment transactions are recorded on the public Hive blockchain</li>
                  <li>Your Hive username and transaction amounts are publicly visible on the blockchain</li>
                  <li>Blockchain data cannot be deleted or modified once recorded</li>
                  <li>We do not control blockchain data - it is managed by the Hive network</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">2.</span> How We Use Your Information
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>We use your information for the following purposes:</p>
              
              <div>
                <h3 className="font-semibold mb-2">2.1 Provide and Maintain Services</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Create and manage your account</li>
                  <li>Process orders and payments</li>
                  <li>Enable communication between buyers and sellers</li>
                  <li>Display your profile and gigs to other users</li>
                  <li>Process withdrawal requests</li>
                  <li>Provide customer support</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.2 Improve and Personalize Experience</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Recommend relevant gigs and services</li>
                  <li>Analyze usage patterns to improve platform features</li>
                  <li>Personalize search results and recommendations</li>
                  <li>Remember your preferences and settings</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.3 Security and Fraud Prevention</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Detect and prevent fraudulent activities</li>
                  <li>Monitor for suspicious behavior or policy violations</li>
                  <li>Verify user identity when necessary</li>
                  <li>Protect against unauthorized access</li>
                  <li>Resolve disputes between users</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.4 Communication</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Send order updates and notifications</li>
                  <li>Respond to support requests</li>
                  <li>Send important platform announcements</li>
                  <li>Notify you of policy changes</li>
                  <li>Send marketing emails (with your consent - you can opt out)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">2.5 Legal Compliance</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comply with legal obligations and regulations</li>
                  <li>Respond to legal requests and court orders</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Protect our rights and property</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">3.</span> How We Share Your Information
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <div>
                <h3 className="font-semibold mb-2">3.1 Public Information</h3>
                <p className="mb-2">The following information is publicly visible to all users:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Username, display name, and avatar</li>
                  <li>Bio, tagline, and profile description</li>
                  <li>Skills, languages, education, and experience</li>
                  <li>Gig listings, descriptions, and portfolio images</li>
                  <li>Reviews and ratings</li>
                  <li>Profile completion percentage</li>
                  <li>Member since date and total orders completed</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.2 With Other Users</h3>
                <p className="mb-2">When you interact with other users, we share:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your profile information with buyers/sellers you work with</li>
                  <li>Order details and communication messages</li>
                  <li>Delivery files and attachments</li>
                  <li>Contact information (if you choose to share it)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.3 Service Providers</h3>
                <p className="mb-2">We share information with trusted service providers who help us operate:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Cloud hosting providers (for data storage)</li>
                  <li>Email service providers (for notifications)</li>
                  <li>Analytics providers (to understand usage patterns)</li>
                  <li>Payment processors (Hive blockchain network)</li>
                  <li>Customer support tools</li>
                </ul>
                <p className="text-sm italic mt-2">These providers are contractually obligated to protect your data and use it only for specified purposes.</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.4 Legal Requirements</h3>
                <p className="mb-2">We may disclose your information if required to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comply with legal obligations or court orders</li>
                  <li>Respond to government or law enforcement requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Prevent fraud or illegal activities</li>
                  <li>Enforce our Terms of Service</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">3.5 Business Transfers</h3>
                <p>If Vyldo is involved in a merger, acquisition, or sale of assets, your information may be transferred to the new owner. We will notify you before your information is transferred and becomes subject to a different privacy policy.</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="font-semibold text-green-900">✓ What We DON'T Do:</p>
                <ul className="list-disc pl-6 space-y-1 text-green-800 text-sm mt-2">
                  <li>We do NOT sell your personal information to third parties</li>
                  <li>We do NOT share your email or phone number with other users without permission</li>
                  <li>We do NOT use your data for purposes other than those stated in this policy</li>
                  <li>We do NOT share your private messages with anyone except the intended recipient</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 4. Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">4.</span> Data Security
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>We take data security seriously and implement multiple measures to protect your information:</p>
              
              <div>
                <h3 className="font-semibold mb-2">4.1 Technical Security Measures</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Encryption:</strong> All data transmitted between your device and our servers is encrypted using SSL/TLS</li>
                  <li><strong>Password Protection:</strong> Passwords are hashed using bcrypt with 12 salt rounds</li>
                  <li><strong>Secure Storage:</strong> Data is stored on secure servers with restricted access</li>
                  <li><strong>Regular Backups:</strong> We maintain regular backups to prevent data loss</li>
                  <li><strong>Firewall Protection:</strong> Our servers are protected by enterprise-grade firewalls</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.2 Access Controls</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Only authorized personnel have access to user data</li>
                  <li>Admin and team members have role-based access permissions</li>
                  <li>All access to sensitive data is logged and monitored</li>
                  <li>Two-factor authentication for admin accounts</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">4.3 Your Responsibility</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Keep your password secure and don't share it with others</li>
                  <li>Use a strong, unique password for your Vyldo account</li>
                  <li>Log out from shared or public devices</li>
                  <li>Report suspicious activity immediately</li>
                  <li>Keep your email account secure (password reset emails are sent there)</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="font-semibold text-yellow-900">⚠️ Important Note:</p>
                <p className="text-yellow-800 text-sm mt-2">
                  While we implement strong security measures, no system is 100% secure. We cannot guarantee absolute security of your data. You use Vyldo at your own risk.
                </p>
              </div>
            </div>
          </section>

          {/* 5. Your Privacy Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">5.</span> Your Privacy Rights
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>You have the following rights regarding your personal information:</p>
              
              <div>
                <h3 className="font-semibold mb-2">5.1 Access and Portability</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can access your account information at any time through your profile settings</li>
                  <li>You can request a copy of all your data by contacting support</li>
                  <li>We will provide your data in a machine-readable format (JSON/CSV)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.2 Correction and Update</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can update your profile information at any time</li>
                  <li>You can change your password in account settings</li>
                  <li>Contact support if you need help updating information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.3 Deletion</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can request account deletion by contacting support</li>
                  <li>We will delete your account within 30 days of request</li>
                  <li>Some information may be retained for legal or business purposes</li>
                  <li>Blockchain transaction data cannot be deleted (it's permanent on the blockchain)</li>
                  <li>Reviews and public content may be anonymized instead of deleted</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.4 Opt-Out of Marketing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can unsubscribe from marketing emails using the link in any email</li>
                  <li>You can disable notifications in your account settings</li>
                  <li>You will still receive important transactional emails (order updates, etc.)</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">5.5 Object to Processing</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can object to certain data processing activities</li>
                  <li>Contact support to discuss your concerns</li>
                  <li>We will respond within 30 days</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 6. Cookies and Tracking */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">6.</span> Cookies and Tracking Technologies
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>We use cookies and similar technologies to improve your experience:</p>
              
              <div>
                <h3 className="font-semibold mb-2">6.1 Types of Cookies We Use</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential Cookies:</strong> Required for login, authentication, and basic functionality</li>
                  <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                  <li><strong>Analytics Cookies:</strong> Help us understand how users interact with the platform</li>
                  <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">6.2 Managing Cookies</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You can control cookies through your browser settings</li>
                  <li>Disabling cookies may affect platform functionality</li>
                  <li>Essential cookies cannot be disabled as they're required for the platform to work</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 7. Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">7.</span> Data Retention
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>We retain your information for as long as necessary to provide services and comply with legal obligations:</p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Active Accounts:</strong> Data retained while your account is active</li>
                <li><strong>Deleted Accounts:</strong> Most data deleted within 30 days, some retained for legal purposes</li>
                <li><strong>Transaction Records:</strong> Retained for 7 years for tax and legal compliance</li>
                <li><strong>Support Tickets:</strong> Retained for 2 years for quality assurance</li>
                <li><strong>Blockchain Data:</strong> Permanent and cannot be deleted</li>
                <li><strong>Backup Data:</strong> Removed from backups within 90 days of deletion</li>
              </ul>
            </div>
          </section>

          {/* 8. Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">8.</span> Children's Privacy
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>
                Vyldo is not intended for users under 18 years of age. We do not knowingly collect information from children under 18. If we discover that a child under 18 has provided us with personal information, we will delete it immediately.
              </p>
              <p>
                If you are a parent or guardian and believe your child has provided us with information, please contact us at support@vyldo.com.
              </p>
            </div>
          </section>

          {/* 9. International Users */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">9.</span> International Data Transfers
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>
                Vyldo is accessible globally. Your information may be transferred to and processed in countries other than your own. These countries may have different data protection laws.
              </p>
              <p>
                By using Vyldo, you consent to the transfer of your information to our servers and service providers, wherever they are located.
              </p>
              <p>
                We take appropriate measures to ensure your data is protected according to this Privacy Policy, regardless of where it is processed.
              </p>
            </div>
          </section>

          {/* 10. Changes to Privacy Policy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-600" />
              <span className="text-primary-600">10.</span> Changes to This Privacy Policy
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>We will notify you of significant changes via email or platform notification</li>
                <li>The "Last Updated" date at the top will be changed</li>
                <li>Continued use of Vyldo after changes constitutes acceptance</li>
                <li>We encourage you to review this policy periodically</li>
              </ul>
            </div>
          </section>

          {/* 11. Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-primary-600">11.</span> Contact Us
            </h2>
            
            <div className="space-y-3 text-gray-700">
              <p>If you have questions about this Privacy Policy or how we handle your data, please contact us:</p>
              
              <div className="bg-gray-50 p-6 rounded-lg mt-4">
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold text-gray-900">Email Support:</p>
                    <p className="text-primary-600">support@vyldo.com</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Help Center:</p>
                    <Link to="/help-center" className="text-primary-600 hover:underline">
                      vyldo.com/help-center
                    </Link>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Data Protection Requests:</p>
                    <p className="text-gray-700">For data access, correction, or deletion requests, email us at support@vyldo.com with "Data Request" in the subject line.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Response Time:</p>
                    <p className="text-gray-700">We will respond to your privacy-related inquiries within 30 days.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Summary Box */}
          <section className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-bold text-blue-900 mb-3 text-lg">📋 Privacy Policy Summary</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <p className="font-semibold mb-2">We Collect:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Account & profile information</li>
                    <li>• Usage data & device info</li>
                    <li>• Transaction & payment data</li>
                    <li>• Communication messages</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">We Use It For:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Providing services</li>
                    <li>• Improving platform</li>
                    <li>• Security & fraud prevention</li>
                    <li>• Communication</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">We Share With:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Other users (public info)</li>
                    <li>• Service providers</li>
                    <li>• Legal authorities (if required)</li>
                    <li>• NOT sold to third parties</li>
                  </ul>
                </div>
                <div>
                  <p className="font-semibold mb-2">Your Rights:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Access your data</li>
                    <li>• Correct information</li>
                    <li>• Delete account</li>
                    <li>• Opt-out of marketing</li>
                  </ul>
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
              I Understand - Continue to Vyldo
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
