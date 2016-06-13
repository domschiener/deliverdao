#!/usr/bin/env python
# -*- coding: utf8 -*-

import RPi.GPIO as GPIO
import MFRC522
import signal

continue_reading = True

# Capture SIGINT for cleanup when the script is aborted
def end_read(signal,frame):
    global continue_reading
    print "Ctrl+C captured, ending read."
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
        print "Card detected"

    # Get the UID of the card
    (status,uid) = MIFAREReader.MFRC522_Anticoll()

    # If we have the UID, continue
    if status == MIFAREReader.MI_OK:

        # Print UID
        print "Card read UID: "+str(uid[0])+","+str(uid[1])+","+str(uid[2])+","+str(uid[3])

        # This is the default key for authentication
        key = [0xFF,0xFF,0xFF,0xFF,0xFF,0xFF]

        # Select the scanned tag
        MIFAREReader.MFRC522_SelectTag(uid)

        # Authenticate
        status = MIFAREReader.MFRC522_Auth(MIFAREReader.PICC_AUTHENT1A, 8, key, uid)
        print "\n"

        # Check if authenticated
        if status == MIFAREReader.MI_OK:

            # Variable for the data to write
            address = 'ad62f56a03334b647e55dbdb5b8642c24605a801'
            formatedAddr = [address[i:i+2] for i in range(0, len(address), 2)]
            print formatedAddr
            dataSet1 = []
            dataSet2 = []

            for x in range(0, 16):
                dataSet1.append(int(formatedAddr[x], 16))

            for x in range(0, 16):
                dataSet2.append(0x00)

            for x in range(16, len(formatedAddr)):
                dataSet2[x - 16] = (int(formatedAddr[x], 16))

            print dataSet1
            print dataSet2
            print "Sector 8 looked like this:"
            # Read block 8
            MIFAREReader.MFRC522_Read(8)
            print "\n"

            print "Sector 9 looked like this:"
            # Read block 8
            MIFAREReader.MFRC522_Read(9)
            print "\n"

            print "Sector 8 will now be filled with data:"
            # Write the data
            print "Writing Data now:"
            print dataSet1
            MIFAREReader.MFRC522_Write(8, dataSet1)
            print "\n"

            print "Writing Data to 9 now:"
            print dataSet2
            MIFAREReader.MFRC522_Write(9, dataSet2)
            print "\n"

            print "8 It now looks like this:"
            # Check to see if it was written
            MIFAREReader.MFRC522_Read(8)
            print "\n"

            print "9 It now looks like this:"
            # Check to see if it was written
            MIFAREReader.MFRC522_Read(9)
            print "\n"

            # Stop
            MIFAREReader.MFRC522_StopCrypto1()

            # Make sure to stop reading for cards
            continue_reading = False
            break
        else:
            print "Authentication error"
