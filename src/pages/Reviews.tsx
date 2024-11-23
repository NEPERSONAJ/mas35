import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Star, PenSquare, Users, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import ReviewModal from '../components/ReviewModal';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  gender: 'male' | 'female';
  therapistId: number;
  therapistName: string;
  serviceType: string;
  reply?: {
    date: string;
    comment: string;
  };
}

const getAvatarUrl = (seed: number, gender: 'male' | 'female') => {
  const style = gender === 'male' ? 'avataaars' : 'avataaars-female';
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b45309`;
};

const initialReviews: Review[] = [
  {
    id: 1,
    name: 'Анна М.',
    rating: 5,
    date: '2024-03-15',
    comment: 'Потрясающий массаж! Очень профессиональный подход и приятная атмосфера. Обязательно приду еще раз.',
    gender: 'female',
    therapistId: 1,
    therapistName: 'Магомед Магомедов',
    serviceType: 'Спортивный массаж',
    reply: {
      date: '2024-03-15',
      comment: 'Анна, большое спасибо за тёплые слова! Буду рад видеть вас снова.'
    }
  },
  {
    id: 2,
    name: 'Магомед К.',
    rating: 5,
    date: '2024-03-14',
    comment: 'Регулярно хожу на массаж спины. Результат заметен после первого сеанса. Рекомендую!',
    gender: 'male',
    therapistId: 2,
    therapistName: 'Патимат Алиева',
    serviceType: 'Лечебный массаж',
    reply: {
      date: '2024-03-14',
      comment: 'Магомед, спасибо за доверие! Очень рада, что вы отмечаете положительный эффект.'
    }
  },
  {
    id: 3,
    name: 'Патимат А.',
    rating: 4,
    date: '2024-03-13',
    comment: 'Хороший сервис, внимательный персонал. Единственное - хотелось бы более гибкий график.',
    gender: 'female',
    therapistId: 3,
    therapistName: 'Амина Исаева',
    serviceType: 'Классический массаж'
  },
  {
    id: 4,
    name: 'Ахмед Р.',
    rating: 5,
    date: '2024-03-12',
    comment: 'Отличный спортивный массаж! После тренировок - именно то, что нужно.',
    gender: 'male',
    therapistId: 1,
    therapistName: 'Магомед Магомедов',
    serviceType: 'Спортивный массаж'
  },
  {
    id: 5,
    name: 'Марьям С.',
    rating: 5,
    date: '2024-03-11',
    comment: 'Прекрасный массаж и очень уютная атмосфера. Спасибо за профессионализм!',
    gender: 'female',
    therapistId: 2,
    therapistName: 'Патимат Алиева',
    serviceType: 'Лечебный массаж',
    reply: {
      date: '2024-03-11',
      comment: 'Марьям, благодарю за отзыв! Рада, что вам понравилось. Ждём вас снова!'
    }
  },
  {
    id: 6,
    name: 'Рамазан И.',
    rating: 4,
    date: '2024-03-10',
    comment: 'Хороший массаж, помог снять напряжение после долгого рабочего дня.',
    gender: 'male',
    therapistId: 3,
    therapistName: 'Амина Исаева',
    serviceType: 'Классический массаж'
  }
];

const therapists = [
  {
    id: 1,
    name: 'Магомед Магомедов',
    specialty: 'Спортивный массаж',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400',
  },
  {
    id: 2,
    name: 'Патимат Алиева',
    specialty: 'Лечебный массаж',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400',
  },
  {
    id: 3,
    name: 'Амина Исаева',
    specialty: 'Классический массаж',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=400',
  },
];

const REVIEWS_PER_PAGE = 5;

const Reviews = () => {
  const [reviews] = useState<Review[]>(initialReviews);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTherapistId, setSelectedTherapistId] = useState<number | null>(null);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 5,
    comment: '',
    gender: 'male' as 'male' | 'female',
    therapistId: undefined as number | undefined,
    serviceId: undefined as number | undefined,
  });
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('New review:', newReview);
    setIsModalOpen(false);
    setNewReview({
      name: '',
      rating: 5,
      comment: '',
      gender: 'male',
      therapistId: undefined,
      serviceId: undefined,
    });
  };

  const animationConfig = isMobile ? { duration: 0.3, delay: 0.1 } : { duration: 0.8, delay: 0.2 };

  // Calculate average rating
  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

  // Calculate therapist statistics
  const therapistStats = useMemo(() => {
    return therapists.map(therapist => {
      const therapistReviews = reviews.filter(review => review.therapistId === therapist.id);
      const avgRating = therapistReviews.length > 0
        ? therapistReviews.reduce((acc, review) => acc + review.rating, 0) / therapistReviews.length
        : 0;
      
      return {
        ...therapist,
        reviewCount: therapistReviews.length,
        averageRating: avgRating,
      };
    });
  }, [reviews]);

  // Filter reviews by selected therapist
  const filteredReviews = selectedTherapistId
    ? reviews.filter(review => review.therapistId === selectedTherapistId)
    : reviews;

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * REVIEWS_PER_PAGE,
    currentPage * REVIEWS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTherapistClick = (therapistId: number) => {
    setSelectedTherapistId(selectedTherapistId === therapistId ? null : therapistId);
    setCurrentPage(1);
  };

  const openReviewModal = (therapistId: number) => {
    setNewReview(prev => ({ ...prev, therapistId }));
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: animationConfig.duration }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-amber-600 mb-6">
            Отзывы
          </h1>
          
          {/* Reviews Stats */}
          <div className="flex justify-center items-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-500 mb-1">{reviews.length}</div>
              <div className="text-sm text-gray-400">Всего отзывов</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-3xl font-bold text-amber-500 mb-1">
                {averageRating.toFixed(1)}
                <Star className="w-6 h-6 fill-amber-500" />
              </div>
              <div className="text-sm text-gray-400">Средняя оценка</div>
            </div>
          </div>

          {/* Therapist Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {therapistStats.map((therapist) => (
              <motion.div
                key={therapist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: animationConfig.delay }}
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-6 border transition-all cursor-pointer ${
                  selectedTherapistId === therapist.id
                    ? 'border-amber-500'
                    : 'border-white/10 hover:border-amber-500/50'
                }`}
                onClick={() => handleTherapistClick(therapist.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={therapist.image}
                    alt={therapist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-500">{therapist.name}</h3>
                    <p className="text-sm text-gray-400">{therapist.specialty}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl font-bold text-amber-500">{therapist.reviewCount}</div>
                    <div className="text-sm text-gray-400">Отзывов</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-amber-500">
                      {therapist.averageRating.toFixed(1)}
                      <Star className="w-4 h-4 fill-amber-500" />
                    </div>
                    <div className="text-sm text-gray-400">Рейтинг</div>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openReviewModal(therapist.id);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                >
                  <PenSquare className="w-4 h-4" />
                  Оставить отзыв
                </button>
              </motion.div>
            ))}
          </div>

          {selectedTherapistId && (
            <div className="mb-8">
              <button
                onClick={() => setSelectedTherapistId(null)}
                className="text-amber-500 hover:text-amber-600 transition-colors"
              >
                ← Показать все отзывы
              </button>
            </div>
          )}
        </motion.div>

        {/* Reviews List */}
        <div className="space-y-8">
          {paginatedReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: animationConfig.delay + (index * 0.1),
                duration: animationConfig.duration
              }}
              className="space-y-4"
            >
              {/* User Review */}
              <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="relative">
                    <img
                      src={getAvatarUrl(review.id, review.gender)}
                      alt={review.name}
                      className="w-12 h-12 rounded-full bg-amber-500/10"
                      style={{ backgroundColor: '#b45309' }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-amber-500">{review.name}</h3>
                        <span className="inline-block px-2 py-0.5 bg-amber-500/10 text-amber-500 text-xs rounded-full mt-1">
                          Клиент
                        </span>
                        <div className="flex flex-col space-y-1 mt-2">
                          <p className="text-sm text-gray-400">
                            Отзыв на услугу "{review.serviceType}" 
                            <span className="mx-2">•</span>
                            Специалист: {review.therapistName}
                          </p>
                          <div className="flex items-center gap-1">
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
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(review.date).toLocaleDateString('ru-RU')}
                      </span>
                    </div>
                    <p className="mt-3 text-gray-300">{review.comment}</p>
                  </div>
                </div>
              </div>

              {/* Therapist Reply */}
              {review.reply && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="ml-8 md:ml-12 bg-amber-500/10 backdrop-blur-lg rounded-2xl p-6 border border-amber-500/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={therapists.find(t => t.id === review.therapistId)?.image}
                        alt={review.therapistName}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500"
                      />
                      <MessageCircle className="absolute -bottom-1 -right-1 w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-amber-500">{review.therapistName}</h3>
                          <p className="text-sm text-amber-500/80">Ответ специалиста</p>
                        </div>
                        <span className="text-sm text-amber-500/60">
                          {new Date(review.reply.date).toLocaleDateString('ru-RU')}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-300">{review.reply.comment}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        newReview={newReview}
        setNewReview={setNewReview}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Reviews;