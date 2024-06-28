const int trigPin = 9;
const int echoPin = 10;

float distanceToGround = 0;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  distanceToGround = measureDistance();
}

void loop() {
  float distance = measureDistance();
  float objectHeight = distanceToGround - distance;

  if (objectHeight >= 1) {
    Serial.print("Altura: ");
    Serial.print(objectHeight);
    Serial.println(" cm");
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
  distance = duration * 0.034 / 2;

  return distance;
}
