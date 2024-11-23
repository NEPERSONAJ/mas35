import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, User, Phone, Calendar, Star, Plus, Mail, MapPin, Trash2 } from 'lucide-react';
import { useStaffStore } from '../../store/staffStore';
import StaffModal from '../../components/modals/StaffModal';
import toast from 'react-hot-toast';

const AdminStaff = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { staff, loading, error, fetchStaff, createStaff, updateStaff, deleteStaff } = useStaffStore();

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleCreateOrUpdateStaff = async (staffData: any, serviceIds: string[]) => {
    try {
      if (staffData.id) {
        await updateStaff(staffData.id, staffData, serviceIds);
        toast.success('Сотрудник успешно обновлен');
      } else {
        await createStaff(staffData, serviceIds);
        toast.success('Сотрудник успешно добавлен');
      }
      setIsModalOpen(false);
      await fetchStaff(); // Refresh the list after update
    } catch (error) {
      toast.error('Ошибка при сохранении сотрудника');
      console.error('Error saving staff:', error);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      setIsDeleting(true);
      try {
        await deleteStaff(id);
        toast.success('Сотрудник успешно удален');
        await fetchStaff(); // Refresh the list after deletion
      } catch (error) {
        toast.error('Ошибка при удалении сотрудника');
        console.error('Error deleting staff:', error);
      } finally {
        setIsDeleting(false);
      }
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
          onClick={() => fetchStaff()}
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
        <h1 className="text-2xl font-bold text-amber-500">Сотрудники</h1>
        <button 
          onClick={() => {
            setSelectedStaff(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить сотрудника
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск сотрудников..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Фильтры
        </button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((employee, index) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors"
          >
            <div className="relative h-48">
              <img
                src={employee.image_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400'}
                alt={employee.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold text-white">{employee.name}</h3>
                <p className="text-amber-500">{employee.specialty}</p>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedStaff(employee);
                    setIsModalOpen(true);
                  }}
                  className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => handleDeleteStaff(employee.id)}
                  disabled={isDeleting}
                  className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                {employee.phone && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{employee.phone}</span>
                  </div>
                )}
                {employee.email && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm">{employee.email}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  employee.is_active
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-yellow-500/10 text-yellow-500'
                }`}>
                  {employee.is_active ? 'Активный' : 'Неактивный'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <StaffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateStaff}
        initialData={selectedStaff}
        title={selectedStaff ? 'Редактировать сотрудника' : 'Добавить сотрудника'}
      />
    </div>
  );
};

export default AdminStaff;
