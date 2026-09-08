import React, { useState } from 'react';
import { Check, Copy, Download, FileText, Github, Eye, Code, ExternalLink, Sparkles } from 'lucide-react';
import { README_MARKDOWN_TEXT } from '../data/readmeContent';

export const ReadmeViewer: React.FC = () => {
  const [viewMode, setViewMode] = useState<'rendered' | 'raw'>('rendered');
  const [copied, setCopied] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const SIMULATOR_URL = 'https://ais-pre-ishz2tgkusutrgt5ax7uro-887479770409.europe-west2.run.app';

  const handleCopy = () => {
    navigator.clipboard.writeText(README_MARKDOWN_TEXT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(SIMULATOR_URL);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([README_MARKDOWN_TEXT], { type: 'text/markdown;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'README.md';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header with quick copy */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <Github className="w-3.5 h-3.5" />
              Готовый README.md для GitHub
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Оформление репозитория для статьи
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Написано понятным языком второкурсника: бейджи, прямая ссылка на симулятор, векторная SVG-схема, таблица пинов и методика эксперимента.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
              <button
                onClick={() => setViewMode('rendered')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  viewMode === 'rendered'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Просмотр</span>
              </button>
              <button
                onClick={() => setViewMode('raw')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded font-medium transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                <span>Исходный Markdown</span>
              </button>
            </div>

            <button
              onClick={handleCopyUrl}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
              title="Скопировать ссылку на веб-симулятор"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ссылка скопирована!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ссылка на симулятор</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Скопировано!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать README.md</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container: GitHub-like Box */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2 font-mono">
            <FileText className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-900">README.md</span>
          </div>
          <span className="text-slate-400">Корень репозитория</span>
        </div>

        {viewMode === 'raw' ? (
          <div className="p-4 bg-slate-950 overflow-x-auto">
            <pre className="text-xs font-mono text-slate-200 leading-relaxed max-h-[600px] overflow-y-auto">
              <code>{README_MARKDOWN_TEXT}</code>
            </pre>
          </div>
        ) : (
          <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6 text-slate-800 text-sm leading-relaxed">
            {/* Title & Badge */}
            <div className="border-b border-slate-200 pb-5 space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Фильтрация данных дальномера VL53L0X (Фильтр Калмана + Стробирование)
              </h1>
              
              <div className="p-3 bg-blue-50/80 border border-blue-200/80 rounded-lg text-xs text-blue-900 flex items-center gap-2">
                <span className="text-base">🎓</span>
                <span>
                  <strong>Проект для научной статьи / курсовой работы (2 семестр)</strong> — практическая реализация и аппаратная проверка на Arduino Uno.
                </span>
              </div>

              {/* GitHub Badges preview */}
              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href={SIMULATOR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded font-mono text-xs font-bold transition-colors"
                >
                  <span>🧪 Онлайн Демо</span>
                  <span className="bg-sky-800 px-1.5 py-0.5 rounded text-[10px]">Интерактивный Симулятор</span>
                </a>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-600 text-white rounded font-mono text-xs font-bold">
                  <span>Arduino Uno</span>
                  <span className="bg-teal-800 px-1.5 py-0.5 rounded text-[10px]">VL53L0X Kalman</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 text-white rounded font-mono text-xs font-bold">
                  <span>Схема</span>
                  <span className="bg-emerald-800 px-1.5 py-0.5 rounded text-[10px]">docs/wiring_diagram.svg</span>
                </span>
              </div>
            </div>

            {/* Interactive Simulator Section */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
                  <span>🎮</span> Интерактивный онлайн-симулятор стенда
                </h2>
                <a
                  href={SIMULATOR_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 underline"
                >
                  <span>Открыть в новой вкладке</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-blue-900/80">
                Прямая ссылка для вставки в репозиторий: любой читатель вашей статьи или репозитория может проверить алгоритм прямо в браузере.
              </p>
              <div className="pt-1">
                <code className="text-[11px] bg-white px-2 py-1 rounded border border-blue-200 text-blue-800 font-mono block select-all">
                  {SIMULATOR_URL}
                </code>
              </div>
            </div>

            {/* About Section */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📌</span> О проекте простыми словами
              </h2>
              <p className="text-slate-600">
                Оптические лазерные дальномеры (LiDAR / ToF) измеряют расстояние по времени полета фотонов. В реальных условиях на показания влияют случайный мелкий шум и резкие одиночные выбросы (блики, пыль, взмах руки).
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-slate-700 pl-2">
                <li>
                  <strong className="text-slate-900">Стробирование (Gating / Δ<sub>max</sub>)</strong> — отсекает физически невозможные скачки за 50 мс (зажигая красный светодиод).
                </li>
                <li>
                  <strong className="text-slate-900">Фильтр Калмана</strong> — оптимально сглаживает остаточный белый шум без запаздывания (зеленый светодиод).
                </li>
              </ul>
            </div>

            {/* Components */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🛠️</span> Необходимые компоненты
              </h2>
              <ul className="list-disc list-inside space-y-1 text-slate-700 pl-2">
                <li>Плата Arduino Uno или Arduino Nano (ATmega328P)</li>
                <li>Лазерный дальномер VL53L0X (I2C)</li>
                <li>RGB-светодиодный модуль KY-016 (общий катод -)</li>
                <li>Макетная плата, соединительные провода</li>
                <li>Обычная линейка (30–50 см) и белая книга/мишень</li>
              </ul>
            </div>

            {/* Wiring Table & Vector SVG */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>🔌</span> Схема подключения проводов (SVG)
                </h2>
                <a
                  href="/wiring_diagram.svg"
                  download="wiring_diagram.svg"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                >
                  <Download className="w-3 h-3" />
                  <span>Скачать docs/wiring_diagram.svg</span>
                </a>
              </div>

              {/* Vector SVG Image Preview */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-900">
                <img
                  src="/wiring_diagram.svg"
                  alt="Принципиальная схема подключения проводов Arduino + VL53L0X + KY-016"
                  className="w-full h-auto block"
                  loading="lazy"
                />
              </div>
              <p className="text-xs text-slate-500 italic">
                Файл <code>docs/wiring_diagram.svg</code> отображается в GitHub без потери четкости при любом масштабе.
              </p>

              <div className="overflow-x-auto border border-slate-200 rounded-lg mt-3">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Модуль</th>
                      <th className="px-3 py-2">Пин модуля</th>
                      <th className="px-3 py-2">Пин Arduino</th>
                      <th className="px-3 py-2">Назначение</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700">
                    <tr>
                      <td className="px-3 py-2 font-medium">VL53L0X</td>
                      <td className="px-3 py-2 font-mono">VIN</td>
                      <td className="px-3 py-2 font-mono text-red-600 font-bold">5V</td>
                      <td className="px-3 py-2">Питание датчика</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">VL53L0X</td>
                      <td className="px-3 py-2 font-mono">GND</td>
                      <td className="px-3 py-2 font-mono text-slate-900 font-bold">GND</td>
                      <td className="px-3 py-2">Общий провод</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">VL53L0X</td>
                      <td className="px-3 py-2 font-mono">SDA</td>
                      <td className="px-3 py-2 font-mono text-blue-600 font-bold">A4</td>
                      <td className="px-3 py-2">I2C Data</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">VL53L0X</td>
                      <td className="px-3 py-2 font-mono">SCL</td>
                      <td className="px-3 py-2 font-mono text-amber-600 font-bold">A5</td>
                      <td className="px-3 py-2">I2C Clock</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">KY-016 (RGB)</td>
                      <td className="px-3 py-2 font-mono">- (GND)</td>
                      <td className="px-3 py-2 font-mono text-slate-900 font-bold">GND</td>
                      <td className="px-3 py-2">Общий катод</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">KY-016 (RGB)</td>
                      <td className="px-3 py-2 font-mono">R (Red)</td>
                      <td className="px-3 py-2 font-mono text-orange-600 font-bold">Pin 9</td>
                      <td className="px-3 py-2">Индикатор аномалии</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-medium">KY-016 (RGB)</td>
                      <td className="px-3 py-2 font-mono">G (Green)</td>
                      <td className="px-3 py-2 font-mono text-emerald-600 font-bold">Pin 10</td>
                      <td className="px-3 py-2">Индикатор нормы</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quickstart steps */}
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🚀</span> Инструкция по запуску
              </h2>
              <ol className="list-decimal list-inside space-y-2 text-slate-700 pl-2 text-xs md:text-sm">
                <li>
                  Установите библиотеку <code>Adafruit VL53L0X</code> через менеджер библиотек (Ctrl+Shift+I).
                </li>
                <li>
                  Откройте скетч <code>kalman_vl53l0x.ino</code> и загрузите его в плату через USB.
                </li>
                <li>
                  Откройте <strong>Плоттер по последовательному соединению</strong> (Ctrl+Shift+L) на скорости 9600 бод.
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
