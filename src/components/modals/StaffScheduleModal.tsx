import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Staff, WorkingHours, Break, TimeOff } from '../../lib/types';

interface StaffScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff;
}

export default function StaffScheduleModal({
  isOpen,
  onClose,
  staff
}: StaffScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<'working-hours' | 'time-off'>('working-hours');
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [timeOff, setTimeOff] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(false);

  const [newWorkingHours, setNewWorkingHours] = useState<Partial<WorkingHours>>({
    pattern: 'weekly',
    weekday: 'monday',
    start_time: '09:00',
    end_time: '18:00',
    is_active: true,
    breaks: []
  });

  const [newTimeOff, setNewTimeOff] = useState<Partial<TimeOff>>({
    start_date: '',
    end_date: '',
    reason: ''
  });

  useEffect(() => {
    if (isOpen && staff) {
      loadSchedule();
    }
  }, [isOpen, staff]);

  const loadSchedule = async () => {
    setLoading(true);
    try {
      // Load working hours
      const { data: workingHoursData, error: workingHoursError } = await supabase
        .from('staff_working_hours')
        .select(`
          *,
          breaks:staff_breaks(*)
        `)
        .eq('staff_id', staff.id)
        .order('created_at');

      if (workingHoursError) throw workingHoursError;
      setWorkingHours(workingHoursData || []);

      // Load time off
      const { data: timeOffData, error: timeOffError } = await supabase
        .from('staff_time_off')
        .select('*')
        .eq('staff_id', staff.id)
        .order('start_date');

      if (timeOffError) throw timeOffError;
      setTimeOff(timeOffData || []);
    } catch (error) {
      console.error('Error loading schedule:', error);
      toast.error('Ошибка при загрузке расписания');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorkingHours = async () => {
    try {
      const { data, error } = await supabase
        .from('staff_working_hours')
        .insert([{
          staff_id: staff.id,
          pattern: newWorkingHours.pattern,
          weekday: newWorkingHours.pattern === 'weekly' ? newWorkingHours.weekday : null,
          start_date: newWorkingHours.pattern === 'specific_dates' ? newWorkingHours.start_date : null,
          end_date: newWorkingHours.pattern === 'specific_dates' ? newWorkingHours.end_date : null,
          day_of_week: newWorkingHours.pattern === 'recurring_day' ? newWorkingHours.day_of_week : null,
          week_of_month: newWorkingHours.pattern === 'recurring_day' ? newWorkingHours.week_of_month : null,
          start_time: newWorkingHours.start_time,
          end_time: newWorkingHours.end_time,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      // Add breaks if any
      if (newWorkingHours.breaks && newWorkingHours.breaks.length > 0) {
        const { error: breaksError } = await supabase
          .from('staff_breaks')
          .insert(
            newWorkingHours.breaks.map(breakItem => ({
              working_hours_id: data.id,
              start_time: breakItem.start_time,
              end_time: breakItem.end_time
            }))
          );

        if (breaksError) throw breaksError;
      }

      toast.success('График работы добавлен');
      loadSchedule();
    } catch (error) {
      console.error('Error adding working hours:', error);
      toast.error('Ошибка при добавлении графика работы');
    }
  };

  const handleAddTimeOff = async () => {
    try {
      const { error } = await supabase
        .from('staff_time_off')
        .insert([{
          staff_id: staff.id,
          start_date: newTimeOff.start_date,
          end_date: newTimeOff.end_date,
          reason: newTimeOff.reason
        }]);

      if (error) throw error;

      toast.success('Выходной добавлен');
      loadSchedule();
    } catch (error) {
      console.error('Error adding time off:', error);
      toast.error('Ошибка при добавлении выходного');
    }
  };

  const handleDeleteWorkingHours = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_working_hours')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('График работы удален');
      loadSchedule();
    } catch (error) {
      console.error('Error deleting working hours:', error);
      toast.error('Ошибка при удалении графика работы');
    }
  };

  const handleDeleteTimeOff = async (id: string) => {
    try {
      const { error } = await supabase
        .from('staff_time_off')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Выходной удален');
      loadSchedule();
    } catch (error) {
      console.error('Error deleting time off:', error);
      toast.error('Ошибка при удалении выходного');
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
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-xl p-6 shadow-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-semibold mb-6">
          Расписание: {staff.name}
        </h2>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('working-hours')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'working-hours'
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            График работы
          </button>
          <button
            onClick={() => setActiveTab('time-off')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'time-off'
                ? 'bg-amber-500 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            Выходные
          </button>
        </div>

        {/* Working Hours Tab */}
        {activeTab === 'working-hours' && (
          <div className="space-y-6">
            {/* Add New Working Hours */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Добавить график работы</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Тип графика
                  </label>
                  <select
                    value={newWorkingHours.pattern}
                    onChange={(e) => setNewWorkingHours({
                      ...newWorkingHours,
                      pattern: e.target.value as WorkingHours['pattern']
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  >
                    <option value="weekly">Еженедельный</option>
                    <option value="specific_dates">Конкретные даты</option>
                    <option value="recurring_day">Повторяющийся день</option>
                  </select>
                </div>

                {newWorkingHours.pattern === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      День недели
                    </label>
                    <select
                      value={newWorkingHours.weekday}
                      onChange={(e) => setNewWorkingHours({
                        ...newWorkingHours,
                        weekday: e.target.value as WorkingHours['weekday']
                      })}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    >
                      <option value="monday">Понедельник</option>
                      <option value="tuesday">Вторник</option>
                      <option value="wednesday">Среда</option>
                      <option value="thursday">Четверг</option>
                      <option value="friday">Пятница</option>
                      <option value="saturday">Суббота</option>
                      <option value="sunday">Воскресенье</option>
                    </select>
                  </div>
                )}

                {newWorkingHours.pattern === 'specific_dates' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Дата начала
                      </label>
                      <input
                        type="date"
                        value={newWorkingHours.start_date}
                        onChange={(e) => setNewWorkingHours({
                          ...newWorkingHours,
                          start_date: e.target.value
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Дата окончания
                      </label>
                      <input
                        type="date"
                        value={newWorkingHours.end_date}
                        onChange={(e) => setNewWorkingHours({
                          ...newWorkingHours,
                          end_date: e.target.value
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      />
                    </div>
                  </>
                )}

                {newWorkingHours.pattern === 'recurring_day' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        День недели
                      </label>
                      <select
                        value={newWorkingHours.day_of_week}
                        onChange={(e) => setNewWorkingHours({
                          ...newWorkingHours,
                          day_of_week: e.target.value as WorkingHours['day_of_week']
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      >
                        <option value="monday">Понедельник</option>
                        <option value="tuesday">Вторник</option>
                        <option value="wednesday">Среда</option>
                        <option value="thursday">Четверг</option>
                        <option value="friday">Пятница</option>
                        <option value="saturday">Суббота</option>
                        <option value="sunday">Воскресенье</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Неделя месяца
                      </label>
                      <select
                        value={newWorkingHours.week_of_month}
                        onChange={(e) => setNewWorkingHours({
                          ...newWorkingHours,
                          week_of_month: parseInt(e.target.value)
                        })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      >
                        <option value="1">Первая</option>
                        <option value="2">Вторая</option>
                        <option value="3">Третья</option>
                        <option value="4">Четвертая</option>
                        <option value="5">Последняя</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={newWorkingHours.start_time}
                    onChange={(e) => setNewWorkingHours({
                      ...newWorkingHours,
                      start_time: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={newWorkingHours.end_time}
                    onChange={(e) => setNewWorkingHours({
                      ...newWorkingHours,
                      end_time: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  />
                </div>
              </div>

              {/* Breaks */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-300">Перерывы</h4>
                  <button
                    onClick={() => setNewWorkingHours({
                      ...newWorkingHours,
                      breaks: [...(newWorkingHours.breaks || []), { start_time: '', end_time: '' }]
                    })}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {newWorkingHours.breaks?.map((breakItem, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <input
                        type="time"
                        value={breakItem.start_time}
                        onChange={(e) => {
                          const newBreaks = [...(newWorkingHours.breaks || [])];
                          newBreaks[index].start_time = e.target.value;
                          setNewWorkingHours({ ...newWorkingHours, breaks: newBreaks });
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      />
                      <input
                        type="time"
                        value={breakItem.end_time}
                        onChange={(e) => {
                          const newBreaks = [...(newWorkingHours.breaks || [])];
                          newBreaks[index].end_time = e.target.value;
                          setNewWorkingHours({ ...newWorkingHours, breaks: newBreaks });
                        }}
                        className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                      />
                      <button
                        onClick={() => {
                          const newBreaks = [...(newWorkingHours.breaks || [])];
                          newBreaks.splice(index, 1);
                          setNewWorkingHours({ ...newWorkingHours, breaks: newBreaks });
                        }}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddWorkingHours}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Добавить график
                </button>
              </div>
            </div>

            {/* Existing Working Hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Текущие графики работы</h3>
              {workingHours.map((hours) => (
                <div
                  key={hours.id}
                  className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>
                        {hours.start_time} - {hours.end_time}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {hours.pattern === 'weekly' && `Каждый ${hours.weekday}`}
                      {hours.pattern === 'specific_dates' && `${hours.start_date} - ${hours.end_date}`}
                      {hours.pattern === 'recurring_day' && `${hours.week_of_month}-й ${hours.day_of_week} месяца`}
                    </div>
                    {hours.breaks && hours.breaks.length > 0 && (
                      <div className="mt-2 text-sm text-gray-400">
                        Перерывы:{' '}
                        {hours.breaks.map((breakItem, index) => (
                          <span key={breakItem.id}>
                            {index > 0 && ', '}
                            {breakItem.start_time} - {breakItem.end_time}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteWorkingHours(hours.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Off Tab */}
        {activeTab === 'time-off' && (
          <div className="space-y-6">
            {/* Add New Time Off */}
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-4">Добавить выходной</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={newTimeOff.start_date}
                    onChange={(e) => setNewTimeOff({
                      ...newTimeOff,
                      start_date: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={newTimeOff.end_date}
                    onChange={(e) => setNewTimeOff({
                      ...newTimeOff,
                      end_date: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Причина
                  </label>
                  <input
                    type="text"
                    value={newTimeOff.reason}
                    onChange={(e) => setNewTimeOff({
                      ...newTimeOff,
                      reason: e.target.value
                    })}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    placeholder="Отпуск, больничный и т.д."
                  />
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={handleAddTimeOff}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  Добавить выходной
                </button>
              </div>
            </div>

            {/* Existing Time Off */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Текущие выходные</h3>
              {timeOff.map((off) => (
                <div
                  key={off.id}
                  className="bg-white/5 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span>
                        {off.start_date} - {off.end_date}
                      </span>
                    </div>
                    {off.reason && (
                      <div className="text-sm text-gray-400">
                        Причина: {off.reason}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTimeOff(off.id)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}