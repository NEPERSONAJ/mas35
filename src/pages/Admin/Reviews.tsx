import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Star, MessageSquare, User, Calendar } from 'lucide-react';

const AdminReviews = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-amber-500">Отзывы</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-lg">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-semibold">4.8</span>
            <span className="text-gray-400">/ 5.0</span>
          </div>
          <div className="bg-white/5 px-4 py-2 rounded-lg">
            <span className="font-semibold">256</span>
            <span className="text-gray-400 ml-2">отзывов</span>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск отзывов..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Фильтры
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {[
          {
            id: 1,
            author: 'Анна М.',
            rating: 5,
            date: '15.03.2024',
            comment: 'Потрясающий массаж! Очень профессиональный подход и приятная атмосфера. Обязательно приду еще раз.',
            service: 'Классический массаж',
            therapist: 'Магомед М.',
            status: 'published',
            reply: {
              author: 'Магомед М.',
              date: '15.03.2024',
              comment: 'Анна, большое спасибо за тёплые слова! Буду рад видеть вас снова.',
            },
          },
          {
            id: 2,
            author: 'Магомед К.',
            rating: 4,
            date: '14.03.2024',
            comment: 'Хороший массаж, но хотелось бы более гибкий график записи.',
            service: 'Спортивный массаж',
            therapist: 'Патимат А.',
            status: 'pending',
          },
          {
            id: 3,
            author: 'Патимат А.',
            rating: 5,
            date: '13.03.2024',
            comment: 'Прекрасный сервис! Очень внимательный персонал и отличный результат.',
            service: 'Лечебный массаж',
            therapist: 'Амина И.',
            status: 'published',
          },
        ].map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-semibold">{review.author}</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-400'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-400">{review.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  review.status === 'published'
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {review.status === 'published' ? 'Опубликован' : 'На модерации'}
                </span>
                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="ml-15">
              <p className="text-gray-300 mb-2">{review.comment}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>Услуга: {review.service}</span>
                <span>Специалист: {review.therapist}</span>
              </div>
            </div>

            {review.reply && (
              <div className="mt-4 ml-12 p-4 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <div className="flex items-center gap-3 mb-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  <div>
                    <span className="font-medium text-amber-500">{review.reply.author}</span>
                    <span className="text-sm text-gray-400 ml-2">{review.reply.date}</span>
                  </div>
                </div>
                <p className="text-gray-300">{review.reply.comment}</p>
              </div>
            )}

            {!review.reply && (
              <div className="mt-4 ml-12">
                <button className="text-amber-500 hover:text-amber-600 transition-colors text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Ответить
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminReviews;