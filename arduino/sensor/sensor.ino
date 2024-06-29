const int trigPin = 9;
const int echoPin = 10;

float distanceToGround;
// Vehículo que supere este valor será considerado camión
const int carThreshold = 10;

int vehicleCount = 0;

unsigned long lastDetectionTime = 0;
const unsigned long detectionInterval = 1000;
bool vehicleDetected = false;

// Guarda la altura máxima de un vehículo
float maxHeight = 0;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  // Fijar distancia al suelo inicial
  distanceToGround = measureDistance();
  delay(100);

  Serial.println("Listo");
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
      vehicleCount++;
    }

    lastDetectionTime = currentTime;
  } else if (vehicleDetected && currentTime - lastDetectionTime > detectionInterval) {
    vehicleDetected = false;

    Serial.print("Altura: ");
    Serial.print(maxHeight);
    Serial.print("cm - ");
    maxHeight = 0;

    Serial.print("Cantidad vehículos: ");
    Serial.println(vehicleCount);
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
