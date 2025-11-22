// src/pages/ContactPage.jsx (New File)
import React from 'react';
import { Github, Linkedin, Mail } from 'lucide-react';
function ContactPage() {
  return (
    <div className="flex flex-col max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-custom-bg min-h-screen">
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-3 mb-6">
        <p className="text-[#111618] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Contact Me</p>
      </div>
      {/* Contact Info Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-[#111618] dark:text-white">Get in Touch</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* GitHub */}
          <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
            <a href="https://github.com/Vedantroy475" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
              <Github className="h-12 w-12 text-[#111618] dark:text-white" />
              <p className="text-sm font-medium text-[#111618] dark:text-white">GitHub</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vedantroy475</p>
            </a>
          </div>
          {/* LinkedIn */}
          <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
            <a href="https://www.linkedin.com/in/vedant-roy-b58117227/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2">
              <Linkedin className="h-12 w-12 text-[#0077B5]" />
              <p className="text-sm font-medium text-[#111618] dark:text-white">LinkedIn</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Vedant Roy</p>
            </a>
          </div>
          {/* Email */}
          <div className="flex flex-col items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
            <a href="mailto:vedantroy3@gmail.com" className="flex flex-col items-center gap-2">
              <Mail className="h-12 w-12 text-[#111618] dark:text-white" />
              <p className="text-sm font-medium text-[#111618] dark:text-white">Email</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 break-all">vedantroy3@gmail.com</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ContactPage;