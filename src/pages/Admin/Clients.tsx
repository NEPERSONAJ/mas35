import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, User, Phone, Calendar, Star } from 'lucide-react';

const AdminClients = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-amber-500">Клиенты</h1>
        <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2">
          <User className="w-5 h-5" />
          Добавить клиента
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск клиентов..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Фильтры
        </button>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            name: 'Анна М.',
            phone: '+7 (988) 123-45-67',
            visits: 12,
            lastVisit: '14.03.2024',
            rating: 5,
            status: 'active',
          },
          {
            name: 'Магомед К.',
            phone: '+7 (988) 234-56-78',
            visits: 8,
            lastVisit: '12.03.2024',
            rating: 4.5,
            status: 'active',
          },
          {
            name: 'Патимат А.',
            phone: '+7 (988) 345-67-89',
            visits: 5,
            lastVisit: '10.03.2024',
            rating: 5,
            status: 'inactive',
          },
          {
            name: 'Рамазан И.',
            phone: '+7 (988) 456-78-90',
            visits: 3,
            lastVisit: '08.03.2024',
            rating: 4,
            status: 'active',
          },
          {
            name: 'Марьям С.',
            phone: '+7 (988) 567-89-01',
            visits: 15,
            lastVisit: '07.03.2024',
            rating: 5,
            status: 'active',
          },
          {
            name: 'Ахмед Р.',
            phone: '+7 (988) 678-90-12',
            visits: 7,
            lastVisit: '05.03.2024',
            rating: 4.5,
            status: 'inactive',
          },
        ].map((client, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{client.name}</h3>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm">{client.rating}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Последний визит: {client.lastVisit}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Визитов: {client.visits}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  client.status === 'active'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {client.status === 'active' ? 'Активный' : 'Неактивный'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminClients;