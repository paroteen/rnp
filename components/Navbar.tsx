import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield, User } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Requirements', path: '/requirements' },
    { name: 'Apply Now', path: '/apply' },
    { name: 'Check Status', path: '/status' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-rnp-blue text-white sticky top-0 z-50 shadow-lg border-b-4 border-rnp-gold">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center space-x-3">
              <div className="bg-white p-1 rounded-full">
                 <Shield className="h-8 w-8 text-rnp-blue" fill="#F2C438" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-none tracking-wider">RWANDA NATIONAL</span>
                <span className="font-bold text-rnp-gold text-xl leading-none tracking-wider">POLICE</span>
              </div>
            </Link>
          </div>
          
          {!isAdminPage && (
            <>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                        isActive(link.path)
                          ? 'bg-rnp-blueLight text-rnp-gold border-b-2 border-rnp-gold'
                          : 'hover:bg-rnp-blueLight hover:text-white'
                      }`}
                    >
                      {link.name}
                    </Link>
                  ))}
                  <Link to="/admin" className="ml-4 flex items-center px-3 py-2 rounded-md text-sm font-medium bg-rnp-blueLight hover:bg-opacity-80 text-gray-300">
                    <User size={16} className="mr-1" />
                    Admin
                  </Link>
                </div>
              </div>
              <div className="-mr-2 flex md:hidden">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-rnp-blueLight focus:outline-none"
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </>
          )}

          {isAdminPage && (
             <div className="hidden md:block">
                <span className="px-3 py-2 rounded-md text-sm font-bold bg-rnp-gold text-rnp-blue">
                    OFFICIAL ADMIN PANEL
                </span>
             </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && !isAdminPage && (
        <div className="md:hidden bg-rnp-blueLight">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-rnp-blue text-rnp-gold'
                    : 'text-gray-300 hover:bg-rnp-blue hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            ))}
             <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-rnp-blue hover:text-white"
              >
                Admin Panel
              </Link>
          </div>
        </div>
      )}
    </nav>
  );
};