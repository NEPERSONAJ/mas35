import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, User, UserRound } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  newReview: {
    name: string;
    rating: number;
    comment: string;
    gender: 'male' | 'female';
    therapistId?: number;
    serviceId?: number;
  };
  setNewReview: React.Dispatch<React.SetStateAction<{
    name: string;
    rating: number;
    comment: string;
    gender: 'male' | 'female';
    therapistId?: number;
    serviceId?: number;
  }>>;
  onSubmit: (e: React.FormEvent) => void;
}

const services = [
  {
    id: 1,
    name: 'Классический массаж',
    description: 'Традиционный массаж для расслабления и снятия напряжения',
    price: '2500₽',
    duration: '60 минут',
  },
  {
    id: 2,
    name: 'Спортивный массаж',
    description: 'Интенсивный массаж для спортсменов и активных людей',
    price: '3000₽',
    duration: '90 минут',
  },
];

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  newReview,
  setNewReview,
  onSubmit,
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const animationConfig = isMobile ? { duration: 0.3 } : { duration: 0.4 };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: animationConfig.duration }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: animationConfig.duration }}
            className="relative w-full max-w-lg z-[70]"
          >
            <div className="bg-neutral-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-4 sm:p-6 shadow-xl max-h-[calc(100vh-2rem)] overflow-y-auto">
              <div className="flex justify-between items-center mb-6 sticky top-0 bg-neutral-900/90 backdrop-blur-xl py-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-amber-500">
                  Оставить отзыв
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <form onSubmit={onSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ваш пол
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setNewReview({ ...newReview, gender: 'male' })}
                      className={`flex-1 p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                        newReview.gender === 'male'
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <User className="w-5 h-5" />
                      Мужской
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewReview({ ...newReview, gender: 'female' })}
                      className={`flex-1 p-3 rounded-lg border transition-colors flex items-center justify-center gap-2 ${
                        newReview.gender === 'female'
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <UserRound className="w-5 h-5" />
                      Женский
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Выберите услугу
                  </label>
                  <select
                    value={newReview.serviceId || ''}
                    onChange={(e) => setNewReview({ ...newReview, serviceId: Number(e.target.value) })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23d97706' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: `right 0.5rem center`,
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem'
                    }}
                    required
                  >
                    <option value="" className="bg-neutral-900 text-gray-300">Выберите услугу</option>
                    {services.map((service) => (
                      <option 
                        key={service.id} 
                        value={service.id}
                        className="bg-neutral-900 text-white"
                      >
                        {service.name} - {service.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Оценка
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            rating <= newReview.rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-gray-400'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ваш отзыв
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:flex-1 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Отправить отзыв
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReviewModal;