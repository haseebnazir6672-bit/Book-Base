import { Link } from 'react-router-dom'
import { HiOutlineLocationMarker, HiOutlineMail, HiOutlinePhone } from 'react-icons/hi'
import { FaFacebookF, FaGoogle, FaInstagram, FaPinterestP, FaSkype, FaTwitter } from 'react-icons/fa'

const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com', icon: FaFacebookF },
  { label: 'Twitter', href: 'https://twitter.com', icon: FaTwitter },
  { label: 'Google', href: 'https://google.com', icon: FaGoogle },
  { label: 'Instagram', href: 'https://instagram.com', icon: FaInstagram },
  { label: 'Pinterest', href: 'https://pinterest.com', icon: FaPinterestP },
]

function Footer() {
  return (
    <footer className="relative mt-10 overflow-hidden bg-white pt-12 sm:mt-16 sm:pt-20 dark:bg-slate-900">
      {/* Wave Background */}
      <div className="pointer-events-none absolute bottom-0 left-0 hidden w-full leading-[0] sm:block">
        <svg
          viewBox="0 0 1440 320"
          className="relative block h-[240px] w-full lg:h-[320px]"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#1e40af"
            fillOpacity="1"
            d="M0,128L48,144C96,160,192,192,288,186.7C384,181,480,139,576,149.3C672,160,768,224,864,229.3C960,235,1056,181,1152,149.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
          <path
            fill="#3b82f6"
            fillOpacity="0.4"
            d="M0,192L48,202.7C96,213,192,235,288,224C384,213,480,171,576,149.3C672,128,768,128,864,149.3C960,171,1056,213,1152,218.7C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-12 sm:px-8 sm:pb-20">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10 xl:gap-14">
          {/* About us */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">BookBase</h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Your comprehensive digital library system. Manage books, track borrowings, and explore a world of knowledge with ease.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 transition hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-400"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Get in Touch</h2>
            <ul className="mt-4 space-y-4 text-sm">
              <li className="flex gap-3 text-slate-600 dark:text-slate-400">
                <HiOutlineLocationMarker className="h-5 w-5 shrink-0 text-blue-600" />
                <span>123 Library Lane, Academic City, PK</span>
              </li>
              <li className="flex gap-3 text-slate-600 dark:text-slate-400">
                <HiOutlinePhone className="h-5 w-5 shrink-0 text-blue-600" />
                <span>+92 300 1234567</span>
              </li>
              <li className="flex gap-3 text-slate-600 dark:text-slate-400">
                <HiOutlineMail className="h-5 w-5 shrink-0 text-blue-600" />
                <a href="mailto:support@bookbase.com" className="hover:text-blue-600 transition">support@bookbase.com</a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Quick Links</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">Home</Link>
              </li>
              <li>
                <Link to="/#library-catalog" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">Library Catalog</Link>
              </li>
              <li>
                <Link to="/login" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">Login</Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Support</h2>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">Terms of Service</Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">FAQ</Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-600 transition hover:text-blue-600 dark:text-slate-400">Contact Help</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 dark:border-slate-800">
          <p className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} BookBase. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
