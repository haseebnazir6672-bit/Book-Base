import { FiBookOpen, FiUsers, FiHeart, FiAward, FiCheckCircle } from 'react-icons/fi'

function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6">
            <FiBookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About BookBase</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your comprehensive digital library system dedicated to fostering a culture of reading and knowledge sharing.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FiHeart className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Mission</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To provide an accessible, efficient, and user-friendly platform that connects readers with books, facilitates knowledge exchange, and builds a vibrant academic community.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <FiAward className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Our Vision</h2>
            </div>
            <p className="text-gray-600 leading-relaxed">
              To become the leading digital library solution for educational institutions, empowering students and educators with seamless access to knowledge resources.
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: FiBookOpen,
                title: "Vast Collection",
                desc: "Access thousands of books across various departments and categories"
              },
              {
                icon: FiUsers,
                title: "Community Focused",
                desc: "Connect with peers, share knowledge, and grow together"
              },
              {
                icon: FiCheckCircle,
                title: "Easy Borrowing",
                desc: "Simple and efficient book borrowing and return process"
              },
              {
                icon: FiHeart,
                title: "Knowledge Hub",
                desc: "Share projects, research papers, and study materials"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Team</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Dedicated to providing the best library experience for our users
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Haseeb", role: "Founder & Lead Developer", color: "from-blue-500 to-indigo-600" },
              { name: "Ahmed", role: "UI/UX Designer", color: "from-purple-500 to-pink-600" },
              { name: "Zeeshan", role: "Backend Developer", color: "from-green-500 to-teal-600" }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className={`w-24 h-24 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4`}>
                  {member.name.charAt(0)}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="mailto:support@bookbase.com" className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Email Us
            </a>
            <a href="tel:+923001234567" className="px-8 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-colors border border-white/30">
              Call Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUsPage
