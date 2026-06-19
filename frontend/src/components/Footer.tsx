import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-1">
            <h2 className="text-xl font-bold mb-3">⚖️ LegalNexus</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Your trusted legal intelligence platform. Connecting clients with expert lawyers across India.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="text-gray-400 text-sm hover:text-white transition">Dashboard</Link></li>
              <li><Link to="/lawyers" className="text-gray-400 text-sm hover:text-white transition">Find Lawyers</Link></li>
              <li><Link to="/cases" className="text-gray-400 text-sm hover:text-white transition">My Cases</Link></li>
              <li><Link to="/faq" className="text-gray-400 text-sm hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Services</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">Criminal Law</li>
              <li className="text-gray-400 text-sm">Family & Divorce</li>
              <li className="text-gray-400 text-sm">Corporate Law</li>
              <li className="text-gray-400 text-sm">Property Law</li>
              <li className="text-gray-400 text-sm">Cybercrime</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-200">Contact</h3>
            <ul className="space-y-2">
              <li className="text-gray-400 text-sm">📧 vedantsathe3107@gmail.com</li>
              <li className="text-gray-400 text-sm">📞 +91 72762 35682</li>
              <li className="text-gray-400 text-sm">📍 Nagpur, Maharashtra</li>
              <li className="text-gray-400 text-sm">🕐 Mon-Sat 9AM-6PM</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-gray-500 text-sm">
            © 2026 LegalNexus. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-gray-500 text-sm hover:text-white cursor-pointer transition">Privacy Policy</span>
            <span className="text-gray-500 text-sm hover:text-white cursor-pointer transition">Terms of Service</span>
            <span className="text-gray-500 text-sm hover:text-white cursor-pointer transition">Contact Us</span>
          </div>
        </div>
      </div>
    </footer>
  )
}