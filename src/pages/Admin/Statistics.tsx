import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const AdminStatistics = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-500">Статистика</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Общий доход',
            value: '₽145,200',
            change: '+12.5%',
            isPositive: true,
            icon: DollarSign,
          },
          {
            title: 'Новые клиенты',
            value: '48',
            change: '+22.4%',
            isPositive: true,
            icon: Users,
          },
          {
            title: 'Записей',
            value: '156',
            change: '-4.3%',
            isPositive: false,
            icon: Calendar,
          },
          {
            title: 'Конверсия',
            value: '64.2%',
            change: '+6.8%',
            isPositive: true,
            icon: TrendingUp,
          },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">{stat.title}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <stat.icon className="w-6 h-6 text-amber-500" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {stat.isPositive ? (
                <ArrowUp className="w-4 h-4 text-green-500" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm ${
                stat.isPositive ? 'text-green-500' : 'text-red-500'
              }`}>
                {stat.change}
              </span>
              <span className="text-gray-400 text-sm">vs прошлый месяц</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Доход по месяцам</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">График дохода</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">Популярные услуги</h3>
          <div className="h-64 flex items-center justify-center">
            <p className="text-gray-400">График услуг</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Последние действия</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between py-3 border-b border-white/10 last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Новая запись на массаж</p>
                  <p className="text-xs text-gray-400">2 минуты назад</p>
                </div>
              </div>
              <span className="text-sm text-gray-400">Анна М.</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;