const int trigPin = 9;
const int echoPin = 10;

float distanceToGround;

unsigned long lastDetectionTime = 0;
const unsigned long detectionInterval = 1000;
bool vehicleDetected = false;

// Guarda la altura máxima de un vehículo
float maxHeight = 0;

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

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
  } else if (vehicleDetected && currentTime - lastDetectionTime > detectionInterval) {
    vehicleDetected = false;

    Serial.println(maxHeight);
    maxHeight = 0;
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
  // Distancia = tiempo * velocidad (sonido)
  // Dividido en 2 porque es ida y vuelta
  distance = duration * 0.034 / 2;

  return distance;
}
