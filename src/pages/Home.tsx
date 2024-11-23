import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Clock } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const Home = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery('(max-width: 768px)');

  const locations = [
    {
      city: 'Хасавюрт',
      address: 'ул. Гагарина, 61',
      mapUrl: 'https://yandex.ru/map-widget/v1/?ll=46.587512%2C43.250224&mode=whatshere&whatshere%5Bpoint%5D=46.587512%2C43.250224&z=17',
      coordinates: '43.250224,46.587512',
      searchQuery: 'Хасавюрт, улица Гагарина, 61'
    },
    {
      city: 'Астрахань',
      address: 'ул. Кремлевская 4, гостиница Азимут, 2 этаж, 206 кабинет',
      mapUrl: 'https://yandex.ru/map-widget/v1/?ll=48.033015%2C46.347542&mode=whatshere&whatshere%5Bpoint%5D=48.033015%2C46.347542&z=17',
      coordinates: '46.347542,48.033015',
      searchQuery: 'Астрахань, улица Кремлевская, 4'
    }
  ];

  const animationConfig = isMobile ? { duration: 0.3, delay: 0.1 } : { duration: 0.8, delay: 0.2 };

  return (
    <div className="relative min-h-screen">
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationConfig.duration }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: animationConfig.delay, duration: animationConfig.duration }}
            className="flex justify-center mb-8"
          >
            <Sparkles className="w-16 h-16 text-amber-500" />
          </motion.div>

          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: animationConfig.delay, duration: animationConfig.duration }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 px-2"
          >
            Откройте истинное расслабление
          </motion.h1>

          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: animationConfig.delay + 0.1, duration: animationConfig.duration }}
            className="mt-6 text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto px-2"
          >
            Испытайте идеальное сочетание традиционных техник и современного комфорта
            в нашем оазисе спокойствия.
          </motion.p>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: animationConfig.delay + 0.2, duration: animationConfig.duration }}
            className="mt-12"
          >
            <button
              onClick={() => navigate('/booking')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-full overflow-hidden shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-600 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              <span className="relative flex items-center">
                Записаться на сеанс
                <motion.span
                  className="ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationConfig.delay + 0.3, duration: animationConfig.duration }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              title: 'Опытные мастера',
              description: 'Профессионалы с многолетним опытом работы',
            },
            {
              title: 'Роскошная атмосфера',
              description: 'Спокойная обстановка для полного расслабления',
            },
            {
              title: 'Индивидуальный подход',
              description: 'Процедуры, адаптированные под ваши потребности',
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: isMobile ? 0.1 : (0.4 + index * 0.2), 
                duration: animationConfig.duration 
              }}
              className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 hover:border-amber-500/50 transition-colors"
            >
              <h3 className="text-xl font-semibold text-amber-500 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationConfig.delay + 0.4, duration: animationConfig.duration }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
            <MapPin className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Адреса</h3>
            <div className="space-y-2">
              {locations.map((loc, index) => (
                <p key={index} className="text-gray-400">
                  {loc.city}: {loc.address}
                </p>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
            <Phone className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Телефон</h3>
            <a href="tel:+79882018877" className="text-gray-400 hover:text-amber-500">
              +7 988-201-88-77
            </a>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10">
            <Clock className="w-8 h-8 text-amber-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Режим работы</h3>
            <p className="text-gray-400">Ежедневно: 10:00 - 20:00</p>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: animationConfig.delay + 0.5, duration: animationConfig.duration }}
          className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-8 px-4"
        >
          {locations.map((location, index) => (
            <div key={index} className="space-y-6">
              <h2 className="text-2xl font-bold text-center">
                {location.city}
              </h2>
              <div className="rounded-2xl overflow-hidden shadow-lg h-[300px] md:h-[400px]">
                <iframe
                  src={location.mapUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  className="w-full h-full"
                ></iframe>
              </div>
              <div className="text-center">
                <a
                  href={`https://yandex.ru/maps/?rtext=~${encodeURIComponent(location.searchQuery)}&rtt=auto`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <MapPin className="w-5 h-5 mr-2" />
                  Построить маршрут
                </a>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Home;