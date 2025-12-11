import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FileText, Users, Award, Shield, Bell } from 'lucide-react';
import { getSystemConfig } from '../services/storageService';

export const Home: React.FC = () => {
  const [announcement, setAnnouncement] = useState<string | null>(null);

  useEffect(() => {
    const config = getSystemConfig();
    if (config.announcement) {
      setAnnouncement(config.announcement);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Global Announcement Banner */}
      {announcement && (
        <div className="bg-red-600 text-white px-4 py-3 shadow-md flex items-center justify-center animate-pulse">
            <Bell size={18} className="mr-2 text-yellow-300" />
            <span className="font-bold tracking-wide">{announcement}</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="relative bg-rnp-blue text-white overflow-hidden flex-grow flex items-center">
        {/* Background Pattern - reliable CSS only, no external images */}
        <div className="absolute inset-0 bg-gradient-to-br from-rnp-blue via-[#0f2452] to-black"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#F2C438 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Decorative Circle */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-rnp-gold opacity-10 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500 opacity-10 blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 text-center md:text-left z-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-900 border border-blue-700 text-blue-200 text-xs font-bold mb-6 tracking-wide uppercase">
              <Shield size={12} className="mr-2 text-rnp-gold" /> Official Recruitment Portal
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Serve With <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rnp-gold to-yellow-200">Integrity & Honor</span>
            </h1>
            <p className="mt-4 max-w-lg text-xl text-gray-300 font-medium">
              Join the Rwanda National Police. Build a career dedicated to the safety, security, and prosperity of our nation.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link
                to="/apply"
                className="px-8 py-4 bg-rnp-gold text-rnp-blue font-bold rounded-lg shadow-lg hover:bg-yellow-400 transition-all transform hover:translate-y-[-2px] text-lg flex items-center justify-center"
              >
                Start Application <ArrowRight className="ml-2" />
              </Link>
              <Link
                to="/status"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-lg hover:bg-white/20 transition-colors text-lg flex items-center justify-center"
              >
                Check Status
              </Link>
            </div>
          </div>
          
          {/* Hero Graphic / Illustration placeholder */}
          <div className="md:w-1/2 mt-12 md:mt-0 relative z-10 flex justify-center">
             <div className="relative w-80 h-80 md:w-96 md:h-96 bg-gradient-to-tr from-rnp-gold to-yellow-600 rounded-full p-1 shadow-2xl animate-fade-in-up">
                <div className="w-full h-full bg-rnp-blue rounded-full flex items-center justify-center border-4 border-rnp-blue relative overflow-hidden">
                    <Shield size={160} className="text-white opacity-20 absolute" />
                    <div className="text-center z-10">
                        <span className="block text-6xl font-black text-white">RNP</span>
                        <span className="block text-sm text-rnp-gold font-bold tracking-[0.3em] mt-2">Service - Protection - Integrity</span>
                    </div>
                </div>
                {/* Floating Badges */}
                <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg flex items-center animate-bounce duration-[3000ms]">
                    <div className="bg-green-100 p-2 rounded-full mr-3"><CheckCircle className="text-green-600" size={20} /></div>
                    <div>
                        <p className="text-xs text-gray-500 font-bold uppercase">Status</p>
                        <p className="text-sm font-bold text-gray-900">Recruitment Open</p>
                    </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Highlights Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-rnp-blue">Why Join The Force?</h2>
            <div className="w-24 h-1 bg-rnp-gold mx-auto mt-4 rounded"></div>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">Be part of a disciplined, professional force dedicated to maintaining law and order.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-rnp-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Users className="text-rnp-gold" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Community Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Work hand-in-hand with citizens to solve local problems, prevent crime, and build a safer society for everyone.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-rnp-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Award className="text-rnp-gold" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Career Development</h3>
              <p className="text-gray-600 leading-relaxed">
                Gain specialized skills in forensics, cyber security, traffic management, and leadership through world-class training.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 group">
              <div className="w-14 h-14 bg-rnp-blue rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <FileText className="text-rnp-gold" size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Stable Future</h3>
              <p className="text-gray-600 leading-relaxed">
                Enjoy a secure career with competitive benefits, health insurance, and opportunities for international missions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-rnp-blueLight py-16 border-t border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-6 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">Ready to serve your country?</h2>
            <p className="text-gray-300">Check the requirements to see if you are eligible for the current intake.</p>
          </div>
          <Link
            to="/requirements"
            className="px-8 py-3 bg-white text-rnp-blue font-bold rounded-lg shadow hover:bg-gray-100 transition-colors"
          >
            View Requirements
          </Link>
        </div>
      </div>
    </div>
  );
};