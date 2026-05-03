import { FiFileText, FiCheckCircle, FiAlertTriangle, FiShield, FiUser } from 'react-icons/fi'

function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <FiFileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
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
              Welcome to BookBase! These Terms of Service ("Terms") govern your use of our website and services.
              By accessing or using BookBase, you agree to be bound by these Terms. If you do not agree to these Terms,
              please do not use our service.
            </p>
          </section>

          {/* Use of Service */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiUser className="w-6 h-6 text-blue-600" />
              Use of Service
            </h2>
            <p className="text-gray-600 mb-4">To use BookBase, you must:</p>
            <ul className="space-y-3 mb-4">
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>Be a student, faculty member, or staff of our institution</div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>Provide accurate and complete information when creating your account</div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>Maintain the security of your account and password</div>
              </li>
              <li className="flex items-start gap-3 text-gray-600">
                <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>Use the service only for lawful and educational purposes</div>
              </li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiShield className="w-6 h-6 text-blue-600" />
              User Responsibilities
            </h2>
            <div className="space-y-4">
              <p className="text-gray-600 leading-relaxed">
                As a user of BookBase, you are responsible for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Returning borrowed books on time",
                  "Taking proper care of borrowed materials",
                  "Respecting the rights of other users",
                  "Not sharing your account credentials",
                  "Reporting any unauthorized use of your account",
                  "Complying with all library policies and regulations"
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                    <FiCheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiAlertTriangle className="w-6 h-6 text-blue-600" />
              Prohibited Activities
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4">
              <p className="text-gray-700 mb-4">You agree not to engage in any of the following activities:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-gray-700">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>Damaging, defacing, or misusing library materials</div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>Attempting to gain unauthorized access to any part of the system</div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>Uploading or sharing malicious or inappropriate content</div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>Violating the privacy or intellectual property rights of others</div>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <FiAlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>Using the service for any illegal or unauthorized purpose</div>
                </li>
              </ul>
            </div>
          </section>

          {/* Intellectual Property */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiShield className="w-6 h-6 text-blue-600" />
              Intellectual Property
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              All content, features, and functionality on BookBase are the exclusive property of BookBase and its licensors.
              You may not copy, modify, distribute, or create derivative works based on our service without our prior written consent.
            </p>
          </section>

          {/* Termination */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiAlertTriangle className="w-6 h-6 text-blue-600" />
              Termination
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We reserve the right to terminate or suspend your account at our sole discretion, without prior notice,
              for conduct that we believe violates these Terms or is harmful to other users or our service.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiShield className="w-6 h-6 text-blue-600" />
              Limitation of Liability
            </h2>
            <p className="text-gray-600 leading-relaxed">
              BookBase shall not be liable for any indirect, incidental, special, consequential, or punitive damages,
              including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
              resulting from your access to or use of or inability to access or use the service.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
              <FiFileText className="w-6 h-6 text-blue-600" />
              Contact Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              If you have any questions about these Terms of Service, please contact us:
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

export default TermsOfServicePage
