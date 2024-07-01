const int trigPin = 9;
const int echoPin = 10;

float distanceToGround;

float previousHeight;
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

  if (vehicleHeight >= 1 && vehicleHeight > maxHeight) {
    maxHeight = vehicleHeight;
  } else if (vehicleHeight < 1 && previousHeight >= 1) {
    Serial.println(maxHeight);
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
