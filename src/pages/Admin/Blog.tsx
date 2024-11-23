import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical } from 'lucide-react';

const AdminBlog = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-amber-500">Управление блогом</h1>
        <button className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Новая статья
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search and Filter */}
        <div className="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск статей..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
            />
          </div>
          <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Фильтры
          </button>
        </div>

        {/* Blog Posts */}
        {[1, 2, 3, 4, 5, 6].map((post) => (
          <motion.div
            key={post}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group"
          >
            <div className="relative h-48">
              <img
                src={`https://source.unsplash.com/random/800x600?massage&${post}`}
                alt="Blog post"
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
              />
              <div className="absolute top-2 right-2">
                <button className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors">
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-amber-500">12 марта 2024</span>
                <span className="text-sm text-gray-400">Просмотров: 245</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-white">
                Польза массажа для здоровья
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                Узнайте, как регулярный массаж может улучшить ваше физическое и ментальное здоровье...
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded-full">
                  Здоровье
                </span>
                <span className="px-2 py-1 text-xs bg-amber-500/10 text-amber-500 rounded-full">
                  Массаж
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminBlog;