import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Flower2 } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const links = [
    { path: '/', label: 'Главная' },
    { path: '/booking', label: 'Запись' },
    { path: '/about', label: 'О нас' },
    { path: '/blog', label: 'Блог' },
    { path: '/reviews', label: 'Отзывы' },
    { path: '/contact', label: 'Контакты' },
  ];

  return (
    <nav className="fixed w-full z-50 backdrop-blur-lg border-b dark:border-primary-900/50 border-primary-200 dark:bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br dark:from-primary-400 dark:to-primary-600 shadow-lg">
              <Flower2 className="w-6 h-6 text-white" />
              <div className="absolute -inset-0.5 rounded-xl blur-sm bg-gradient-to-br dark:from-primary-400 dark:to-primary-600 opacity-50" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r dark:from-primary-200 dark:to-primary-400">
              InTonus
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'dark:text-gray-300 dark:hover:text-primary-300'
                }`}
              >
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-lg dark:bg-primary-900/20"
                    style={{ borderRadius: 8 }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md dark:text-gray-400 dark:hover:text-primary-300 dark:hover:bg-primary-900/20"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 dark:bg-black/90">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === link.path
                    ? 'dark:bg-primary-900/20 dark:text-primary-400'
                    : 'dark:text-gray-300 dark:hover:bg-primary-900/10 dark:hover:text-primary-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;