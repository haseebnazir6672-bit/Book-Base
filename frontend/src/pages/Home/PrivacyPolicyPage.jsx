import { FiShield, FiUser, FiLock, FiFileText, FiCheckCircle } from 'react-icons/fi'

function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <FiShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600">Last updated: May 3, 2026</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          {/* Introduction */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiFileText className="w-6 h-6 text-blue-600" />
              Introduction
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Welcome to BookBase. We respect your privacy and are committed to protecting your personal data.
              This privacy policy will inform you about how we look after your personal data when you visit our website
              and tell you about your privacy rights and how the law protects you.
            </p>
            <p className="text-gray-600 leading-relaxed">
              This privacy policy applies to our website and any related services provided by BookBase.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiUser className="w-6 h-6 text-blue-600" />
              Information We Collect
            </h2>
            <p className="text-gray-600 mb-4">We may collect the following types of information:</p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Personal Information:</strong> Name, email address, phone number, department, and student/employee ID
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Usage Data:</strong> Information about how you use our website and services
                </div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Transaction Data:</strong> Details about books you borrow, reviews you write, and other activities
                </div>
              </li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiLock className="w-6 h-6 text-blue-600" />
              How We Use Your Information
            </h2>
            <p className="text-gray-600 mb-4">We use your information for the following purposes:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {[
                "To provide and maintain our service",
                "To manage your account and user profile",
                "To process book borrowings and returns",
                "To communicate with you about our services",
                "To improve our website and services",
                "To detect and prevent fraudulent activities"
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                  <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Data Security */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiLock className="w-6 h-6 text-blue-600" />
              Data Security
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We have implemented appropriate security measures to prevent your personal data from being accidentally lost,
              used, or accessed in an unauthorized way. In addition, we limit access to your personal data to those
              employees, agents, contractors, and other third parties who have a business need to know.
            </p>
            <p className="text-gray-600 leading-relaxed">
              They will only process your personal data on our instructions and they are subject to a duty of confidentiality.
            </p>
          </section>

          {/* Your Rights */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiUser className="w-6 h-6 text-blue-600" />
              Your Rights
            </h2>
            <p className="text-gray-600 mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data:</p>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div><strong>Access:</strong> Request copies of your personal data</div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div><strong>Correction:</strong> Request that we correct any information you believe is inaccurate</div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div><strong>Erasure:</strong> Request that we erase your personal data</div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div><strong>Restriction:</strong> Request that we restrict the processing of your personal data</div>
              </li>
            </ul>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiFileText className="w-6 h-6 text-blue-600" />
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about this privacy policy or our privacy practices, please contact us:
            </p>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="font-medium w-24">Email:</span>
                  <a href="mailto:support@bookbase.com" className="text-blue-600 hover:underline">support@bookbase.com</a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="font-medium w-24">Phone:</span>
                  <span>+92 300 1234567</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="font-medium w-24">Address:</span>
                  <span>123 Library Lane, Academic City, PK</span>
                </li>
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default PrivacyPolicyPage
