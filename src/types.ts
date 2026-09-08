export interface FilterParams {
  Q: number;         // Ковариация шума процесса
  R: number;         // Дисперсия шума измерений
  deltaMax: number;  // Порог стробирования в метрах
  sensorNoiseStd: number; // СКО шума дальномера (м)
}

export interface DataPoint {
  timestamp: number;
  groundTruth: number;
  rawMeasurement: number;
  kalmanEstimate: number;
  isAnomaly: boolean;
  residual: number;
  gateUpper: number;
  gateLower: number;
}

export interface ExperimentStats {
  rawRmse: number;
  kalmanRmse: number;
  noiseReductionPercent: number;
  totalSamples: number;
  anomaliesDetected: number;
  currentK: number;
}

export type ActiveTab = 'simulator' | 'schematic' | 'methodology' | 'code' | 'readme';
