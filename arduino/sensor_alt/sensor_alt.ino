#include <LiquidCrystal.h>

const int trigPin = 9;
const int echoPin = 10;

const int rs = 12, en = 11, d4 = 5, d5 = 4, d6 = 3, d7 = 2;
LiquidCrystal lcd(rs, en, d4, d5, d6, d7);

const int redPin = 6;
const int greenPin = 8;
const int bluePin = 13;

float distanceToGround;

float previousHeight;
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

  if (vehicleHeight >= 1) {
    setColor(255, 0, 0);
    if (vehicleHeight > maxHeight) {
      maxHeight = vehicleHeight;
    }
  } else if (vehicleHeight < 1 && previousHeight >= 1) {
    Serial.println(maxHeight);

    lcd.setCursor(0, 0);
    lcd.print(maxHeight);
    lcd.print(" cm");

    setColor(0, 0, 0);

    maxHeight = 0;
  }

  previousHeight = vehicleHeight;
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
