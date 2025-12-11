import React from 'react';
import { Shield, Facebook, Twitter, Instagram, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-rnp-blue text-white pt-10 pb-6 border-t-4 border-rnp-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-rnp-gold" />
              <span className="font-bold text-xl">RWANDA NATIONAL POLICE</span>
            </div>
            <p className="text-gray-300 text-sm max-w-xs">
              Service, Protection, and Integrity. Dedicated to ensuring the safety and security of all people in Rwanda.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-rnp-gold font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><a href="#" className="hover:text-white">Emergency: 112</a></li>
              <li><a href="#" className="hover:text-white">Traffic Police: 113</a></li>
              <li><a href="#" className="hover:text-white">Gender Based Violence: 3512</a></li>
              <li><a href="#" className="hover:text-white">Anti-Corruption: 997</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-rnp-gold font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li className="flex items-center"><MapPin size={16} className="mr-2 text-rnp-gold" /> Kacyiru, Kigali, Rwanda</li>
              <li className="flex items-center"><Phone size={16} className="mr-2 text-rnp-gold" /> +250 788 311 155</li>
              <li className="flex items-center"><Mail size={16} className="mr-2 text-rnp-gold" /> info@police.gov.rw</li>
            </ul>
            <div className="flex space-x-4 mt-4">
              <a href="#" className="text-gray-400 hover:text-rnp-gold"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-rnp-gold"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-rnp-gold"><Instagram size={20} /></a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-400">
          <p>&copy; {new Date().getFullYear()} Rwanda National Police. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};