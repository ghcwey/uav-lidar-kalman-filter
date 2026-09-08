import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  TrendingDown,
  Activity,
  Maximize2
} from 'lucide-react';
import { FilterParams, DataPoint, ExperimentStats } from '../types';

export const PhysicsExperimentSimulator: React.FC = () => {
  // Physical Target Position (meters)
  const [targetDistance, setTargetDistance] = useState<number>(0.45); // 450 mm
  const [isAutoMoving, setIsAutoMoving] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(true);

  // Filter & Sensor Parameters
  const [params, setParams] = useState<FilterParams>({
    Q: 0.2,
    R: 0.5,
    deltaMax: 0.3, // 30 cm
    sensorNoiseStd: 0.015, // 15 mm typical noise
  });

  // Simulator Internal Kalman State
  const kalmanState = useRef<{
    x_est: number;
    P: number;
    isInitialized: boolean;
    consecutiveAnomalies: number;
  }>({
    x_est: 0.45,
    P: 1.0,
    isInitialized: false,
    consecutiveAnomalies: 0,
  });

  // Glitch injection queue
  const pendingGlitchRef = useRef<number | null>(null);
  const [lastEvent, setLastEvent] = useState<{ type: 'normal' | 'anomaly'; text: string }>({
    type: 'normal',
    text: 'Система инициализирована',
  });

  // History buffer for chart
  const historyRef = useRef<DataPoint[]>([]);
  const [historyRenderTrigger, setHistoryRenderTrigger] = useState(0);

  // LED state for UI
  const [ledStatus, setLedStatus] = useState<'green' | 'red'>('green');

  // Stats
  const [stats, setStats] = useState<ExperimentStats>({
    rawRmse: 0,
    kalmanRmse: 0,
    noiseReductionPercent: 0,
    totalSamples: 0,
    anomaliesDetected: 0,
    currentK: 0.28,
  });

  // Canvas ref for Serial Plotter
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Bench interaction: drag target
  const benchTrackRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Sine motion phase
  const motionPhaseRef = useRef(0);

  // Reset filter
  const handleReset = () => {
    kalmanState.current = {
      x_est: targetDistance,
      P: 1.0,
      isInitialized: false,
      consecutiveAnomalies: 0,
    };
    historyRef.current = [];
    setStats({
      rawRmse: 0,
      kalmanRmse: 0,
      noiseReductionPercent: 0,
      totalSamples: 0,
      anomaliesDetected: 0,
      currentK: 0,
    });
    setLastEvent({ type: 'normal', text: 'Фильтр сброшен' });
  };

  // Inject a spike / glitch
  const triggerPencilGlitch = () => {
    // Quick pencil swipe at 0.12m
    pendingGlitchRef.current = 0.10 + Math.random() * 0.05;
    setLastEvent({
      type: 'anomaly',
      text: 'Взмах карандаша перед лучом (выброс d ≈ 12 см)',
    });
  };

  const triggerFarGlitch = () => {
    // Optical loss spike
    pendingGlitchRef.current = 1.15;
    setLastEvent({
      type: 'anomaly',
      text: 'Оптический блик / потеря сигнала (выброс d ≈ 1.15 м)',
    });
  };

  // Main simulation tick: runs every 50ms (20 Hz, matching Arduino delay(50))
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      // 1. Calculate ground truth
      let currentTrue = targetDistance;
      if (isAutoMoving) {
        motionPhaseRef.current += 0.05;
        // Oscillate between 0.25m and 0.85m smoothly
        currentTrue = 0.55 + 0.3 * Math.sin(motionPhaseRef.current);
        setTargetDistance(currentTrue);
      }

      // 2. Generate raw measurement with Gaussian noise or injected glitch
      // Box-Muller transform for normal distribution
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const gaussianNoise =
        Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * params.sensorNoiseStd;

      let z_k = currentTrue + gaussianNoise;

      // Check for manual glitch injection
      if (pendingGlitchRef.current !== null) {
        z_k = pendingGlitchRef.current;
        pendingGlitchRef.current = null;
      }

      // Ensure measurement is non-negative
      z_k = Math.max(0.02, z_k);

      // 3. Run Kalman Filter + Gating (Exact mirror of Arduino loop)
      const st = kalmanState.current;

      if (!st.isInitialized) {
        st.x_est = z_k;
        st.isInitialized = true;
        st.consecutiveAnomalies = 0;
      }

      // Prediction
      const x_pred = st.x_est;
      const P_pred = st.P + params.Q;

      // Gating test
      const residual = Math.abs(z_k - x_pred);
      let isAnomaly = false;
      let calculatedK = P_pred / (P_pred + params.R);

      if (residual <= params.deltaMax) {
        // Normal gated update
        st.consecutiveAnomalies = 0;
        const K = calculatedK;
        st.x_est = x_pred + K * (z_k - x_pred);
        st.P = (1.0 - K) * P_pred;
        setLedStatus('green');
      } else {
        // Anomaly / Outlier rejected!
        isAnomaly = true;
        st.consecutiveAnomalies++;
        st.x_est = x_pred;
        st.P = P_pred;
        setLedStatus('red');

        // Stuck prevention
        if (st.consecutiveAnomalies > 15) {
          st.x_est = z_k;
          st.P = 1.0;
          st.consecutiveAnomalies = 0;
        }
      }

      // Record point
      const now = Date.now();
      const point: DataPoint = {
        timestamp: now,
        groundTruth: currentTrue,
        rawMeasurement: z_k,
        kalmanEstimate: st.x_est,
        isAnomaly,
        residual,
        gateUpper: x_pred + params.deltaMax,
        gateLower: Math.max(0, x_pred - params.deltaMax),
      };

      const newHistory = [...historyRef.current, point];
      if (newHistory.length > 140) {
        newHistory.shift();
      }
      historyRef.current = newHistory;

      // Update statistics
      let sumSqRaw = 0;
      let sumSqKalman = 0;
      let anomalyCount = 0;

      for (const p of newHistory) {
        // Error relative to true distance
        const errRaw = p.rawMeasurement - p.groundTruth;
        const errKalman = p.kalmanEstimate - p.groundTruth;
        sumSqRaw += errRaw * errRaw;
        sumSqKalman += errKalman * errKalman;
        if (p.isAnomaly) anomalyCount++;
      }

      const count = newHistory.length;
      const rawRmse = Math.sqrt(sumSqRaw / count);
      const kalmanRmse = Math.sqrt(sumSqKalman / count);
      const noiseReduction =
        rawRmse > 0 ? Math.max(0, Math.round(((rawRmse - kalmanRmse) / rawRmse) * 100)) : 0;

      setStats({
        rawRmse,
        kalmanRmse,
        noiseReductionPercent: noiseReduction,
        totalSamples: count,
        anomaliesDetected: anomalyCount,
        currentK: calculatedK,
      });

      setHistoryRenderTrigger((prev) => prev + 1);
    }, 50);

    return () => clearInterval(interval);
  }, [isRunning, targetDistance, isAutoMoving, params]);

  // Render Serial Plotter Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background (matches dark terminal/plotter style)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Horizontal distance grid (0.0 to 1.2 m)
    const minY = 0.0;
    const maxY = 1.2;

    const toY = (val: number) => {
      const clamped = Math.max(minY, Math.min(maxY, val));
      return height - ((clamped - minY) / (maxY - minY)) * (height - 30) - 15;
    };

    // Draw horizontal ticks
    const ticks = [0.1, 0.3, 0.5, 0.7, 0.9, 1.1];
    ctx.fillStyle = '#64748b';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';

    for (const t of ticks) {
      const y = toY(t);
      ctx.beginPath();
      ctx.moveTo(45, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillText(`${t.toFixed(1)} м`, 40, y + 3);
    }

    const points = historyRef.current;
    if (points.length < 2) return;

    const toX = (idx: number) => {
      return 50 + (idx / 140) * (width - 60);
    };

    // 1. Draw Gating Corridor Ribbon
    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = toX(i);
      const yUpper = toY(points[i].gateUpper);
      if (i === 0) ctx.moveTo(x, yUpper);
      else ctx.lineTo(x, yUpper);
    }
    for (let i = points.length - 1; i >= 0; i--) {
      const x = toX(i);
      const yLower = toY(points[i].gateLower);
      ctx.lineTo(x, yLower);
    }
    ctx.closePath();
    ctx.fill();

    // 2. Draw Ground Truth line (dashed white)
    ctx.strokeStyle = '#475569';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = toX(i);
      const y = toY(points[i].groundTruth);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 3. Draw Raw Measurements (Orange Line + Dots, Red Dots for Anomaly)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = toX(i);
      const y = toY(points[i].rawMeasurement);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Draw dots for raw
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = toX(i);
      const y = toY(p.rawMeasurement);

      if (p.isAnomaly) {
        // Red spike marker with ring
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fca5a5';
        ctx.stroke();
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Draw Kalman Filtered line (Thick Emerald Green)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let i = 0; i < points.length; i++) {
      const x = toX(i);
      const y = toY(points[i].kalmanEstimate);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Current latest point glowing indicator
    const lastPoint = points[points.length - 1];
    if (lastPoint) {
      const lx = toX(points.length - 1);
      const ly = toY(lastPoint.kalmanEstimate);

      ctx.fillStyle = '#34d399';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [historyRenderTrigger]);

  // Handle bench track dragging
  const handleBenchMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !benchTrackRef.current) return;
    const rect = benchTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0.05, Math.min(1.0, clickX / rect.width));
    // scale from 0.05m to 1.15m
    const newDist = parseFloat((0.05 + ratio * 1.1).toFixed(3));
    setTargetDistance(newDist);
    if (isAutoMoving) setIsAutoMoving(false);
  };

  const handleBenchClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!benchTrackRef.current) return;
    const rect = benchTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0.05, Math.min(1.0, clickX / rect.width));
    const newDist = parseFloat((0.05 + ratio * 1.1).toFixed(3));
    setTargetDistance(newDist);
    if (isAutoMoving) setIsAutoMoving(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Verification Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
              <Activity className="w-3.5 h-3.5" />
              Физическая верификация и симуляция
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Интерактивная проверка фильтра Калмана и стробирования
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Моделирует реальный оптический стенд с датчиком VL53L0X, линейкой и препятствием. Взмахните перед лучом, чтобы увидеть отсечение выброса стробированием!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                isRunning
                  ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {isRunning ? 'Пауза' : 'Возобновить'}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сброс
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Hardware Indicators & Metric Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Status Indicator (RGB LED KY-016) */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-xs">
          <div className="relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 ${
                ledStatus === 'green'
                  ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)] text-white'
                  : 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] text-white'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white/40 animate-ping absolute" />
              <div className="w-3 h-3 rounded-full bg-white/90" />
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              LED KY-016
            </div>
            <div
              className={`text-sm font-bold ${
                ledStatus === 'green' ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {ledStatus === 'green' ? '🟢 Норма (фильтр)' : '🔴 Аномалия / Строб'}
            </div>
          </div>
        </div>

        {/* Noise reduction */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Снижение шума
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">
              -{stats.noiseReductionPercent}%
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-600 self-center" />
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            СКО: {(stats.rawRmse * 1000).toFixed(0)} мм → {(stats.kalmanRmse * 1000).toFixed(0)} мм
          </div>
        </div>

        {/* Anomalies caught */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Отсечено выбросов
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900">
              {stats.anomaliesDetected}
            </span>
            <span className="text-xs text-slate-500">из {stats.totalSamples} замеров</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Порог: {(params.deltaMax * 100).toFixed(0)} см</div>
        </div>

        {/* Kalman Gain K */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
            Коэффициент Калмана (K)
          </div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold font-mono text-blue-600">
              {stats.currentK.toFixed(3)}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Вес нового замера в оценке</div>
        </div>
      </div>

      {/* Physical Bench Visualizer */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 text-white shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-400" />
            <h3 className="font-semibold text-sm text-slate-200">
              Виртуальный лабораторный стенд (Линейка + Мишень)
            </h3>
          </div>

          {/* Quick preset positions */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 mr-1 hidden sm:inline">Положение:</span>
            {[0.25, 0.45, 0.70, 0.95].map((d) => (
              <button
                key={d}
                onClick={() => {
                  setTargetDistance(d);
                  setIsAutoMoving(false);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  Math.abs(targetDistance - d) < 0.02 && !isAutoMoving
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {(d * 100).toFixed(0)} см
              </button>
            ))}
            <button
              onClick={() => setIsAutoMoving(!isAutoMoving)}
              className={`px-2.5 py-1 rounded transition-colors ${
                isAutoMoving
                  ? 'bg-purple-600 text-white font-semibold animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isAutoMoving ? 'Авто-движение: Вкл' : 'Авто-движение'}
            </button>
          </div>
        </div>

        {/* Physical Track & Ruler Area */}
        <div
          ref={benchTrackRef}
          onClick={handleBenchClick}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onMouseMove={handleBenchMouseMove}
          className="relative h-32 bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden cursor-pointer select-none px-4"
        >
          {/* Millimeter Ruler Markings on top */}
          <div className="absolute top-0 left-12 right-6 h-6 border-b border-slate-700 flex justify-between text-[9px] font-mono text-slate-400 pt-1">
            <span>0 см</span>
            <span>20 см</span>
            <span>40 см</span>
            <span>60 см</span>
            <span>80 см</span>
            <span>100 см</span>
            <span>115 см</span>
          </div>

          {/* Sensor Assembly (Left) */}
          <div className="absolute left-2 bottom-4 w-12 h-16 bg-slate-800 rounded-md border border-slate-700 flex flex-col items-center justify-center shadow-lg z-10">
            <div className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">VL53L0X</div>
            <div className="w-6 h-3 bg-black rounded-xs mt-1 flex items-center justify-around px-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_#ef4444] animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            </div>
            <div className="text-[7px] text-slate-400 mt-1">Tx/Rx</div>
          </div>

          {/* Laser Infrared Beam */}
          {(() => {
            // Calculate width percent of beam from sensor to target
            const maxTrackMeters = 1.15;
            const targetPct = Math.min(100, Math.max(10, (targetDistance / maxTrackMeters) * 88));

            return (
              <>
                {/* Laser beam cone */}
                <div
                  className="absolute left-14 bottom-11 h-2 bg-gradient-to-r from-red-500/80 via-red-400/40 to-transparent pointer-events-none transition-all duration-75"
                  style={{ width: `${targetPct}%` }}
                />
                <div
                  className="absolute left-14 bottom-11 h-0.5 bg-red-400 shadow-[0_0_8px_#f87171] pointer-events-none transition-all duration-75"
                  style={{ width: `${targetPct}%` }}
                />

                {/* Target Obstacle (Movable Card / Box) */}
                <div
                  className="absolute bottom-3 w-8 h-20 bg-gradient-to-b from-amber-100 to-amber-200 rounded-xs border-2 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] flex flex-col items-center justify-between py-1 transition-all duration-75 z-20"
                  style={{ left: `calc(3rem + ${targetPct}%)` }}
                >
                  <div className="w-4 h-1 bg-amber-600 rounded-full" />
                  <div className="text-[9px] font-bold text-amber-900 rotate-90 whitespace-nowrap">
                    МИШЕНЬ
                  </div>
                  <div className="text-[8px] font-mono text-amber-800">
                    {(targetDistance * 100).toFixed(0)}см
                  </div>
                </div>
              </>
            );
          })()}

          {/* Prompt banner under track */}
          <div className="absolute bottom-1 left-16 text-[10px] text-slate-500 pointer-events-none">
            Кликните или перетащите мишень мышкой по линейке
          </div>
        </div>

        {/* Experiment Injection Buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300 font-medium">Физические тесты аномалий:</span>
            <button
              onClick={triggerPencilGlitch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              ⚡ Взмахнуть карандашом перед лучом (выброс d ≈ 12 см)
            </button>
            <button
              onClick={triggerFarGlitch}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
            >
              Оптический блик (d ≈ 1.15 м)
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Реальная дистанция: <strong className="text-white">{(targetDistance * 100).toFixed(1)} см</strong>
          </div>
        </div>
      </div>

      {/* Real-time Serial Plotter (Arduino IDE replica) */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="font-semibold text-sm text-slate-200">
                Arduino IDE Serial Plotter (Плоттер по последовательному порту, 9600 бод)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Идентичен встроенному плоттеру в Arduino IDE (Ctrl+Shift+L). Отображает две кривые: сырую <code className="text-amber-400">z_k</code> и фильтрованную <code className="text-emerald-400">x_est</code>.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-amber-400 rounded-full" />
              <span className="text-amber-300">Сырой замер (z_k)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-emerald-500 rounded-full" />
              <span className="text-emerald-400 font-semibold">Фильтр Калмана (x_est)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-slate-500 border-b border-dashed border-white" />
              <span className="text-slate-400">Истинное</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-red-400 font-medium">Отсеченный выброс</span>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
          <canvas
            ref={canvasRef}
            width={840}
            height={280}
            className="w-full h-[280px] block"
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="mt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-400 gap-2">
          <div>
            Событие: <span className="text-slate-200 font-mono">{lastEvent.text}</span>
          </div>
          <div className="flex items-center gap-3">
            <span>
              Порог строба: <strong className="text-emerald-400">±{(params.deltaMax * 100).toFixed(0)} см</strong>
            </span>
            <span>Частота: <strong>20 Гц (50 мс)</strong></span>
          </div>
        </div>
      </div>

      {/* Parameter Tuning Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Sliders className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            Параметры фильтрации и подбор коэффициентов (для статьи)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Delta Max Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Порог стробирования (Delta_max)
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {params.deltaMax.toFixed(2)} м ({(params.deltaMax * 100).toFixed(0)} см)
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={params.deltaMax}
              onChange={(e) =>
                setParams({ ...params, deltaMax: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              Максимальный допустимый скачок за 50 мс. Все, что больше этого порога, отсекается как помеха (зажигая красный светодиод).
            </p>
          </div>

          {/* R Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Дисперсия шума измерений (R)
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {params.R.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.05"
              max="2.00"
              step="0.05"
              value={params.R}
              onChange={(e) => setParams({ ...params, R: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              Чем выше R, тем сильнее сглаживание шума, но медленнее реакция на резкие движения мишени.
            </p>
          </div>

          {/* Q Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Шум процесса (Q)
              </span>
              <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                {params.Q.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.01"
              max="1.00"
              step="0.02"
              value={params.Q}
              onChange={(e) => setParams({ ...params, Q: parseFloat(e.target.value) })}
              className="w-full accent-blue-600"
            />
            <p className="text-[11px] text-slate-500">
              Отражает динамику объекта. Чем выше Q, тем быстрее фильтр следует за реальным перемещением.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
