// constants //////////////////////////////////////////////////////////////////
#define BAUD_RATE       9600
#define READ_DELAY      100

static const char A0_NAME[] = "A0";
static const char A1_NAME[] = "A1";
static const char A2_NAME[] = "A2";
static const char A3_NAME[] = "A3";
static const char INVALID_PIN[] = "INVALID PIN";

static const char PIN_PULSE_NAME[] = "pulse";
static const char PIN_DX_NAME[] = "dx\t";
static const char PIN_DY_NAME[] = "dy\t";
static const char PIN_DZ_NAME[] = "dz\t";
static const char INVALID_TYPE[] = "INVALID TYPE";


// config /////////////////////////////////////////////////////////////////////
static const int PIN_PULSE = A0;
static const int PIN_DX = A1;
static const int PIN_DY = A2;
static const int PIN_DZ = A3;
static const int ANALOG_IN[] = {PIN_PULSE, PIN_DX, PIN_DY, PIN_DZ};
static const int NUM_ANALOG_IN = sizeof(ANALOG_IN) / sizeof(int);


// main ///////////////////////////////////////////////////////////////////////
void setup() {
    Serial.begin(BAUD_RATE);
}

void loop() {
    // log analog input
    for (int i = 0; i < NUM_ANALOG_IN; i++) {
        int pin = ANALOG_IN[i];
        log_pin(pin, analogRead(pin));
    }

    // separate rounds
    Serial.println();

    // delay for read stability (as in AnalogReadSerial)
    delay(READ_DELAY);
}


// helper methods /////////////////////////////////////////////////////////////
void log_pin(int pin, int value) {
    Serial.print(pin_name(pin));
    Serial.print("\t");
    Serial.print(type_name(pin));
    Serial.print("\t: ");
    Serial.println(value);
}

const String pin_name(int pin) {
    String name = "[";

    switch (pin) {
        case A0: name += A0_NAME; break;
        case A1: name += A1_NAME; break;
        case A2: name += A2_NAME; break;
        case A3: name += A3_NAME; break;
        default: name += INVALID_PIN; break;
    }
    return name + "]";
}

const char *type_name(int type) {
    switch (type) {
        case PIN_PULSE: return PIN_PULSE_NAME;
        case PIN_DX: return PIN_DX_NAME;
        case PIN_DY: return PIN_DY_NAME;
        case PIN_DZ: return PIN_DZ_NAME;
        default: return INVALID_TYPE;
    }
}
