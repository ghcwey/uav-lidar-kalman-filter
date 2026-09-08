/*
 * Проект: Фильтрация расстояния с датчика VL53L0X (ToF) с помощью фильтра Калмана и стробирования
 * Автор: Студент 2 курса
 * Описание:
 *   Считывает дистанцию с оптического дальномера VL53L0X,
 *   отсекает резкие выбросы (стробирование по Delta_max),
 *   сглаживает шум одномерным фильтром Калмана
 *   и выводит состояние на RGB-светодиод KY-016 (зеленый = норма, красный = аномалия).
 * 
 * Подключение:
 *   VL53L0X -> Arduino Uno / Nano:
 *     VIN  -> 5V (или 3.3V в зависимости от платы датчика с регулятором)
 *     GND  -> GND
 *     SDA  -> A4 (I2C Data)
 *     SCL  -> A5 (I2C Clock)
 * 
 *   KY-016 (RGB LED) -> Arduino:
 *     - (GND) -> GND
 *     R       -> Pin 9  (Красный канал через резистор)
 *     G       -> Pin 10 (Зеленый канал через резистор)
 *     B       -> не подключен (или GND)
 * 
 *   ВНИМАНИЕ ПО СВЕТОДИОДУ:
 *   Если у вашего KY-016 общий анод (+), поменяйте HIGH и LOW местами,
 *   либо используйте макросы LED_ON / LED_OFF.
 */

#include <Wire.h>
#include "Adafruit_VL53L0X.h"
#include <math.h>

// Создаем объект дальномера
Adafruit_VL53L0X lox = Adafruit_VL53L0X();

// Пины для индикатора
const int RED_PIN = 9;
const int GREEN_PIN = 10;

// ==========================================
// Параметры фильтра Калмана и стробирования
// ==========================================
// Q — ковариация шума процесса (насколько динамично может меняться расстояние)
// R — дисперсия шума измерений (собственный шум дальномера VL53L0X)
// Delta_max — порог стробирования (максимально допустимый скачок за один такт, в метрах)
float Q = 0.2;
float R = 0.5;
float Delta_max = 0.3; // 30 см (0.3 м)

// Переменные состояния фильтра
float x_est = 0.0;         // Оценка расстояния (в метрах)
float P = 1.0;             // Ошибка ковариации оценки
bool isInitialized = false; // Флаг первого замера (переименован, чтобы не конфликтовать с init() в ядре Arduino)

// Защита от "залипания": если объект реально быстро переместили,
// и все замеры попадают в аномалии подряд, через N замеров сбрасываем фильтр на новое значение.
int consecutiveAnomalies = 0;
const int MAX_ANOMALIES = 15; // 15 замеров * 50 мс ≈ 0.75 секунды

void setup() {
  // Инициализация последовательного порта для Плоттера
  Serial.begin(9600);

  // Настройка пинов индикации
  pinMode(RED_PIN, OUTPUT);
  pinMode(GREEN_PIN, OUTPUT);
  digitalWrite(RED_PIN, LOW);
  digitalWrite(GREEN_PIN, LOW);

  // Запуск дальномера
  if (!lox.begin()) {
    Serial.println(F("Ошибка: Датчик VL53L0X не найден! Проверьте подключение SDA/SCL и питание."));
    // Мигаем красным светодиодом, если нет связи с датчиком
    while (1) {
      digitalWrite(RED_PIN, HIGH);
      delay(200);
      digitalWrite(RED_PIN, LOW);
      delay(200);
    }
  }

  // Приветственный сигнал: зеленый светодиод мигнет один раз
  digitalWrite(GREEN_PIN, HIGH);
  delay(300);
  digitalWrite(GREEN_PIN, LOW);
}

void loop() {
  VL53L0X_RangingMeasurementData_t measure;
  
  // Выполняем измерение расстояния
  lox.rangingTest(&measure, false);

  // RangeStatus == 0 — строго валидный замер дальномера
  // (коды 1-4 соответствуют ошибкам уровня сигнала, фазы или перекрытия)
  if (measure.RangeStatus == 0) {
    // Переводим миллиметры в метры
    float z_k = measure.RangeMilliMeter / 1000.0;

    // Начальная инициализация при первом валидном замере
    if (!isInitialized) {
      x_est = z_k;
      isInitialized = true;
      consecutiveAnomalies = 0;
    }

    // 1. Этап прогноза (Prediction)
    float x_pred = x_est;
    float P_pred = P + Q;

    // 2. Стробирование (Проверка невязки измерения)
    // fabs() используется для корректного взятия модуля от float
    float residual = fabs(z_k - x_pred);

    if (residual <= Delta_max) {
      // === НОРМА: Замер принимается фильтром ===
      consecutiveAnomalies = 0;

      // Коэффициент Калмана
      float K = P_pred / (P_pred + R);

      // Коррекция оценки и ковариации ошибки
      x_est = x_pred + K * (z_k - x_pred);
      P = (1.0 - K) * P_pred;

      // Индикация: Зеленый горит, красный выключен
      digitalWrite(GREEN_PIN, HIGH);
      digitalWrite(RED_PIN, LOW);
    } else {
      // === АНОМАЛИЯ / ВЫБРОС: Замер игнорируется ===
      consecutiveAnomalies++;

      // Сохраняем предыдущий прогноз
      x_est = x_pred;
      P = P_pred;

      // Индикация: Красный горит, зеленый выключен
      digitalWrite(GREEN_PIN, LOW);
      digitalWrite(RED_PIN, HIGH);

      // Защита от залипания: если препятствие реально сместилось и долго там находится
      if (consecutiveAnomalies > MAX_ANOMALIES) {
        x_est = z_k;
        P = 1.0;
        consecutiveAnomalies = 0;
      }
    }

    // Вывод в Serial Plotter (Ctrl+Shift+L в Arduino IDE):
    // Формат: "Сырые_данные,Фильтрованные_данные"
    Serial.print(z_k, 3);
    Serial.print(",");
    Serial.println(x_est, 3);
  }

  // Пауза между измерениями (20 Гц)
  delay(50);
}
