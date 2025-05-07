const int RED1_PIN = 3;
const int GREEN1_PIN = 5;
const int BLUE1_PIN = 6;

const int RED2_PIN = 9;
const int GREEN2_PIN = 10;
const int BLUE2_PIN = 11;

void setup() {
  Serial.begin(9600);
  pinMode(RED1_PIN, OUTPUT);
  pinMode(GREEN1_PIN, OUTPUT);
  pinMode(BLUE1_PIN, OUTPUT);

  pinMode(RED2_PIN, OUTPUT);
  pinMode(GREEN2_PIN, OUTPUT);
  pinMode(BLUE2_PIN, OUTPUT);
}

void loop() {
  if (Serial.available() >= 2) {  // Wait until 2 bytes arrive: Spot ID + Command
    char spot = Serial.read();
    char cmd = Serial.read();

    if (spot == '1') {
      setColor(RED1_PIN, GREEN1_PIN, BLUE1_PIN, cmd);
    } else if (spot == '2') {
      setColor(RED2_PIN, GREEN2_PIN, BLUE2_PIN, cmd);
    }
  }
}

void setColor(int redPin, int greenPin, int bluePin, char cmd) {
  if (cmd == 'G') {
    analogWrite(redPin, 0);
    analogWrite(greenPin, 255);
    analogWrite(bluePin, 0);
  } else if (cmd == 'R') {
    analogWrite(redPin, 255);
    analogWrite(greenPin, 0);
    analogWrite(bluePin, 0);
  } else if (cmd == 'Y') {
    analogWrite(redPin, 255);
    analogWrite(greenPin, 255);
    analogWrite(bluePin, 0);
  }
}

