#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// WiFi credentials
const char* ssid = "1083ybs.";
const char* pass = "makedodo.";

// MQTT credentials
const char* mqtt_server = "f6c3bd764c054b5089d29b5a566ebaa1.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "ridho";
const char* mqtt_password = "Ridho123.";

// Sensor configuration
#define soil_pin 34
#define dry_value 4950
#define wet_value 1500
#define threshold 40

// DHT Sensor configuration
#define DHT_PIN 32
#define DHT_TYPE DHT11

// Output pins
#define relay_pin 25
#define led_pin 26

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

// Set relay logic type
const bool RELAY_ACTIVE_LOW = true;

// Timing variables
unsigned long lastMsg = 0;
unsigned long pumpStartTime = 0;
bool pumpRunning = false;
bool autoMode = true;
int pumpDuration = 3000;

// MQTT Topics
const char* topic_sensor = "plant/sensor";
const char* topic_control = "plant/control";
const char* topic_status = "plant/status";
const char* topic_prediction = "plant/prediction";

WiFiClientSecure espClient;
PubSubClient client(espClient);

void setup() {
  Serial.begin(115200);
  delay(1000);

  pinMode(soil_pin, INPUT);
  pinMode(relay_pin, OUTPUT);
  pinMode(led_pin, OUTPUT);
  
  // Initialize relay to OFF state
  setRelayState(false);
  
  // Initialize DHT sensor
  dht.begin();
  delay(3000); // Give DHT sensor time to initialize
  
  Serial.println("\n=== Smart Plant Monitor ===");
  Serial.print("Relay Logic: ");
  Serial.println(RELAY_ACTIVE_LOW ? "ACTIVE LOW" : "ACTIVE HIGH");
  Serial.println("DHT Sensor initialized");

  setup_wifi();

  espClient.setInsecure();

  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void setup_wifi() {
  delay(100);
  WiFi.begin(ssid, pass);
  Serial.println("\nConnecting to WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✓ WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

// Helper function to control relay with proper logic
void setRelayState(bool state) {
  if (RELAY_ACTIVE_LOW) {
    // Active LOW: LOW = ON, HIGH = OFF
    digitalWrite(relay_pin, state ? LOW : HIGH);
  } else {
    // Active HIGH: HIGH = ON, LOW = OFF
    digitalWrite(relay_pin, state ? HIGH : LOW);
  }
  
  // LED indicator (always follows pump state)
  digitalWrite(led_pin, state ? HIGH : LOW);
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for(int i = 0; i < length; i++) {
    message += (char)payload[i];
  }

  Serial.print("📨 Message [");
  Serial.print(topic);
  Serial.print("]: ");
  Serial.println(message);

  // Parse JSON
  StaticJsonDocument<200> doc;
  DeserializationError error = deserializeJson(doc, message);

  if(error) {
    Serial.println("❌ Failed parsing JSON");
    return;
  }

  // Handle control commands
  if(strcmp(topic, topic_control) == 0) {
    if(doc.containsKey("pump")) {
      String pumpCmd = doc["pump"];
      if(pumpCmd == "on") {
        startPump();
      } else if (pumpCmd == "off") {
        stopPump();
      }
    }

    if(doc.containsKey("auto")) {
      autoMode = doc["auto"];
      Serial.print("🔄 Auto Mode: ");
      Serial.println(autoMode ? "ON" : "OFF");
      
      // Publish status update
      publishStatus();
    }

    if(doc.containsKey("duration")) {
      pumpDuration = doc["duration"];
      Serial.print("⏱️  Pump duration: ");
      Serial.print(pumpDuration);
      Serial.println("ms");
    }
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("🔌 Connecting to MQTT... ");

    String clientId = "ESP32-Plant-" + String(random(0xffff), HEX);

    if (client.connect(clientId.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("✓ Connected!");
      client.subscribe(topic_control);

      // Publish online status
      StaticJsonDocument<100> doc;
      doc["status"] = "online";
      doc["device"] = "ESP32-Plant";
      doc["relay_type"] = RELAY_ACTIVE_LOW ? "active_low" : "active_high";
      String output;
      serializeJson(doc, output);
      client.publish(topic_status, output.c_str());
      
    } else {
      Serial.print("❌ Failed, rc=");
      Serial.print(client.state());
      Serial.println(" (retrying in 3s)");
      delay(3000);
    }
  }
}

int readSoilMoisture() {
  int sensorValue = analogRead(soil_pin);

  // Convert to percentage
  int moisture = map(sensorValue, dry_value, wet_value, 0, 100);
  moisture = constrain(moisture, 0, 100);
  return moisture;
}

float readTemperature() {
  // Retry a few times and yield to avoid WDT when sensor/wiring is unstable
  for (int i = 0; i < 3; i++) {
    float temp = dht.readTemperature();
    if (!isnan(temp)) return temp;
    delay(50);
  }
  Serial.println("⚠️  Failed to read temperature from DHT");
  return -999; // Error value
}

float readAirHumidity() {
  // Retry a few times and yield to avoid WDT when sensor/wiring is unstable
  for (int i = 0; i < 3; i++) {
    float humidity = dht.readHumidity();
    if (!isnan(humidity)) return humidity;
    delay(50);
  }
  Serial.println("⚠️  Failed to read humidity from DHT");
  return -999; // Error value
}

void startPump() {
  if (pumpRunning) {
    Serial.println("⚠️  Pump already running");
    return;
  }
  
  setRelayState(true);  // Use helper function
  pumpRunning = true;
  pumpStartTime = millis();
  Serial.println("💧 Pump STARTED");

  // Publish status
  publishStatus();
}

void stopPump() {
  if (!pumpRunning) {
    Serial.println("⚠️  Pump already stopped");
    return;
  }
  
  setRelayState(false);  // Use helper function
  pumpRunning = false;
  Serial.println("🛑 Pump STOPPED");
  
  // Publish status
  publishStatus();
}

void publishStatus() {
  StaticJsonDocument<200> doc;
  doc["pump"] = pumpRunning ? "on" : "off";
  doc["auto"] = autoMode;
  doc["timestamp"] = millis();
  
  String output;
  serializeJson(doc, output);
  client.publish(topic_status, output.c_str());
}

void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  unsigned long now = millis();

  // Auto-stop pump after duration
  if(pumpRunning && (now - pumpStartTime >= pumpDuration)) {
    Serial.println("⏰ Pump duration reached");
    stopPump();
  }

  // Publish sensor data every 5 seconds
  if(now - lastMsg > 5000) {
    lastMsg = now;

    int moisture = readSoilMoisture();
    float temperature = readTemperature();
    float airHumidity = readAirHumidity();

    // Create JSON payload
    StaticJsonDocument<300> doc;
    doc["moisture"] = moisture;
    doc["timestamp"] = now;
    doc["auto_mode"] = autoMode;
    doc["pump_status"] = pumpRunning ? "on" : "off";
    
    // Add DHT sensor data if valid
    if (temperature != -999) {
      doc["temperature"] = temperature;
    }
    if (airHumidity != -999) {
      doc["air_humidity"] = airHumidity;
    }

    String output;
    serializeJson(doc, output);

    Serial.print("📤 Publishing: ");
    Serial.println(output);
    
    if (temperature != -999 || airHumidity != -999) {
      Serial.print("🌡️  Temp: ");
      Serial.print(temperature);
      Serial.print("°C | Humidity: ");
      Serial.print(airHumidity);
      Serial.println("%");
    }
    
    client.publish(topic_sensor, output.c_str());

    // Auto watering logic
    if (autoMode && !pumpRunning && moisture < threshold) {
      Serial.print("🌱 Auto-watering triggered! (Moisture: ");
      Serial.print(moisture);
      Serial.print("% < ");
      Serial.print(threshold);
      Serial.println("%)");
      startPump();
    }
  }

  delay(100);  // Small delay for stability
}