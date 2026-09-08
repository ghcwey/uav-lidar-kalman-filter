import React, { useState } from 'react';
import { Check, Copy, Info, AlertTriangle, Cpu, Layers, Download, ExternalLink, Sparkles, FileCode, Github } from 'lucide-react';

interface WirePin {
  fromDevice: string;
  fromPin: string;
  toDevice: string;
  toPin: string;
  colorName: string;
  hexColor: string;
  role: string;
  note: string;
}

const WIRING_DATA: WirePin[] = [
  {
    fromDevice: 'VL53L0X',
    fromPin: 'VIN',
    toDevice: 'Arduino',
    toPin: '5V',
    colorName: 'Красный',
    hexColor: '#ef4444',
    role: 'Питание датчика',
    note: 'Модули со встроенным LDO (например GY-530) питаются от 5V или 3.3V',
  },
  {
    fromDevice: 'VL53L0X',
    fromPin: 'GND',
    toDevice: 'Arduino',
    toPin: 'GND',
    colorName: 'Черный',
    hexColor: '#1e293b',
    role: 'Общий провод (Земля)',
    note: 'Соединяет опорный потенциал датчика и контроллера',
  },
  {
    fromDevice: 'VL53L0X',
    fromPin: 'SDA',
    toDevice: 'Arduino',
    toPin: 'A4',
    colorName: 'Синий',
    hexColor: '#3b82f6',
    role: 'I2C Data (Данные)',
    note: 'На Arduino Uno/Nano аппаратно выведен на аналоговый пин A4',
  },
  {
    fromDevice: 'VL53L0X',
    fromPin: 'SCL',
    toDevice: 'Arduino',
    toPin: 'A5',
    colorName: 'Желтый',
    hexColor: '#eab308',
    role: 'I2C Clock (Такты)',
    note: 'На Arduino Uno/Nano аппаратно выведен на аналоговый пин A5',
  },
  {
    fromDevice: 'KY-016',
    fromPin: '- (GND)',
    toDevice: 'Arduino',
    toPin: 'GND',
    colorName: 'Черный',
    hexColor: '#334155',
    role: 'Общий катод светодиода',
    note: 'Если у модуля общий анод (+), этот провод подключается к 5V',
  },
  {
    fromDevice: 'KY-016',
    fromPin: 'R (Red)',
    toDevice: 'Arduino',
    toPin: 'Pin 9',
    colorName: 'Оранжевый',
    hexColor: '#f97316',
    role: 'Индикатор аномалий / выбросов',
    note: 'Загорается красным при срабатывании стробирования (отсечении)',
  },
  {
    fromDevice: 'KY-016',
    fromPin: 'G (Green)',
    toDevice: 'Arduino',
    toPin: 'Pin 10',
    colorName: 'Зеленый',
    hexColor: '#10b981',
    role: 'Индикатор нормы / фильтрации',
    note: 'Горит зеленым, когда замер в допуске и обновляет Калман',
  },
];

export const WiringDiagram: React.FC = () => {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [isCommonAnode, setIsCommonAnode] = useState<boolean>(false);
  const [copiedAscii, setCopiedAscii] = useState(false);
  const [copiedSvgMarkdown, setCopiedSvgMarkdown] = useState(false);
  const [copiedSimulatorLink, setCopiedSimulatorLink] = useState(false);

  const SIMULATOR_URL = 'https://ais-pre-ishz2tgkusutrgt5ax7uro-887479770409.europe-west2.run.app';
  const SVG_MARKDOWN_CODE = '![Схема подключения проводов Arduino + VL53L0X + KY-016](docs/wiring_diagram.svg)';

  const asciiArt = `
       +------------------------------------------------------+
       |                    ARDUINO UNO                       |
       |                                                      |
       |  [5V]   [GND]         [A4]   [A5]        [D9]  [D10] |
       +---|-------|------------|------|-----------|------|---+
           |       |            |      |           |      |
           |       |   +--------+      |           |      |
           |       |   |  +------------+           |      |
           |       |   |  |                        |      |
       +---|-------|---|--|----+              +----|------|-----+
       |  VIN     GND SDA SCL  |              | R  G      -     |
       |                       |              | (Красн)  (GND)  |
       |     VL53L0X (ToF)     |              |   KY-016 (RGB)  |
       +-----------------------+              +-----------------+
  `.trim();

  const handleCopyAscii = () => {
    navigator.clipboard.writeText(asciiArt);
    setCopiedAscii(true);
    setTimeout(() => setCopiedAscii(false), 2000);
  };

  const handleDownloadSvg = () => {
    const link = document.createElement('a');
    link.href = '/wiring_diagram.svg';
    link.download = 'wiring_diagram.svg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySvgMarkdown = () => {
    navigator.clipboard.writeText(SVG_MARKDOWN_CODE);
    setCopiedSvgMarkdown(true);
    setTimeout(() => setCopiedSvgMarkdown(false), 2000);
  };

  const handleCopySimulatorLink = () => {
    navigator.clipboard.writeText(SIMULATOR_URL);
    setCopiedSimulatorLink(true);
    setTimeout(() => setCopiedSimulatorLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              Аппаратная коммутация
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Схема подключения модулей к Arduino
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Датчик расстояния VL53L0X подключается по стандартной шине I2C (A4/A5), а модуль светодиода KY-016 управляется через цифровые выходы D9 и D10.
            </p>
          </div>

          {/* Toggle Common Anode / Cathode */}
          <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg border border-slate-200 text-xs">
            <span className="text-slate-600 font-medium">Тип светодиода:</span>
            <button
              onClick={() => setIsCommonAnode(false)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                !isCommonAnode
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Общий катод (-)
            </button>
            <button
              onClick={() => setIsCommonAnode(true)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                isCommonAnode
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Общий анод (+)
            </button>
          </div>
        </div>

        {isCommonAnode && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Внимание для модуля с общим анодом (+):</span> Вывод питания светодиода подключается к <strong>5V</strong> (вместо GND). Сигналы инвертируются: для включения цвета на пин Arduino подается <code>LOW</code>, а для выключения — <code>HIGH</code>.
            </div>
          </div>
        )}
      </div>

      {/* GitHub Integration Card: How to embed into GitHub */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl p-5 text-white border border-slate-700 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <Github className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Для вашего репозитория на GitHub
              </span>
            </div>
            <h3 className="text-base font-bold text-white">
              Как вставить симулятор и схему подключения на GitHub?
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong>Схема:</strong> GitHub нативно рендерит векторный файл <code>.svg</code> прямо в README без размытия. 
              <br />
              <strong>Симулятор:</strong> Сам интерактивный код не может выполняться внутри README из-за политик безопасности GitHub, поэтому в шапку добавляется кликабельный бейдж-кнопка прямого перехода.
            </p>
          </div>

          {/* Quick Buttons for GitHub */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadSvg}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Скачать файл wiring_diagram.svg для папки docs/ в репозитории"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать схему (.SVG)</span>
            </button>

            <button
              onClick={handleCopySvgMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors border border-slate-600"
              title="Скопировать строку для README.md: ![Схема](docs/wiring_diagram.svg)"
            >
              {copiedSvgMarkdown ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Скопировано в буфер!</span>
                </>
              ) : (
                <>
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Код для README</span>
                </>
              )}
            </button>

            <button
              onClick={handleCopySimulatorLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Скопировать прямую ссылку на онлайн-симулятор"
            >
              {copiedSimulatorLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Ссылка скопирована!</span>
                </>
              ) : (
                <>
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Ссылка на симулятор</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Snippet Preview */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono block mb-1">Строка для вставки схемы в README.md:</span>
            <code className="text-emerald-300 font-mono text-xs block break-all select-all">
              ![Схема подключения](docs/wiring_diagram.svg)
            </code>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <span className="text-[11px] text-slate-400 font-mono block mb-1">Бейдж онлайн-симулятора для README.md:</span>
            <code className="text-blue-300 font-mono text-xs block break-all select-all">
              [![Онлайн-симулятор](https://img.shields.io/badge/🧪_Демо-Симулятор-0284c7?style=for-the-badge)]({SIMULATOR_URL})
            </code>
          </div>
        </div>
      </div>

      {/* Visual Interactive SVG Schematic Board */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-white overflow-hidden shadow-sm relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Интерактивная принципиальная схема соединений
            </span>
          </div>
          <span className="text-xs text-slate-400">Наведите курсор на провод для подсветки</span>
        </div>

        {/* SVG Schematic Canvas */}
        <div className="w-full overflow-x-auto pb-2">
          <svg
            viewBox="0 0 880 440"
            className="w-full min-w-[720px] max-w-[880px] mx-auto select-none"
          >
            <defs>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="arduinoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="sensorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#334155" />
              </linearGradient>
              <linearGradient id="ledGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
            </defs>

            {/* Background Grid Pattern */}
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            <rect width="880" height="440" fill="url(#grid)" />

            {/* --- ARDUINO UNO BOARD --- */}
            <g transform="translate(180, 40)">
              {/* Board body */}
              <rect
                x="0"
                y="0"
                width="520"
                height="150"
                rx="10"
                fill="url(#arduinoGrad)"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
              <text x="260" y="32" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="15" letterSpacing="2">
                ARDUINO UNO / NANO (ATmega328P)
              </text>
              <rect x="230" y="55" width="60" height="50" rx="3" fill="#0f172a" stroke="#475569" strokeWidth="1" />
              <text x="260" y="85" textAnchor="middle" fill="#94a3b8" fontSize="9" fontFamily="monospace">MCU</text>
              <rect x="15" y="50" width="40" height="26" rx="2" fill="#94a3b8" />
              <text x="35" y="66" textAnchor="middle" fill="#1e293b" fontSize="8" fontWeight="bold">USB</text>

              {/* Power Pin Header (Left side) */}
              <g transform="translate(40, 115)">
                {/* 5V Pin */}
                <circle cx="20" cy="15" r="7" fill={hoveredPin === '5V' ? '#ef4444' : '#1e293b'} stroke="#f87171" strokeWidth="2" />
                <text x="20" y="3" textAnchor="middle" fill="#fca5a5" fontSize="10" fontWeight="bold">5V</text>

                {/* GND Pin */}
                <circle cx="50" cy="15" r="7" fill={hoveredPin === 'GND' ? '#94a3b8' : '#1e293b'} stroke="#cbd5e1" strokeWidth="2" />
                <text x="50" y="3" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="bold">GND</text>
              </g>

              {/* Analog I2C Pin Header (Middle) */}
              <g transform="translate(160, 115)">
                {/* A4 (SDA) */}
                <circle cx="20" cy="15" r="7" fill={hoveredPin === 'A4' ? '#3b82f6' : '#1e293b'} stroke="#60a5fa" strokeWidth="2" />
                <text x="20" y="3" textAnchor="middle" fill="#93c5fd" fontSize="10" fontWeight="bold">A4 (SDA)</text>

                {/* A5 (SCL) */}
                <circle cx="70" cy="15" r="7" fill={hoveredPin === 'A5' ? '#eab308' : '#1e293b'} stroke="#facc15" strokeWidth="2" />
                <text x="70" y="3" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="bold">A5 (SCL)</text>
              </g>

              {/* Digital Pins Header (Right) */}
              <g transform="translate(360, 115)">
                {/* Pin 9 (Red) */}
                <circle cx="25" cy="15" r="7" fill={hoveredPin === 'Pin 9' ? '#f97316' : '#1e293b'} stroke="#fb923c" strokeWidth="2" />
                <text x="25" y="3" textAnchor="middle" fill="#fdba74" fontSize="10" fontWeight="bold">D9 (R)</text>

                {/* Pin 10 (Green) */}
                <circle cx="75" cy="15" r="7" fill={hoveredPin === 'Pin 10' ? '#10b981' : '#1e293b'} stroke="#34d399" strokeWidth="2" />
                <text x="75" y="3" textAnchor="middle" fill="#6ee7b7" fontSize="10" fontWeight="bold">D10 (G)</text>
              </g>
            </g>

            {/* --- VL53L0X SENSOR BOARD (Bottom Left) --- */}
            <g transform="translate(60, 270)">
              <rect x="0" y="0" width="280" height="130" rx="8" fill="url(#sensorGrad)" stroke="#64748b" strokeWidth="1.5" />
              <text x="140" y="30" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">
                VL53L0X ToF Laser Sensor
              </text>
              <rect x="120" y="45" width="40" height="24" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1" />
              <circle cx="132" cy="57" r="4" fill="#0f172a" stroke="#e0e7ff" />
              <circle cx="148" cy="57" r="4" fill="#f43f5e" />
              <text x="140" y="80" textAnchor="middle" fill="#94a3b8" fontSize="9">Оптический сенсор 940нм</text>

              {/* Sensor Pins */}
              <g transform="translate(25, 95)">
                {/* VIN */}
                <circle cx="20" cy="10" r="6" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
                <text x="20" y="27" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">VIN</text>

                {/* GND */}
                <circle cx="70" cy="10" r="6" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="70" y="27" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">GND</text>

                {/* SCL */}
                <circle cx="120" cy="10" r="6" fill="#eab308" stroke="#fef08a" strokeWidth="1.5" />
                <text x="120" y="27" textAnchor="middle" fill="#fde047" fontSize="9" fontWeight="bold">SCL</text>

                {/* SDA */}
                <circle cx="170" cy="10" r="6" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.5" />
                <text x="170" y="27" textAnchor="middle" fill="#93c5fd" fontSize="9" fontWeight="bold">SDA</text>
              </g>
            </g>

            {/* --- KY-016 RGB LED MODULE (Bottom Right) --- */}
            <g transform="translate(540, 270)">
              <rect x="0" y="0" width="280" height="130" rx="8" fill="url(#ledGrad)" stroke="#475569" strokeWidth="1.5" />
              <text x="140" y="30" textAnchor="middle" fill="#ffffff" fontWeight="bold" fontSize="13">
                KY-016 RGB LED Module
              </text>
              {/* LED bulb representation */}
              <circle cx="140" cy="60" r="16" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
              <circle cx="140" cy="60" r="10" fill="#22c55e" opacity="0.8" filter="url(#glow)" />
              <circle cx="140" cy="60" r="4" fill="#ffffff" />
              <text x="140" y="90" textAnchor="middle" fill="#94a3b8" fontSize="9">
                {isCommonAnode ? 'Общий анод (+)' : 'Общий катод (-)'}
              </text>

              {/* Module Pins */}
              <g transform="translate(30, 95)">
                {/* R */}
                <circle cx="30" cy="10" r="6" fill="#ef4444" stroke="#fca5a5" strokeWidth="1.5" />
                <text x="30" y="27" textAnchor="middle" fill="#fca5a5" fontSize="9" fontWeight="bold">R (Красн)</text>

                {/* G */}
                <circle cx="90" cy="10" r="6" fill="#10b981" stroke="#86efac" strokeWidth="1.5" />
                <text x="90" y="27" textAnchor="middle" fill="#86efac" fontSize="9" fontWeight="bold">G (Зел)</text>

                {/* B */}
                <circle cx="150" cy="10" r="6" fill="#1e293b" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                <text x="150" y="27" textAnchor="middle" fill="#64748b" fontSize="8">B (N/C)</text>

                {/* GND or + */}
                <circle cx="190" cy="10" r="6" fill="#334155" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x="190" y="27" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontWeight="bold">
                  {isCommonAnode ? '+' : '-'}
                </text>
              </g>
            </g>

            {/* --- JUMPER WIRES (Curved Bezier Paths) --- */}
            {/* Wire 1: 5V to VIN (Red) */}
            <path
              d="M 240 170 C 240 220, 105 220, 105 365"
              fill="none"
              stroke="#ef4444"
              strokeWidth={hoveredPin === '5V' ? 5 : 3}
              opacity={hoveredPin && hoveredPin !== '5V' ? 0.3 : 1}
              strokeLinecap="round"
              className="transition-all duration-200"
            />

            {/* Wire 2: GND to GND (Black/Slate) */}
            <path
              d="M 270 170 C 270 230, 155 230, 155 365"
              fill="none"
              stroke="#0f172a"
              strokeWidth={hoveredPin === 'GND' ? 5 : 3}
              strokeDasharray={hoveredPin === 'GND' ? 'none' : 'none'}
              opacity={hoveredPin && hoveredPin !== 'GND' ? 0.3 : 1}
              strokeLinecap="round"
              className="transition-all duration-200"
            />
            {/* White outline for GND wire so it's visible on dark bg */}
            <path
              d="M 270 170 C 270 230, 155 230, 155 365"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1"
              strokeDasharray="4 4"
            />

            {/* Wire 3: A5 to SCL (Yellow) */}
            <path
              d="M 410 170 C 410 240, 205 240, 205 365"
              fill="none"
              stroke="#eab308"
              strokeWidth={hoveredPin === 'A5' ? 5 : 3}
              opacity={hoveredPin && hoveredPin !== 'A5' ? 0.3 : 1}
              strokeLinecap="round"
              className="transition-all duration-200"
            />

            {/* Wire 4: A4 to SDA (Blue) */}
            <path
              d="M 360 170 C 360 250, 255 250, 255 365"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={hoveredPin === 'A4' ? 5 : 3}
              opacity={hoveredPin && hoveredPin !== 'A4' ? 0.3 : 1}
              strokeLinecap="round"
              className="transition-all duration-200"
            />

            {/* Wire 5: Pin 9 to R (Orange) */}
            <path
              d="M 565 170 C 565 240, 600 240, 600 365"
              fill="none"
              stroke="#f97316"
              strokeWidth={hoveredPin === 'Pin 9' ? 5 : 3}
              opacity={hoveredPin && hoveredPin !== 'Pin 9' ? 0.3 : 1}
              strokeLinecap="round"
              className="transition-all duration-200"
            />

            {/* Wire 6: Pin 10 to G (Green) */}
            <path
              d="M 615 170 C 615 245, 660 245, 660 365"
              fill="none"
              stroke="#10b981"
              strokeWidth={hoveredPin === 'Pin 10' ? 5 : 3}
              opacity={hoveredPin && hoveredPin !== 'Pin 10' ? 0.3 : 1}
              strokeLinecap="round"
              className="transition-all duration-200"
            />

            {/* Wire 7: GND to LED - (Black with dashes) */}
            <path
              d="M 270 170 C 270 210, 760 210, 760 365"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="4 4"
              opacity={hoveredPin && hoveredPin !== 'GND' ? 0.3 : 0.8}
              strokeLinecap="round"
              className="transition-all duration-200"
            />
          </svg>
        </div>
      </div>

      {/* Pinout Connection Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <h3 className="font-semibold text-slate-900 text-sm">Таблица назначения проводов</h3>
          </div>
          <button
            onClick={handleCopyAscii}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            {copiedAscii ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Скопировано!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Скопировать схему для README</span>
              </>
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Цвет провода</th>
                <th className="px-4 py-3">Модуль</th>
                <th className="px-4 py-3">Пин модуля</th>
                <th className="px-4 py-3">Пин Arduino</th>
                <th className="px-4 py-3">Функция</th>
                <th className="px-4 py-3">Пояснение для отчета</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {WIRING_DATA.map((wire, idx) => (
                <tr
                  key={idx}
                  onMouseEnter={() => setHoveredPin(wire.toPin)}
                  onMouseLeave={() => setHoveredPin(null)}
                  className={`hover:bg-slate-50 transition-colors ${
                    hoveredPin === wire.toPin ? 'bg-blue-50/70 font-medium' : ''
                  }`}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-black/10 shrink-0"
                        style={{ backgroundColor: wire.hexColor }}
                      />
                      <span className="font-medium text-slate-800">{wire.colorName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 font-medium text-slate-900">{wire.fromDevice}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-800">{wire.fromPin}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {wire.toPin}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{wire.role}</td>
                  <td className="px-4 py-2.5 text-slate-500">{wire.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Practical Tips for 2nd Year Student */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-900 font-medium text-sm mb-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Почему A4 и A5, а не обычные цифровые?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            В микроконтроллере ATmega328P аппаратный интерфейс I2C (двухпроводная шина TWI) разведен именно на пины <strong>A4 (SDA - Serial Data)</strong> и <strong>A5 (SCL - Serial Clock)</strong>. В библиотеке <code>Wire.h</code> эти пины настроены аппаратно по умолчанию.
          </p>
        </div>

        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
          <div className="flex items-center gap-2 text-slate-900 font-medium text-sm mb-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <span>Нужны ли подтягивающие резисторы (Pull-up)?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            На большинстве готовых китайских плат дальномера VL53L0X (синие или фиолетовые платы GY-530) уже распаяны подтягивающие SMD-резисторы 4.7 кОм к 3.3V/5V. Дополнительные резисторы на макетной плате не требуются.
          </p>
        </div>
      </div>
    </div>
  );
};
