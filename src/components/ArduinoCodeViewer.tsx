import React, { useState } from 'react';
import { Check, Copy, Download, Code2, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ARDUINO_SKETCH_CODE, CODE_IMPROVEMENTS } from '../data/arduinoCode';

export const ArduinoCodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(ARDUINO_SKETCH_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([ARDUINO_SKETCH_CODE], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'kalman_vl53l0x.ino';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header & Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200/60 mb-2">
              <Code2 className="w-3.5 h-3.5" />
              Проверенный скетч Arduino C++
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Скетч для Arduino IDE: kalman_vl53l0x.ino
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Код полностью проверен, очищен от багов компиляции ядра AVR и готов к прошивке в Arduino Uno или Nano.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-slate-800 bg-slate-100 hover:bg-slate-200 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Скопировано в буфер!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Скопировать весь код</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Скачать .ino файл</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Inspector Box */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            <span className="ml-2 text-slate-300">arduino/kalman_vl53l0x.ino</span>
          </div>
          <span className="text-slate-500 font-mono">132 строки • C++ (AVR)</span>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-[500px]">
          <code>{ARDUINO_SKETCH_CODE}</code>
        </pre>
      </div>

      {/* Code Review & Fixes Explanations */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Что мы исправили и улучшили в коде (для отчета и защиты)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CODE_IMPROVEMENTS.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-slate-50 border border-slate-200/80">
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <span className="font-semibold text-xs text-slate-900">{item.title}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.badgeType === 'error'
                      ? 'bg-red-100 text-red-700'
                      : item.badgeType === 'warning'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.badge}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
