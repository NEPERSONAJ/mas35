import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Clock, User, Trash2 } from 'lucide-react';
import { useAppointmentsStore } from '../../store/appointmentsStore';
import AppointmentModal from '../../components/modals/AppointmentModal';
import toast from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

const AdminBookings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { appointments, loading, error, fetchAppointments, createAppointment, updateAppointment, deleteAppointment } = useAppointmentsStore();

  useEffect(() => {
    fetchAppointments().catch(error => {
      toast.error('Ошибка при загрузке записей');
    });
  }, [fetchAppointments]);

  const handleCreateOrUpdateAppointment = async (appointmentData: any) => {
    try {
      if (appointmentData.id) {
        await updateAppointment(appointmentData.id, appointmentData);
        toast.success('Запись успешно обновлена');
      } else {
        await createAppointment(appointmentData);
        toast.success('Запись успешно создана');
      }
      setIsModalOpen(false);
      await fetchAppointments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ошибка при сохранении записи');
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      setIsDeleting(true);
      try {
        await deleteAppointment(id);
        toast.success('Запись успешно удалена');
        await fetchAppointments();
      } catch (error) {
        toast.error('Ошибка при удалении записи');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'cancelled':
        return 'bg-red-500/10 text-red-500';
      case 'completed':
        return 'bg-blue-500/10 text-blue-500';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Подтверждено';
      case 'pending':
        return 'Ожидает';
      case 'cancelled':
        return 'Отменено';
      case 'completed':
        return 'Завершено';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка загрузки данных</p>
        <button 
          onClick={() => fetchAppointments()}
          className="mt-4 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-amber-500">Управление записями</h1>
        <button 
          onClick={() => {
            setSelectedAppointment(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <Clock className="w-5 h-5" />
          Новая запись
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск записей..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Фильтры
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Дата</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Время</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Клиент</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Услуга</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Мастер</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-400">Статус</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-400">Действия</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((appointment, index) => (
                <motion.tr
                  key={appointment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border-b border-white/10 hover:bg-white/5"
                >
                  <td className="px-6 py-4 text-sm">
                    {format(parseISO(appointment.start_time), 'dd.MM.yyyy', { locale: ru })}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {format(parseISO( appointment.start_time), 'HH:mm')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-amber-500/10 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <span className="block">{appointment.clients?.name || 'Нет данных'}</span>
                        <span className="text-sm text-gray-400">{appointment.clients?.phone || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {appointment.services?.name || 'Нет данных'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {appointment.staff?.name || 'Нет данных'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      getStatusColor(appointment.status)
                    }`}>
                      {getStatusText(appointment.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setIsModalOpen(true);
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-5 h-5 text-gray-400" />
                      </button>
                      <button 
                        onClick={() => handleDeleteAppointment(appointment.id)}
                        disabled={isDeleting}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-500" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateAppointment}
        initialData={selectedAppointment}
        title={selectedAppointment ? 'Редактировать запись' : 'Новая запись'}
      />
    </div>
  );
};

export default AdminBookings;
