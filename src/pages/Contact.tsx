import React from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mb-6">
            Свяжитесь с нами
          </h1>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            Мы всегда готовы ответить на ваши вопросы о наших услугах
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="dark:bg-white/5 bg-white/80 backdrop-blur-lg rounded-2xl p-8 border dark:border-white/10 border-black/5"
          >
            <form className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Имя
                </label>
                <input
                  type="text"
                  id="name"
                  className="mt-1 block w-full rounded-lg dark:bg-white/10 bg-white border dark:border-white/20 border-gray-300 px-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Ваше имя"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="mt-1 block w-full rounded-lg dark:bg-white/10 bg-white border dark:border-white/20 border-gray-300 px-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium dark:text-gray-300 text-gray-700">
                  Сообщение
                </label>
                <textarea
                  id="message"
                  rows={4}
                  className="mt-1 block w-full rounded-lg dark:bg-white/10 bg-white border dark:border-white/20 border-gray-300 px-4 py-2 dark:text-white text-gray-900 placeholder-gray-400 focus:border-amber-500 focus:ring-amber-500"
                  placeholder="Ваше сообщение..."
                />
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Отправить сообщение
              </button>
            </form>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-8"
          >
            {[
              {
                icon: <MapPin className="w-6 h-6 text-amber-500" />,
                title: 'Адрес',
                content: 'г. Хасавюрт\nул. Гагарина, 61',
              },
              {
                icon: <Phone className="w-6 h-6 text-amber-500" />,
                title: 'Телефон',
                content: '+7 988-201-88-77',
                link: 'tel:+79882018877'
              },
              {
                icon: <Clock className="w-6 h-6 text-amber-500" />,
                title: 'Режим работы',
                content: 'Ежедневно: 10:00 - 20:00',
              },
              {
                icon: <Mail className="w-6 h-6 text-amber-500" />,
                title: 'Email',
                content: 'info@intonus.ru',
                link: 'mailto:info@intonus.ru'
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-start p-6 rounded-xl dark:bg-white/5 bg-white/80 backdrop-blur-lg border dark:border-white/10 border-black/5"
              >
                <div className="flex-shrink-0">{item.icon}</div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-amber-500">{item.title}</h3>
                  {item.link ? (
                    <a href={item.link} className="mt-1 dark:text-gray-300 text-gray-600 hover:text-amber-500 whitespace-pre-line">
                      {item.content}
                    </a>
                  ) : (
                    <p className="mt-1 dark:text-gray-300 text-gray-600 whitespace-pre-line">{item.content}</p>
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;