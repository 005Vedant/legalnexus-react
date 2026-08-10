import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null)

  return (
    <footer className="bg-legalnexus-nav text-white mt-16">
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
              <li><Link to="/lawyers" className="text-gray-400 text-sm hover:text-white transition">Criminal Law</Link></li>
              <li><Link to="/lawyers" className="text-gray-400 text-sm hover:text-white transition">Family & Divorce</Link></li>
              <li><Link to="/lawyers" className="text-gray-400 text-sm hover:text-white transition">Corporate Law</Link></li>
              <li><Link to="/lawyers" className="text-gray-400 text-sm hover:text-white transition">Property Law</Link></li>
              <li><Link to="/lawyers" className="text-gray-400 text-sm hover:text-white transition">Cybercrime</Link></li>
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
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/60 text-sm">
            © 2026 LegalNexus. All rights reserved.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveModal('privacy')}
              className="text-white/60 text-sm hover:text-white transition bg-transparent border-none p-0 cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('terms')}
              className="text-white/60 text-sm hover:text-white transition bg-transparent border-none p-0 cursor-pointer"
            >
              Terms of Service
            </button>
            <a
              href="mailto:vedantsathe3107@gmail.com?subject=LegalNexus%20Inquiry"
              className="text-white/60 text-sm hover:text-white transition no-underline"
            >
              Contact Us
            </a>
          </div>
        </div>
      </div>

      {/* Privacy Policy & Terms Modal */}
      {activeModal && (
        <Dialog.Root open={!!activeModal} onOpenChange={() => setActiveModal(null)}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-fadeIn" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-lg w-[90vw] max-h-[85vh] overflow-y-auto z-50 shadow-2xl border border-slate-200">
              <Dialog.Title className="text-xl font-bold mb-4 text-slate-900">
                {activeModal === 'privacy' ? '🔒 Privacy Policy' : '📜 Terms of Service'}
              </Dialog.Title>
              <div className="text-sm text-slate-600 space-y-3 leading-relaxed">
                {activeModal === 'privacy' ? (
                  <>
                    <p>At LegalNexus, we take your privacy and confidentiality seriously. All communications between clients and lawyers are encrypted and strictly protected.</p>
                    <p>We do not share your personal identification or case documents with third parties without your explicit authorization.</p>
                    <p>You can request account or document deletion at any time by reaching out to our support team.</p>
                  </>
                ) : (
                  <>
                    <p>Welcome to LegalNexus. By accessing or using our legal intelligence platform, you agree to comply with our terms of service.</p>
                    <p>LegalNexus serves as a bridge connecting clients with independent verified legal professionals across India.</p>
                    <p>All legal advice and representation are directly provided by licensed lawyers. Please verify your details when submitting case information.</p>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Dialog.Close asChild>
                  <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition">
                    Close
                  </button>
                </Dialog.Close>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </footer>
  )
}