const int trigPin = 9;
const int echoPin = 10;

float distanceToGround;
// Vehículo que supere este valor será considerado camión
const int carThreshold = 10;

int vehicleCount = 0;
float previousHeight;

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

  if (vehicleHeight >= 1 && vehicleHeight > maxHeight) {
    maxHeight = vehicleHeight;
  } else if (vehicleHeight < 1 && previousHeight >= 1) {
    Serial.print("Altura: ");
    Serial.print(maxHeight);
    Serial.print("cm - ");
    maxHeight = 0;

    Serial.print("Cantidad vehículos: ");
    Serial.println(++vehicleCount);
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
  // Distancia = tiempo * velocidad (sonido)
  // Dividido en 2 porque es ida y vuelta
  distance = duration * 0.034 / 2;

  return distance;
}
