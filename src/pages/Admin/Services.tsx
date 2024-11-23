import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MoreVertical, Plus, Clock, DollarSign, Trash2 } from 'lucide-react';
import { useServicesStore } from '../../store/servicesStore';
import ServiceModal from '../../components/modals/ServiceModal';
import toast from 'react-hot-toast';

const AdminServices = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { services, loading, error, fetchServices, createService, updateService, deleteService } = useServicesStore();

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleCreateOrUpdateService = async (serviceData: any) => {
    try {
      if (serviceData.id) {
        await updateService(serviceData.id, serviceData);
        toast.success('Услуга успешно обновлена');
      } else {
        await createService(serviceData);
        toast.success('Услуга успешно добавлена');
      }
      setIsModalOpen(false);
      await fetchServices(); // Refresh the list after update
    } catch (error) {
      toast.error('Ошибка при сохранении услуги');
      console.error('Error saving service:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить эту услугу?')) {
      setIsDeleting(true);
      try {
        await deleteService(id);
        toast.success('Услуга успешно удалена');
        await fetchServices(); // Refresh the list after deletion
      } catch (error) {
        toast.error('Ошибка при удалении услуги');
        console.error('Error deleting service:', error);
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
          onClick={() => fetchServices()}
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
        <h1 className="text-2xl font-bold text-amber-500">Услуги</h1>
        <button 
          onClick={() => {
            setSelectedService(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Добавить услугу
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Поиск услуг..."
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Фильтры
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/50 transition-colors"
          >
            <div className="relative h-48">
              <img
                src={service.image_url || 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000'}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                <p className="text-sm text-gray-300 line-clamp-2">{service.description}</p>
              </div>
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedService(service);
                    setIsModalOpen(true);
                  }}
                  className="p-2 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                >
                  <MoreVertical className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => handleDeleteService(service.id)}
                  disabled={isDeleting}
                  className="p-2 bg-red-500/50 rounded-lg hover:bg-red-500/70 transition-colors"
                >
                  <Trash2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-amber-500">
                    <DollarSign className="w-5 h-5" />
                    <span className="text-lg font-bold">{service.price}₽</span>
                  </div>
                </div>
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="flex items-center justify-center gap-2 text-amber-500">
                    <Clock className="w-5 h-5" />
                    <span className="text-lg font-bold">{service.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  service.is_active
                    ? 'bg-green-500/10 text-green-500'
                    : 'bg-gray-500/10 text-gray-400'
                }`}>
                  {service.is_active ? 'Активна' : 'Неактивна'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdateService}
        initialData={selectedService}
        title={selectedService ? 'Редактировать услугу' : 'Добавить услугу'}
      />
    </div>
  );
};

export default AdminServices;
