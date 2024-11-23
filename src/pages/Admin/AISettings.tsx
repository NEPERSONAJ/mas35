import React from 'react';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, Brain, Sliders } from 'lucide-react';

const AdminAISettings = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-amber-500">Настройки ИИ</h1>

      {/* AI Models Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Brain className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Модель ИИ</h3>
              <p className="text-sm text-gray-400">Выберите модель для использования</p>
            </div>
          </div>

          <div className="space-y-4">
            {['GPT-4', 'GPT-3.5', 'Claude-2'].map((model) => (
              <label
                key={model}
                className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer group hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="ai-model"
                    className="form-radio h-4 w-4 text-amber-500 focus:ring-amber-500"
                  />
                  <span>{model}</span>
                </div>
                <span className="text-sm text-gray-400 group-hover:text-amber-500 transition-colors">
                  Рекомендуется
                </span>
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <MessageSquare className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Настройки чата</h3>
              <p className="text-sm text-gray-400">Настройте параметры общения</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Температура
              </label>
              <input
                type="range"
                min="0"
                max="100"
                className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-gray-400 mt-1">
                <span>Точный</span>
                <span>Креативный</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Максимальная длина ответа
              </label>
              <input
                type="number"
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-white"
                placeholder="2000"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Advanced Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-500/10 rounded-lg">
            <Sliders className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Расширенные настройки</h3>
            <p className="text-sm text-gray-400">Дополнительные параметры ИИ</p>
          </div>
        </div>

        <div className="space-y-4">
          {[
            'Автоматические ответы на сообщения',
            'Анализ тональности сообщений',
            'Приоритизация срочных запросов',
            'Сохранение истории диалогов',
          ].map((setting) => (
            <label
              key={setting}
              className="flex items-center justify-between p-4 bg-white/5 rounded-lg cursor-pointer group hover:bg-white/10 transition-colors"
            >
              <span>{setting}</span>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out">
                <input
                  type="checkbox"
                  className="peer absolute w-0 h-0 opacity-0"
                />
                <div className="absolute inset-0 bg-white/10 peer-checked:bg-amber-500 rounded-full transition-colors"></div>
                <div className="absolute inset-y-1 start-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </div>
            </label>
          ))}
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors">
          Сохранить настройки
        </button>
      </div>
    </div>
  );
};

export default AdminAISettings;