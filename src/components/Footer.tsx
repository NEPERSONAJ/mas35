import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative z-10 border-t dark:border-white/10 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-center items-center text-sm">
          <span className="dark:text-gray-400 text-gray-600">Разработал</span>
          <a
            href="https://nepersonaj.ru"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center text-amber-500 hover:text-amber-600 font-medium transition-colors"
          >
            @NEPERSONAJ
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;