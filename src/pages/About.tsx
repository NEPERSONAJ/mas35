import React from 'react';
import { motion } from 'framer-motion';
import { Award, Heart, Star } from 'lucide-react';

const therapists = [
  {
    name: 'Магомед Магомедов',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400',
    specialty: 'Спортивный массаж',
    experience: '12 лет опыта',
  },
  {
    name: 'Патимат Алиева',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400',
    specialty: 'Лечебный массаж',
    experience: '8 лет опыта',
  },
  {
    name: 'Амина Исаева',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400',
    specialty: 'Классический массаж',
    experience: '10 лет опыта',
  },
];

const About = () => {
  return (
    <div className="min-h-screen pt-20 pb-16">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mb-6">
            О нас
          </h1>
          <p className="text-xl dark:text-gray-300 text-gray-600 max-w-3xl mx-auto">
            С более чем 10-летним опытом в области массажа и оздоровления,
            мы создали место, где древние техники исцеления сочетаются с современным комфортом.
          </p>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            {
              icon: <Heart className="w-8 h-8 text-amber-500" />,
              title: 'Забота',
              description: 'Мы вкладываем душу в каждый сеанс',
            },
            {
              icon: <Award className="w-8 h-8 text-amber-500" />,
              title: 'Качество',
              description: 'Высочайшие стандарты обслуживания',
            },
            {
              icon: <Star className="w-8 h-8 text-amber-500" />,
              title: 'Опыт',
              description: 'Годы практики в искусстве массажа',
            },
          ].map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              className="p-6 rounded-2xl dark:bg-white/5 bg-white/80 backdrop-blur-lg border dark:border-white/10 border-black/5"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-center text-amber-500 mb-2">
                {value.title}
              </h3>
              <p className="dark:text-gray-400 text-gray-600 text-center">{value.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-12">Наши специалисты</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {therapists.map((therapist, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.2 }}
                className="group relative overflow-hidden rounded-2xl dark:bg-white/5 bg-white/80 p-6 hover:bg-white/10 transition-colors"
              >
                <div className="aspect-square overflow-hidden rounded-xl mb-4">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-semibold text-amber-500">
                  {therapist.name}
                </h3>
                <p className="dark:text-gray-300 text-gray-700">{therapist.specialty}</p>
                <p className="dark:text-gray-400 text-gray-600 text-sm">{therapist.experience}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;