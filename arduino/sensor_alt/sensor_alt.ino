#include <LiquidCrystal.h>

const int trigPin = 9;
const int echoPin = 10;

const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

const int redPin = 6;
const int greenPin = 8;
const int bluePin = 13;

float distanceToGround;
// Alturas máximas menores a este valor no son consideradas
const int minThreshold = 5;
// Alturas máximas mayores a este valor chocarán con el puente
const int maxThreshold = 15;
// Alturas máximas mayores a este valor recibirá advertencia
const int midTreshold = 10;

unsigned long lastDetectionTime = 0;
const unsigned long detectionInterval = 1000;
bool vehicleDetected = false;

// Guarda la altura máxima de un vehículo
float maxHeight = 0;

void setup() {
  Serial.begin(115200);

  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  lcd.begin(16, 2);

  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

  // Fijar distancia al suelo inicial
  distanceToGround = measureDistance();
  delay(100);
}

void loop() {
  float distance = measureDistance();
  float vehicleHeight = distanceToGround - distance;

  unsigned long currentTime = millis();

  if (vehicleHeight >= 1) {
    if (vehicleHeight > maxHeight) {
      maxHeight = vehicleHeight;
    }

    if (!vehicleDetected) {
      vehicleDetected = true;
    }

    lastDetectionTime = currentTime;
  } else if (
    vehicleDetected &&
    currentTime - lastDetectionTime > detectionInterval &&
    maxHeight >= minThreshold
  ) {
    Serial.println(maxHeight);

    lcd.setCursor(0, 0);
    lcd.print(maxHeight);
    lcd.print(" cm");

    if (maxHeight < 10) {
      // Verde
      setColor(0, 255, 0);
    } else if (maxHeight < 15) {
      // Amarillo
      setColor(255, 215, 0);
    } else {
      // Rojo
      setColor(255, 0, 0);
    }

    maxHeight = 0;
    vehicleDetected = false;
  }

  delay(100);
}

float measureDistance() {
  float duration, distance;

  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  duration = pulseIn(echoPin, HIGH);
  // Distancia (cm) = tiempo * velocidad (sonido)
  // Dividido en 2 ya que es ida y vuelta
  distance = duration * 0.034 / 2;

  return distance;
}

void setColor(int redValue, int greenValue, int blueValue) {
  analogWrite(redPin, redValue);
  analogWrite(greenPin, greenValue);
  analogWrite(bluePin, blueValue);
}
