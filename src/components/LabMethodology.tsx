import React from 'react';
import { BookOpen, CheckSquare, Target, Zap, TrendingUp, Camera, HelpCircle } from 'lucide-react';

export const LabMethodology: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
          <BookOpen className="w-3.5 h-3.5" />
          Методика эксперимента
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Как провести и оформить физическую проверку фильтра на реальном железе
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Пошаговая инструкция для второкурсника: как за 15 минут снять скриншоты графиков для статьи или отчета, доказывающие, что фильтр Калмана со стробированием реально работает.
        </p>
      </div>

      {/* 3 Real Physical Experiments */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Step 1: Static Test */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm mb-3">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">
              Опыт 1: Подавление шума на неподвижной мишени
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              <strong>Цель:</strong> Показать, что фильтр убирает хаотичное дрожание замеров сенсора.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Положите линейку на стол и закрепите датчик на 0 см.</li>
              <li>Поставьте белую коробку или книгу на отметку 40 см (400 мм).</li>
              <li>Откройте <strong>Плоттер по последовательному порту</strong> (Ctrl+Shift+L).</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-emerald-700">Ожидаемый результат:</span> Сырая кривая колеблется в диапазоне ±8 мм, а линия Калмана идет почти строго горизонтально. Зеленый светодиод горит непрерывно.
          </div>
        </div>

        {/* Step 2: Gating Test */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm mb-3">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">
              Опыт 2: Отсечение выброса стробированием
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              <strong>Цель:</strong> Доказать, что кратковременный оптический выброс игнорируется алгоритмом.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Мишень остается неподвижной на 50 см.</li>
              <li>Быстро взмахните карандашом или пальцем поперек луча (на ~10 см).</li>
              <li>Посмотрите на плоттер и светодиод.</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-red-700">Ожидаемый результат:</span> Светодиод на мгновение вспыхивает <strong className="text-red-600">красным</strong>. Сырая линия проваливается вниз до 10 см, а фильтр Калмана удерживает 50 см!
          </div>
        </div>

        {/* Step 3: Dynamic Tracking */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm mb-3">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-2">
              Опыт 3: Динамическое слежение без задержки
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              <strong>Цель:</strong> Показать преимущество Калмана перед обычным скользящим средним.
            </p>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Плавно ведите коробку рукой по линейке от 20 до 80 см и обратно.</li>
              <li>Скорость движения: ~10–20 см/сек.</li>
              <li>Следите за синхронностью кривой в плоттере.</li>
            </ul>
          </div>
          <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700">
            <span className="font-semibold text-blue-700">Ожидаемый результат:</span> Линия фильтра плавно и без визуального отставания повторяет реальное движение руки, сглаживая шум.
          </div>
        </div>
      </div>

      {/* Checklist for Article & Defense */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="w-5 h-5 text-purple-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Что прикрепить к статье или презентации
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>1. Фотографию собранного стенда:</strong> плата Arduino Uno + макетка с дальномером VL53L0X и горящим зеленым/красным светодиодом KY-016 на фоне деревянной линейки и мишени.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>2. Скриншот из Arduino IDE Serial Plotter:</strong> момент взмаха карандаша (одиночный красный пик на сырых данных и ровная линия фильтра). Это классический график, который преподаватели очень любят в научных отчетах.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong>3. Сравнительную таблицу среднеквадратичной ошибки (СКО / RMSE):</strong> рассчитайте СКО для неподвижного объекта (обычно для сырых данных VL53L0X СКО составляет 12–18 мм, а после фильтра Калмана — около 3–5 мм, снижение шума на 65–75%).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
