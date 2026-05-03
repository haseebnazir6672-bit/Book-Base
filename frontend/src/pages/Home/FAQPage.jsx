import { useState } from 'react'
import { FiChevronDown, FiBookOpen, FiUser, FiShield, FiHelpCircle, FiMessageSquare } from 'react-icons/fi'

function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null)

  const faqData = [
    {
      category: 'General',
      icon: FiHelpCircle,
      questions: [
        {
          question: 'What is BookBase?',
          answer: 'BookBase is a comprehensive digital library system that helps manage books, track borrowings, and provides a platform for knowledge sharing among students, faculty, and staff.'
        },
        {
          question: 'Who can use BookBase?',
          answer: 'BookBase is available to all students, faculty members, and staff of our institution. You need a valid institutional account to access the system.'
        }
      ]
    },
    {
      category: 'Books & Borrowing',
      icon: FiBookOpen,
      questions: [
        {
          question: 'How many books can I borrow at once?',
          answer: 'Students can borrow up to 5 books at a time. Faculty members can borrow up to 10 books. The borrowing period is 14 days for students and 30 days for faculty.'
        },
        {
          question: 'How do I renew a borrowed book?',
          answer: 'You can renew a book by visiting the Student Dashboard, going to your borrowed books list, and clicking the "Renew" button. Books can be renewed up to 2 times if there are no holds.'
        },
        {
          question: 'What happens if I return a book late?',
          answer: 'Late returns incur a fine of Rs. 10 per day per book. You will not be able to borrow additional books until all overdue books are returned and fines are paid.'
        },
        {
          question: 'How do I search for books?',
          answer: 'You can search for books using the search bar on the homepage. You can search by title, author, department, or category. You can also filter books by department.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      icon: FiUser,
      questions: [
        {
          question: 'How do I create an account?',
          answer: 'Accounts are created automatically for all students and faculty. Use your institutional email and credentials to log in. If you don\'t have access, please contact the library administration.'
        },
        {
          question: 'How do I update my profile information?',
          answer: 'You can update your profile by visiting your dashboard and clicking on the profile section. You can update your contact information, profile picture, and other details.'
        },
        {
          question: 'What should I do if I forget my password?',
          answer: 'Click on the "Forgot Password" link on the login page. Enter your registered email address, and we will send you a password reset link.'
        }
      ]
    },
    {
      category: 'Knowledge Hub',
      icon: FiMessageSquare,
      questions: [
        {
          question: 'What is Knowledge Hub?',
          answer: 'Knowledge Hub is a community platform where students and faculty can share projects, research papers, notes, study materials, and more. It\'s a great place to collaborate and learn from each other.'
        },
        {
          question: 'How do I post on Knowledge Hub?',
          answer: 'Click on "Create Post" in the Knowledge Hub. Fill in the title, content, select the content type, add any attachments, and submit your post for the community to see.'
        },
        {
          question: 'Can I like and comment on posts?',
          answer: 'Yes! You can like any post by clicking the heart icon, and you can add comments to share your thoughts and feedback on posts.'
        }
      ]
    },
    {
      category: 'Privacy & Security',
      icon: FiShield,
      questions: [
        {
          question: 'Is my personal information safe?',
          answer: 'Yes! We take privacy and security very seriously. Your personal information is encrypted and stored securely. We never share your information with third parties without your consent.'
        },
        {
          question: 'How is my data used?',
          answer: 'Your data is used solely for the purpose of providing library services. This includes managing your account, processing book borrowings, and communicating important updates.'
        }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
            <FiHelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions about BookBase
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {faqData.map((category, catIndex) => (
            <div key={catIndex} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((item, qIndex) => (
                  <div 
                    key={qIndex} 
                    className="border border-gray-200 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenIndex(openIndex === `${catIndex}-${qIndex}` ? null : `${catIndex}-${qIndex}`)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="font-semibold text-gray-900 pr-4">{item.question}</span>
                      <FiChevronDown 
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          openIndex === `${catIndex}-${qIndex}` ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {openIndex === `${catIndex}-${qIndex}` && (
                      <div className="px-5 pb-5 pt-0">
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 via-indigo-700 to-slate-900 rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help!
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            <FiMessageSquare className="w-5 h-5" />
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}

export default FAQPage
