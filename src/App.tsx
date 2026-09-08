import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  FileText,
  Code2,
  BookOpen,
  Check,
  Copy,
  Download,
  Github,
  Sparkles
} from 'lucide-react';
import { ActiveTab } from './types';
import { PhysicsExperimentSimulator } from './components/PhysicsExperimentSimulator';
import { WiringDiagram } from './components/WiringDiagram';
import { ReadmeViewer } from './components/ReadmeViewer';
import { ArduinoCodeViewer } from './components/ArduinoCodeViewer';
import { LabMethodology } from './components/LabMethodology';
import { README_MARKDOWN_TEXT } from './data/readmeContent';
import { ARDUINO_SKETCH_CODE } from './data/arduinoCode';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [copiedReadme, setCopiedReadme] = useState(false);

  const handleQuickCopyReadme = () => {
    navigator.clipboard.writeText(README_MARKDOWN_TEXT);
    setCopiedReadme(true);
    setTimeout(() => setCopiedReadme(false), 2000);
  };

  const handleQuickDownloadIno = () => {
    const element = document.createElement('a');
    const file = new Blob([ARDUINO_SKETCH_CODE], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'kalman_vl53l0x.ino';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo / Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold text-slate-900 tracking-tight">
                    VL53L0X Kalman Filter Lab
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                    2 курс • Статья / Отчет
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Фильтр Калмана + Стробирование • Arduino Uno / Nano • Дальномер ToF
                </p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleQuickCopyReadme}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
              >
                {copiedReadme ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Скопировано!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Скопировать README.md</span>
                  </>
                )}
              </button>
              <button
                onClick={handleQuickDownloadIno}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать .ino</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 border-t border-slate-100 py-1.5 overflow-x-auto text-xs font-medium">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'simulator'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Физическая проверка & Симулятор</span>
            </button>

            <button
              onClick={() => setActiveTab('schematic')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'schematic'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Схема подключения проводов</span>
            </button>

            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'readme'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Github className="w-4 h-4" />
              <span>Готовый README.md</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'code'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Скетч Arduino (.ino)</span>
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === 'methodology'
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200/80 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Методика экспериментов</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'simulator' && <PhysicsExperimentSimulator />}
        {activeTab === 'schematic' && <WiringDiagram />}
        {activeTab === 'readme' && <ReadmeViewer />}
        {activeTab === 'code' && <ArduinoCodeViewer />}
        {activeTab === 'methodology' && <LabMethodology />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Проект фильтрации данных лазерного дальномера VL53L0X для курсовой / научной статьи
          </span>
          <span className="font-mono text-slate-400">
            Arduino Uno • Adafruit_VL53L0X • KY-016 RGB
          </span>
        </div>
      </footer>
    </div>
  );
}
