#!/usr/bin/env python
# -*- coding: utf8 -*-

import RPi.GPIO as GPIO
import MFRC522
import signal

continue_reading = True

# Capture SIGINT for cleanup when the script is aborted
def end_read(signal,frame):
    global continue_reading
    continue_reading = False
    GPIO.cleanup()

# Hook the SIGINT
signal.signal(signal.SIGINT, end_read)

# Create an object of the class MFRC522
MIFAREReader = MFRC522.MFRC522()

# This loop keeps checking for chips. If one is near it will get the UID and authenticate
while continue_reading:

    # Scan for cards
    (status,TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

    # If a card is found
    if status == MIFAREReader.MI_OK:

    # Get the UID of the card
    (status,uid) = MIFAREReader.MFRC522_Anticoll()

    # If we have the UID, continue
    if status == MIFAREReader.MI_OK:

        # This is the default key for authentication
        key = [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]

        # Select the scanned tag
        MIFAREReader.MFRC522_SelectTag(uid)

        # Authenticate
        status = MIFAREReader.MFRC522_Auth(MIFAREReader.PICC_AUTHENT1A, 8, key, uid)

        # Check if authenticated
        if status == MIFAREReader.MI_OK:
            section8 = MIFAREReader.MFRC522_Read2(8)
            section9 = MIFAREReader.MFRC522_Read2(9)
            address = '0x'

            for x in range(len(section8)):
                hexValue = hex(section8[x])
                toWrite = hexValue[2:]

                if len(toWrite) < 2:
                    newToWrite = "0" + toWrite
                    address += newToWrite
                else:
                    address += toWrite


            for x in range(len(section9)):
                hexValue = hex(section9[x])
                if (hexValue == '0x0'):
                    break

                toWrite = hexValue[2:]

                if len(toWrite) < 2:
                    newToWrite = "0" + toWrite
                    address += newToWrite
                else:
                    address += toWrite


            print address
            continue_reading = False
            MIFAREReader.MFRC522_StopCrypto1()
            break
        else:
            print "Authentication error"
