import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, User, Check, ChevronRight, Users, X } from 'lucide-react';
import { format, addDays, isValid, isSameDay, isAfter, isBefore, endOfMonth, startOfMonth, addMonths, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useStaffStore } from '../store/staffStore';
import { useServicesStore } from '../store/servicesStore';
import { getAvailableTimeSlots, createAppointment } from '../lib/api/appointments';
import { validatePhone, validateEmail, validateName } from '../lib/validation';
import toast from 'react-hot-toast';

interface BookingStep {
  id: number;
  title: string;
  icon: React.ReactNode;
}

const steps: BookingStep[] = [
  { id: 1, title: 'Выбор мастера', icon: <Users className="w-6 h-6" /> },
  { id: 2, title: 'Выбор услуги', icon: <User className="w-6 h-6" /> },
  { id: 3, title: 'Выбор даты', icon: <Calendar className="w-6 h-6" /> },
  { id: 4, title: 'Выбор времени', icon: <Clock className="w-6 h-6" /> },
  { id: 5, title: 'Ваши данные', icon: <User className="w-6 h-6" /> },
];

const Booking = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTherapist, setSelectedTherapist] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showExtendedDates, setShowExtendedDates] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    comments: '',
  });
  const [availableSlots, setAvailableSlots] = useState<Array<{ start_time: string; end_time: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  const { staff, fetchStaff } = useStaffStore();
  const { services, fetchServices } = useServicesStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStaff();
    fetchServices();
  }, [fetchStaff, fetchServices]);

  useEffect(() => {
    stepRefs.current = stepRefs.current.slice(0, steps.length);
  }, []);

  useEffect(() => {
    if (isMobile && stepsContainerRef.current && stepRefs.current[currentStep - 1]) {
      const container = stepsContainerRef.current;
      const currentStepElement = stepRefs.current[currentStep - 1];
      
      if (currentStepElement) {
        const containerWidth = container.offsetWidth;
        const stepLeft = currentStepElement.offsetLeft;
        const stepWidth = currentStepElement.offsetWidth;
        const scrollPosition = stepLeft - (containerWidth / 2) + (stepWidth / 2);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [currentStep, isMobile]);

  useEffect(() => {
    const loadAvailableSlots = async () => {
      if (selectedDate && selectedTherapist && selectedService) {
        setLoading(true);
        try {
          const service = services.find(s => s.id === selectedService);
          if (!service) {
            throw new Error('Услуга не найдена');
          }

          const slots = await getAvailableTimeSlots(
            selectedTherapist,
            format(selectedDate, 'yyyy-MM-dd'),
            service.duration
          );
          
          // Sort slots by time
          const sortedSlots = slots.sort((a, b) => {
            return parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime();
          });
          
          setAvailableSlots(sortedSlots);
        } catch (error) {
          console.error('Error loading slots:', error);
          toast.error('Ошибка при загрузке доступного времени');
          setAvailableSlots([]);
        } finally {
          setLoading(false);
        }
      }
    };

    loadAvailableSlots();
  }, [selectedDate, selectedTherapist, selectedService, services]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // If number is empty, return empty string
    if (digits.length === 0) return '';

    // Remove extra 7 after +7
    const cleanDigits = digits.startsWith('7') ? digits.slice(1) : digits;

    // Format number
    if (cleanDigits.length === 0) return '+7';
    if (cleanDigits.length <= 3) return `+7${cleanDigits}`;
    if (cleanDigits.length <= 6) return `+7${cleanDigits.slice(0, 3)}${cleanDigits.slice(3)}`;
    if (cleanDigits.length <= 8) return `+7${cleanDigits.slice(0, 3)}${cleanDigits.slice(3, 6)}${cleanDigits.slice(6)}`;
    return `+7${cleanDigits.slice(0, 3)}${cleanDigits.slice(3, 6)}${cleanDigits.slice(6, 8)}${cleanDigits.slice(8, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedPhone });
    if (errors.phone) {
      setErrors({ ...errors, phone: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!validateName(formData.name)) {
      newErrors.name = 'Введите корректное имя';
    }

    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = 'Введите корректный номер телефона';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (currentStep === steps.length) {
      if (!validateForm()) {
        toast.error('Пожалуйста, проверьте правильность заполнения формы');
        return;
      }

      setLoading(true);
      try {
        const service = services.find(s => s.id === selectedService);
        if (!service) {
          throw new Error('Услуга не найдена');
        }

        const selectedSlot = availableSlots.find(slot => 
          format(parseISO(slot.start_time), 'HH:mm') === selectedTime
        );
        if (!selectedSlot) {
          throw new Error('Выбранное время недоступно');
        }

        const phoneValidation = validatePhone(formData.phone);
        if (!phoneValidation.isValid || !phoneValidation.formattedNumber) {
          throw new Error('Неверный формат номера телефона');
        }

        await createAppointment({
          client: {
            name: formData.name.trim(),
            phone: phoneValidation.formattedNumber,
            email: formData.email.trim() || undefined
          },
          service_id: selectedService,
          staff_id: selectedTherapist!,
          start_time: selectedSlot.start_time,
          end_time: selectedSlot.end_time,
          status: 'pending',
          notes: formData.comments.trim()
        });

        toast.success('Запись успешно создана! Мы свяжемся с вами для подтверждения.');
        navigate('/');
      } catch (error) {
        console.error('Booking error:', error);
        toast.error(error instanceof Error ? error.message : 'Ошибка при создании записи');
      } finally {
        setLoading(false);
      }
    } else {
      let canProceed = true;

      switch (currentStep) {
        case 1:
          if (!selectedTherapist) {
            toast.error('Выберите специалиста');
            canProceed = false;
          }
          break;
        case 2:
          if (!selectedService) {
            toast.error('Выберите услугу');
            canProceed = false;
          }
          break;
        case 3:
          if (!selectedDate) {
            toast.error('Выберите дату');
            canProceed = false;
          }
          break;
        case 4:
          if (!selectedTime) {
            toast.error('Выберите время');
            canProceed = false;
          }
          break;
      }

      if (canProceed) {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const getAvailableServices = () => {
    if (!selectedTherapist) return [];
    const therapist = staff.find(t => t.id === selectedTherapist);
    return services.filter(service => therapist?.serviceIds?.includes(service.id));
  };

  const isDateSelectable = (date: Date) => {
    if (!selectedTherapist) return false;
    const today = startOfDay(new Date());
    return isValid(date) && !isBefore(date, today);
  };

  const availableDates = useMemo(() => {
    const dates = [];
    const today = startOfDay(new Date());
    const monthEnd = endOfMonth(currentMonth);
    const nextMonthEnd = endOfMonth(addMonths(currentMonth, 1));
    const maxDate = showExtendedDates ? nextMonthEnd : addDays(today, 7);
    
    let currentDate = today;
    
    while (isBefore(currentDate, maxDate) || isSameDay(currentDate, maxDate)) {
      dates.push(currentDate);
      currentDate = addDays(currentDate, 1);
      
      if (showExtendedDates && isAfter(currentDate, nextMonthEnd)) {
        break;
      }
    }
    
    return dates;
  }, [currentMonth, showExtendedDates]);

  return (
    <div className="min-h-screen pt-20 pb-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Progress Steps */}
        <div className="mb-12">
          <div 
            ref={stepsContainerRef}
            className="flex items-center px-4 md:px-0 overflow-x-auto scrollbar-hide"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {steps.map((step, index) => (
              <div 
                key={step.id}
                ref={el => stepRefs.current[index] = el}
                className="flex-none px-4 first:pl-0 last:pr-0"
                style={{ scrollSnapAlign: 'center' }}
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      step.id === currentStep
                        ? 'bg-amber-500 text-white'
                        : step.id < currentStep
                        ? 'bg-green-500 text-white'
                        : 'bg-white/5 border border-white/10 text-gray-400'
                    }`}
                  >
                    {step.id < currentStep ? <Check className="w-6 h-6" /> : step.icon}
                  </motion.div>
                  <span className="text-sm font-medium text-gray-400 whitespace-nowrap">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block h-0.5 bg-white/10 w-full absolute" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="mb-12"
          >
            {/* Step 1: Select Therapist */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staff.map((therapist) => (
                  <motion.div
                    key={therapist.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedTherapist === therapist.id
                        ? 'ring-2 ring-amber-500'
                        : 'hover:ring-2 hover:ring-amber-500/50'
                    }`}
                    onClick={() => setSelectedTherapist(therapist.id)}
                  >
                    <div className="absolute inset-0">
                      <img
                        src={therapist.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400'}
                        alt={therapist.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-black/20" />
                    </div>
                    <div className="relative p-6 text-white">
                      <h3 className="text-xl font-semibold mb-2">{therapist.name}</h3>
                      <p className="text-amber-200 font-medium mb-2">{therapist.specialty}</p>
                      {therapist.bio && (
                        <p className="text-gray-300 text-sm line-clamp-2">{therapist.bio}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Step 2: Select Service */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {getAvailableServices().map((service) => (
                  <motion.div
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedService(service.id)}
                    className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedService === service.id
                        ? 'ring-2 ring-amber-500'
                        : 'hover:ring-2 hover:ring-amber-500/50'
                    }`}
                  >
                    <div className="absolute inset-0">
                      <img
                        src={service.image_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000'}
                        alt={service.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    </div>
                    <div className="relative p-6 text-white">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">{service.name}</h3>
                        <span className="text-amber-300 font-bold">{service.price}₽</span>
                      </div>
                      <p className="text-gray-200 mb-4">{service.description}</p>
                      <div className="flex items-center text-sm text-amber-200">
                        <Clock className="w-4 h-4 mr-2" />
                        {service.duration}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Step 3: Select Date */}
            {currentStep === 3 && (
              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
                  {availableDates.map((date) => {
                    const isAvailable = isDateSelectable(date);
                    return (
                      <motion.button
                        key={date.toISOString()}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        disabled={!isAvailable}
                        className={`p-4 rounded-lg text-center transition-all relative ${
                          selectedDate && isSameDay(selectedDate, date)
                            ? 'bg-amber-500 text-white'
                            : isAvailable
                            ? 'bg-white/5 hover:bg-amber-900/20 border border-white/10'
                            : 'bg-white/5 border border-white/10 cursor-not-allowed'
                        }`}
                        onClick={() => isAvailable && setSelectedDate(date)}
                      >
                        <div className="text-sm font-medium">
                          {format(date, 'EEEEEE', { locale: ru })}
                        </div>
                        <div className="text-lg font-bold">
                          {format(date, 'd', { locale: ru })}
                        </div>
                        <div className="text-xs">
                          {format(date, 'MMM', { locale: ru })}
                        </div>
                        {!isAvailable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                            <X className="w-6 h-6 text-red-500" />
                          </div>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    setShowExtendedDates(!showExtendedDates);
                    if (!showExtendedDates) {
                      setCurrentMonth(new Date());
                    }
                  }}
                  className="w-full p-4 rounded-lg text-center bg-white/5 hover:bg-amber-900/20 border border-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <span>{showExtendedDates ? 'Показать меньше дат' : 'Показать больше дат'}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${showExtendedDates ? 'rotate-90' : ''}`} />
                </button>
              </div>
            )}

            {/* Step 4: Select Time */}
            {currentStep === 4 && (
              <div>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"
                    />
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {availableSlots.map((slot, index) => {
                      const timeString = format(parseISO(slot.start_time), 'HH:mm');
                      return (
                        <motion.button
                          key={`${slot.start_time}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ scale: 1.05 }}
                          className={`p-4 rounded-lg text-center transition-all ${
                            selectedTime === timeString
                              ? 'bg-amber-500 text-white'
                              : 'bg-white/5 hover:bg-amber-900/20 border border-white/10'
                          }`}
                          onClick={() => setSelectedTime(timeString)}
                        >
                          {timeString}
                        </motion.button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Нет доступного времени на выбранную дату</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Client Information */}
            {currentStep === 5 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Ваше имя
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: '' });
                      }
                    }}
                    className={`w-full p-3 rounded-lg bg-white/5 border focus:border-amber-500 text-white ${
                      errors.name ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="Например: Иван Иванов"
                    required
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className={`w-full p-3 rounded-lg bg-white/5 border focus:border-amber-500 text-white ${
                      errors.phone ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="+9289999999"
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (необязательно)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    className={`w-full p-3 rounded-lg bg-white/5 border focus:border-amber-500 text-white ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    }`}
                    placeholder="example@mail.ru"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Комментарии
                  </label>
                  <textarea
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-amber-500 text-white"
                    rows={4}
                    placeholder="Дополнительная информация или пожелания"
                  />
                </div>

                {/* Booking Summary */}
                <div className="bg-white/5 rounded-lg p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-amber-500">Детали записи</h3>
                  {selectedTherapist && (
                    <div className="flex items-center gap-4">
                      <User className="w-5 h-5 text-gray-400" />
                      <span>{staff.find(s => s.id === selectedTherapist)?.name}</span>
                    </div>
                  )}
                  {selectedService && (
                    <div className="flex items-center gap-4">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span>{services.find(s => s.id === selectedService)?.name}</span>
                    </div>
                  )}
                  {selectedDate && selectedDate && selectedTime && (
                    <div className="flex items-center gap-4">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span>
                        {format(selectedDate, 'd MMMM yyyy', { locale: ru })} в {selectedTime}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-lg md:relative md:bg-transparent md:backdrop-blur-none md:p-0 flex justify-between gap-4">
          <button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 1))}
            disabled={currentStep === 1}
            className="flex-1 px-6 py-3 rounded-lg bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors text-white"
          >
            Назад
          </button>
          <button
            onClick={handleNext}
            disabled={
              loading ||
              (currentStep === 1 && !selectedTherapist) ||
              (currentStep === 2 && !selectedService) ||
              (currentStep === 3 && !selectedDate) ||
              (currentStep === 4 && !selectedTime)
            }
            className="flex-1 px-6 py-3 rounded-lg bg-amber-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
              />
            ) : currentStep === steps.length ? (
              'Подтвердить запись'
            ) : (
              'Далее'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Booking;