import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStaffStore } from '../../store/staffStore';
import { useServicesStore } from '../../store/servicesStore';
import { checkStaffAvailability } from '../../lib/api/appointments';
import type { Appointment } from '../../lib/types';
import { addMinutes, format, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (appointment: Omit<Appointment, 'id'>) => Promise<void>;
  initialData?: Appointment | null;
  title: string;
}

export default function AppointmentModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title
}: AppointmentModalProps) {
  const [formData, setFormData] = useState<Omit<Appointment, 'id'> & {
    client?: {
      name: string;
      phone: string;
      email?: string;
    };
  }>({
    client_id: '',
    service_id: '',
    staff_id: '',
    start_time: '',
    end_time: '',
    status: 'pending',
    notes: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    client: {
      name: '',
      phone: '',
      email: ''
    }
  });

  const { staff, fetchStaff } = useStaffStore();
  const { services, fetchServices } = useServicesStore();
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    fetchStaff();
    fetchServices();
  }, [fetchStaff, fetchServices]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        client: {
          name: initialData.client?.name || '',
          phone: initialData.client?.phone || '',
          email: initialData.client?.email || ''
        }
      });
    } else {
      setFormData({
        client_id: '',
        service_id: '',
        staff_id: '',
        start_time: '',
        end_time: '',
        status: 'pending',
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        client: {
          name: '',
          phone: '',
          email: ''
        }
      });
    }
  }, [initialData, isOpen]);

  const handleServiceChange = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (service) {
      const startTime = formData.start_time || new Date().toISOString();
      const duration = parseInt(service.duration.split(':')[0]) * 60 + 
                      parseInt(service.duration.split(':')[1]);
      const endTime = addMinutes(parseISO(startTime), duration).toISOString();
      
      setFormData({
        ...formData,
        service_id: serviceId,
        end_time: endTime
      });
    }
  };

  const handleTimeChange = async (startTime: string) => {
    const service = services.find(s => s.id === formData.service_id);
    if (service && formData.staff_id) {
      const duration = parseInt(service.duration.split(':')[0]) * 60 + 
                      parseInt(service.duration.split(':')[1]);
      const endTime = addMinutes(parseISO(startTime), duration).toISOString();

      setIsChecking(true);
      try {
        const isAvailable = await checkStaffAvailability(
          formData.staff_id,
          startTime,
          endTime,
          initialData?.id
        );

        if (!isAvailable) {
          toast.error('Специалист занят в это время');
          return;
        }

        setFormData({
          ...formData,
          start_time: startTime,
          end_time: endTime
        });
      } catch (error) {
        toast.error('Ошибка при проверке доступности');
      } finally {
        setIsChecking(false);
      }
    } else {
      setFormData({
        ...formData,
        start_time: startTime
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.client?.name || !formData.client?.phone) {
      toast.error('Заполните имя и телефон клиента');
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при сохранении записи');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-xl p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">{title}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="md:col-span-2">
              <h3 className="text-lg font-medium mb-4">Информация о клиенте</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Имя клиента *
                  </label>
                  <input
                    type="text"
                    value={formData.client?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client!, name: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Телефон *
                  </label>
                  <input
                    type="tel"
                    value={formData.client?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client!, phone: e.target.value }
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email (необязательно)
                  </label>
                  <input
                    type="email"
                    value={formData.client?.email || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      client: { ...formData.client!, email: e.target.value || undefined }
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Услуга
              </label>
              <select
                value={formData.service_id}
                onChange={(e) => handleServiceChange(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                required
              >
                <option value="">Выберите услугу</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} ({service.duration})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Специалист
              </label>
              <select
                value={formData.staff_id}
                onChange={(e) => setFormData({ ...formData, staff_id: e.target.value })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                required
              >
                <option value="">Выберите специалиста</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.specialty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Статус
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as Appointment['status'] })}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                required
              >
                <option value="pending">Ожидает</option>
                <option value="confirmed">Подтверждено</option>
                <option value="cancelled">Отменено</option>
                <option value="completed">Завершено</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Начало
              </label>
              <input
                type="datetime-local"
                value={formData.start_time ? format(parseISO(formData.start_time), "yyyy-MM-dd'T'HH:mm") : ''}
                onChange={(e) => handleTimeChange(new Date(e.target.value).toISOString())}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                required
                disabled={isChecking}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Окончание
              </label>
              <input
                type="datetime-local"
                value={formData.end_time ? format(parseISO(formData.end_time), "yyyy-MM-dd'T'HH:mm") : ''}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                disabled
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Заметки
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isChecking}
              className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {isChecking ? 'Проверка...' : initialData ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
