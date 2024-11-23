import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  Star,
  MessageSquare,
  ArrowUpRight,
} from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-amber-500">Панель управления</h1>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          Последнее обновление: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Записей сегодня',
            value: '12',
            change: '+20%',
            icon: Calendar,
          },
          {
            title: 'Активных клиентов',
            value: '148',
            change: '+12%',
            icon: Users,
          },
          {
            title: 'Средний рейтинг',
            value: '4.8',
            change: '+0.2',
            icon: Star,
          },
          {
            title: 'Доход за месяц',
            value: '₽145,200',
            change: '+15%',
            icon: DollarSign,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <stat.icon className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-green-500">
              <ArrowUpRight className="w-4 h-4" />
              <span className="text-sm">{stat.change}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Activity and Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Последние действия</h2>
          <div className="space-y-4">
            {[
              {
                action: 'Новая запись',
                user: 'Анна М.',
                time: '2 минуты назад',
                icon: Calendar,
              },
              {
                action: 'Новый отзыв',
                user: 'Магомед К.',
                time: '15 минут назад',
                icon: MessageSquare,
              },
              {
                action: 'Отмена записи',
                user: 'Патимат А.',
                time: '1 час назад',
                icon: Calendar,
              },
              {
                action: 'Новый клиент',
                user: 'Рамазан И.',
                time: '2 часа назад',
                icon: Users,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.action}</p>
                  <p className="text-sm text-gray-400">{item.user}</p>
                </div>
                <span className="text-sm text-gray-400">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Ближайшие записи</h2>
          <div className="space-y-4">
            {[
              {
                time: '10:00',
                client: 'Марьям С.',
                service: 'Классический массаж',
                therapist: 'Магомед М.',
              },
              {
                time: '11:30',
                client: 'Ахмед Р.',
                service: 'Спортивный массаж',
                therapist: 'Патимат А.',
              },
              {
                time: '13:00',
                client: 'Зайнаб К.',
                service: 'Лечебный массаж',
                therapist: 'Амина И.',
              },
              {
                time: '14:30',
                client: 'Исмаил М.',
                service: 'Классический массаж',
                therapist: 'Магомед М.',
              },
            ].map((appointment, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-16 text-center">
                  <span className="text-amber-500 font-medium">{appointment.time}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{appointment.client}</p>
                  <p className="text-sm text-gray-400">{appointment.service}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">{appointment.therapist}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Статистика записей</h2>
            <p className="text-sm text-gray-400">За последние 30 дней</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-sm text-gray-400">Записи</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500/50"></div>
              <span className="text-sm text-gray-400">Отмены</span>
            </div>
          </div>
        </div>
        <div className="h-64 flex items-center justify-center text-gray-400">
          График статистики
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;