import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Bell, 
  MessageSquare,
  Smartphone,
  Info,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SMS_PROSTO_CONFIG } from '../../lib/notifications/config';
import { checkBalance } from '../../lib/notifications/api';
import toast from 'react-hot-toast';

interface SMSSettings {
  id: string;
  api_key: string;
  sender_name: string;
  default_route: string;
  default_priority: number;
  test_mode: boolean;
  base_url: string;
  location: string;
  queue_check_interval: number;
  batch_size: number;
}

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SMSSettings | null>(null);
  const [templates, setTemplates] = useState([
    {
      id: 1,
      type: 'appointment_created',
      name: 'При создании записи',
      message: 'Здравствуйте, %w! Подтверждаем вашу запись на %w к специалисту %w на %d. Ждём вас по адресу: %w',
      isActive: true,
      route: SMS_PROSTO_CONFIG.ROUTES.WHATSAPP_SMS,
      priority: 2
    },
    {
      id: 2,
      type: 'appointment_reminder',
      name: 'За час до записи',
      message: 'Здравствуйте, %w! Напоминаем о записи на %w через 1 час. Ждём вас в %d по адресу: %w',
      isActive: true,
      route: SMS_PROSTO_CONFIG.ROUTES.WHATSAPP_TELEGRAM_SMS,
      priority: 1
    },
    {
      id: 3,
      type: 'post_appointment',
      name: 'Через 2 часа после записи',
      message: 'Здравствуйте, %w! Спасибо, что выбрали нас! Пожалуйста, оставьте отзыв о процедуре %w: %w',
      isActive: true,
      route: SMS_PROSTO_CONFIG.ROUTES.TG_VK_WP_VB_SMS,
      priority: 3
    },
    {
      id: 4,
      type: 'return_reminder',
      name: 'Через 60 дней после записи',
      message: 'Здравствуйте, %w! Рекомендуем повторить процедуру %w. Запишитесь онлайн: %w',
      isActive: true,
      route: SMS_PROSTO_CONFIG.ROUTES.TG_VK_WP_VB_SMS,
      priority: 4
    }
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('sms_settings')
        .select('*')
        .single();

      if (error) throw error;

      setSettings(data);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Ошибка при загрузке настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (field: keyof SMSSettings, value: any) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
  };

  const handleTemplateChange = (id: number, field: string, value: string | boolean | number) => {
    setTemplates(templates.map(template => 
      template.id === id ? { ...template, [field]: value } : template
    ));
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('sms_settings')
        .update({
          api_key: settings.api_key,
          sender_name: settings.sender_name,
          default_route: settings.default_route,
          default_priority: settings.default_priority,
          test_mode: settings.test_mode,
          base_url: settings.base_url,
          location: settings.location,
          queue_check_interval: settings.queue_check_interval,
          batch_size: settings.batch_size
        })
        .eq('id', settings.id);

      if (error) {
        console.error('Error saving settings:', error);
        throw error;
      }
      
      // Check balance after saving
      const balance = await checkBalance();
      toast.success(`Настройки сохранены. Текущий баланс: ${balance} руб.`);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Ошибка при сохранении настроек');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckBalance = async () => {
    if (!settings?.api_key) {
      toast.error('API ключ не настроен');
      return;
    }

    try {
      const balance = await checkBalance();
      toast.success(`Текущий баланс: ${balance} руб.`);
    } catch (error) {
      console.error('Error checking balance:', error);
      if (error instanceof Error) {
        toast.error(`Ошибка при проверке баланса: ${error.message}`);
      } else {
        toast.error('Ошибка при проверке баланса');
      }
    }
  };

  const routeOptions = [
    { value: SMS_PROSTO_CONFIG.ROUTES.WHATSAPP_SMS, label: 'WhatsApp → SMS' },
    { value: SMS_PROSTO_CONFIG.ROUTES.WHATSAPP_TELEGRAM_SMS, label: 'WhatsApp → Telegram → SMS' },
    { value: SMS_PROSTO_CONFIG.ROUTES.WHATSAPP_VK_SMS, label: 'WhatsApp → VK → SMS' },
    { value: SMS_PROSTO_CONFIG.ROUTES.WHATSAPP_VIBER_SMS, label: 'WhatsApp → Viber → SMS' },
    { value: SMS_PROSTO_CONFIG.ROUTES.TELEGRAM_VK_WP_SMS, label: 'Telegram → VK → WhatsApp → SMS' },
    { value: SMS_PROSTO_CONFIG.ROUTES.VK_WP_VB_SMS, label: 'VK → WhatsApp → Viber → SMS' },
    { value: SMS_PROSTO_CONFIG.ROUTES.TG_VK_WP_VB_SMS, label: 'Telegram → VK → WhatsApp → Viber → SMS' },
  ];

  const priorityOptions = [
    { value: 1, label: 'Высокий (SMS коды, срочные уведомления)', description: 'Только для SMS кодов и одиночных уведомлений, требующих мгновенной доставки' },
    { value: 2, label: 'Средний (Одиночные уведомления)', description: 'Для быстрой доставки одиночных уведомлений' },
    { value: 3, label: 'Низкий (Групповые уведомления)', description: 'Для уведомлений, рассылаемых небольшим группам' },
    { value: 4, label: 'Массовый (Рассылки)', description: 'Для массовых рассылок' },
  ];

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

  if (!settings) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Ошибка загрузки настроек</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-amber-500">Настройки</h1>
        <button
          onClick={handleCheckBalance}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors flex items-center gap-2"
        >
          <DollarSign className="w-5 h-5" />
          Проверить баланс
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          {/* SMS-Prosto Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Smartphone className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Настройки SMS-Prosto</h3>
                <p className="text-sm text-gray-400">Настройка интеграции с SMS-Prosto</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Ключ
                </label>
                <input
                  type="password"
                  value={settings.api_key}
                  onChange={(e) => handleSettingChange('api_key', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  placeholder="Введите API ключ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Имя отправителя
                </label>
                <input
                  type="text"
                  value={settings.sender_name}
                  onChange={(e) => handleSettingChange('sender_name', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                  placeholder="InTonus"
                  maxLength={11}
                />
                <p className="mt-1 text-sm text-gray-400">
                  До 11 символов латиницей или до 15 цифрами
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Маршрут по умолчанию
                </label>
                <select
                  value={settings.default_route}
                  onChange={(e) => handleSettingChange('default_route', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                >
                  {routeOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-neutral-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Приоритет по умолчанию
                </label>
                <select
                  value={settings.default_priority}
                  onChange={(e) => handleSettingChange('default_priority', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                >
                  {priorityOptions.map((option) => (
                    <option key={option.value} value={option.value} className="bg-neutral-900">
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.test_mode}
                    onChange={(e) => handleSettingChange('test_mode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                  <span className="ml-3 text-sm text-gray-400">
                    Тестовый режим (без реальной отправки)
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Базовый URL
                </label>
                <input
                  type="text"
                  value={settings.base_url}
                  onChange={(e) => handleSettingChange('base_url', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Адрес
                </label>
                <input
                  type="text"
                  value={settings.location}
                  onChange={(e) => handleSettingChange('location', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Интервал проверки очереди (мс)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="1000"
                  value={settings.queue_check_interval}
                  onChange={(e) => handleSettingChange('queue_check_interval', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Размер пакета сообщений
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={settings.batch_size}
                  onChange={(e) => handleSettingChange('batch_size', Number(e.target.value))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                />
              </div>
            </div>
          </motion.div>

          {/* Message Templates */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <MessageSquare className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Шаблоны сообщений</h3>
                <p className="text-sm text-gray-400">Настройка автоматических сообщений</p>
              </div>
            </div>

            <div className="space-y-6">
              {templates.map((template) => (
                <div key={template.id} className="p-4 bg-white/5 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{template.name}</h4>
                    <div className="flex items-center gap-4">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={template.isActive}
                          onChange={(e) => handleTemplateChange(template.id, 'isActive', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Маршрут доставки
                    </label>
                    <select
                      value={template.route}
                      onChange={(e) => handleTemplateChange(template.id, 'route', e.target.value)}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    >
                      {routeOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-neutral-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Приоритет
                    </label>
                    <select
                      value={template.priority}
                      onChange={(e) => handleTemplateChange(template.id, 'priority', Number(e.target.value))}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    >
                      {priorityOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-neutral-900">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Текст сообщения
                    </label>
                    <textarea
                      value={template.message}
                      onChange={(e) => handleTemplateChange(template.id, 'message', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                    />
                  </div>

                  <div className="text-sm text-gray-400">
                    <p>Доступные переменные:</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        { var: '%w', desc: 'Текст (имя, название и т.д.)' },
                        { var: '%d', desc: 'Числа (время, дата и т.д.)' },
                        { var: '%w{1,n}', desc: 'Последовательность слов' },
                        { var: '%d+', desc: 'Последовательность чисел' },
                      ].map((variable) => (
                        <div
                          key={variable.var}
                          className="group relative px-2 py-1 bg-amber-500/10 text-amber-500 rounded-md cursor-help"
                        >
                          {variable.var}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-neutral-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                            {variable.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Side Settings */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <Info className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Приоритеты</h3>
                <p className="text-sm text-gray-400">Информация о приоритетах</p>
              </div>
            </div>

            <div className="space-y-4">
              {priorityOptions.map((priority) => (
                <div
                  key={priority.value}
                  className="p-4 bg-white/5 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Приоритет {priority.value}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      priority.value === 1
                        ? 'bg-red-500/10 text-red-500'
                        : priority.value === 2
                        ? 'bg-amber-500/10 text-amber-500'
                        : priority.value === 3
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {priority.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{priority.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <AlertCircle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Важная информация</h3>
                <p className="text-sm text-gray-400">Правила использования</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-400">
              <p>
                • Не используйте высокий приоритет для массовых рассылок
              </p>
              <p>
                • Избегайте смешивания русских и английских символов в одном слове
              </p>
              <p>
                • Для срочных сообщений не используйте отложенную отправку
              </p>
              <p>
                • Каскадная отправка может увеличить время доставки
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Сохранение...
            </>
          ) : (
            'Сохранить изменения'
          )}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
