import socket
import random
import time
import threading
import os
import sys
import math
from colors import Colors
from Utilities import create_datagram, extract_data

SOURCE_FOLDER = "PKS_send_file_test/source_folder/"
DESTINATION_FOLDER = "PKS_send_file_test/destination_folder/"

class Client:
    def __init__(self, client_ip, client_port, server_ip, server_port):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM) 
        self.server_ip = server_ip
        self.server_port = server_port
        self.client_ip = client_ip
        self.client_port = client_port
        self.keepAlive = True
        self.active = True
        self.ended = False
        self.NoACK = 0
        self.switch = False
        self.connection_lost = False
        self.cant_connect = False 
    
    def receive_confirmation(self):
        print(Colors.BRIGHT_GREEN + "\nConnection Established"+ Colors.RESET)
    
    def receive(self):
        datagram = None
        
        self.sock.settimeout(3)
        
        try:
            datagram, self.server = self.sock.recvfrom(1467)
            return datagram
        except socket.timeout:
            self.NoACK += 1
            print(Colors.RED+"Timeout: No data received within 3 seconds."+Colors.RESET) 
            if(self.NoACK == 4):
                self.quit(False)
            return create_datagram(9, "Timeout", False)
    
    def send_initialization_message(self):
        while True:
            datagram = create_datagram(flag=1, data="INIT", error=False)
            self.send_to_server(datagram, False)            
            datagram = self.receive()
            datagram, flag = extract_data(datagram, False)
            if(flag == 5):
                client_info = self.client_ip+"|"+str(self.client_port)
                datagram = create_datagram(flag=17, data=client_info, error=False)
                self.send_to_server(datagram, False)            
                self.receive_confirmation()
                self.start_keep_alive()
                break
            if(self.NoACK == 3):
                self.connection_lost = True
                self.cant_connect = True
                print(Colors.BRIGHT_RED+"Couldn't connect to the server. Closing Client..."+Colors.RESET)
                self.quit(False)
                break
        return self.NoACK == 3

    def start_keep_alive(self):
        self.keep_alive_thread = threading.Thread(target=self.keep_alive)
        self.keep_alive_thread.setDaemon(True)
        self.keep_alive_thread.start()

    def keep_alive(self):
        while(not self.ended):
            time.sleep(4)
            while(not self.active):
                datagram = create_datagram(flag=64, data="KEEP_ALIVE", error=False)
                self.send_to_server(datagram, True)
                datagram = self.receive()
                datagram, flag = extract_data(datagram, False)
                if(flag != 68):
                    if(flag == 128):
                        self.connection_lost = True
                        datagram = create_datagram(flag=132, data="SWITCH-ACK", error=False)
                        self.send_to_server(datagram, True)
                        self.switch = True
                        break
                    elif(self.NoACK == 3):
                        self.connection_lost = True
                        print(Colors.BRIGHT_RED+"Connection to server lost. Closing Client..."+Colors.RESET)
                        self.quit(False)
                        break
                time.sleep(3)
            if(self.connection_lost):
                break

    def stop_keep_alive(self):
        if self.keep_alive_thread:
            self.keepAlive = False
            self.active = True
            self.ended = True
            self.keep_alive_thread.join()
    
    def start_check_timeout(self):
        self.timeout_thread = threading.Thread(target=self.check_timeout)
        self.timeout_thread.setDaemon(True)
        self.timeout_thread.start()
    
    def check_timeout(self):
        time.sleep(5)
        if(not self.active):
            self.keep_alive = True
    
    def send_terminating_message(self):
        datagram = create_datagram(flag=2, data="END", error=False)
        self.send_to_server(datagram, False)
        datagram = self.receive()
        datagram, flag = extract_data(datagram, False)
        return flag == 6
    
    def send_to_server(self, datagram, keep_alive):
        try:
            self.sock.sendto(datagram,(self.server_ip,self.server_port))
            if(not keep_alive): 
                self.active = True
        except OSError:
            sys.exit(0)
    
    def send_switch_initialization(self):
        datagram = create_datagram(flag=128, data="SWITCH", error=False)
        self.send_to_server(datagram, False)
        datagram = self.receive()
        datagram, flag = extract_data(datagram, False)
        return flag == 132
    
    def send_message(self, message, max_error, fragment_size):
            error_count = 0
            for i in range(0, len(message), fragment_size):
                while True:
                    if(error_count < max_error):
                        error = random.random() < 0.5
                        if(error):
                            error_count += 1
                    else:
                        error = False
                    fragmented_message = message[i:i + fragment_size]
                    if(i + fragment_size >= len(message)):
                        datagram = create_datagram(flag=18, data=fragmented_message, error=error)
                        self.send_to_server(datagram, False)
                    else:
                        datagram = create_datagram(flag=16, data=fragmented_message, error=error)
                        self.send_to_server(datagram, False)
                    datagram = self.receive()
                    datagram, flag = extract_data(datagram, False)
                    if flag == 20:
                        break
            
            print(Colors.BRIGHT_GREEN+"\nMessage \"" + message + "\" successfully sent"+Colors.RESET)
            print(Colors.GREEN+"Size of message: ", len(message), "B"+Colors.RESET)
            print(Colors.GREEN+"Number of corrupted packets sent: ", error_count, Colors.RESET)
            print(Colors.GREEN+"Number of successful packets sent: ", math.ceil(len(message)/fragment_size), Colors.RESET)
            print(Colors.GREEN+"Number of all packets sent: ", math.ceil(len(message)/fragment_size)+error_count, Colors.RESET)
    
    def send_file(self, file_name, max_error, fragment_size):
        with open(SOURCE_FOLDER+file_name, 'rb') as file:
            file_array = []
            while True:
                file_data = file.read(fragment_size)
                if not file_data:
                    break
                file_array.append(file_data)
        file_array.append(DESTINATION_FOLDER+file_name)
        error_count = 0
        
        for i ,file_data in enumerate(file_array):
            while True:
                if(error_count < max_error):
                    error = random.random() < 0.5
                    if(error):
                        error_count += 1
                else:
                    error = False
                if(i == len(file_array) - 1):
                    datagram = create_datagram(flag=34, data=file_data, error=error)
                    self.send_to_server(datagram, False)
                else:
                    datagram = create_datagram(flag=32, data=file_data, error=error)
                    self.send_to_server(datagram, False)
                datagram = self.receive()
                datagram, flag = extract_data(datagram, False)
                if(flag == 36):
                    break
        print(Colors.BRIGHT_GREEN+"\nFile \""+file_name+"\" successfully sent"+Colors.RESET)           
        print(Colors.GREEN+"Number of corrupted packets sent: ", error_count, Colors.RESET)
        print(Colors.GREEN+"Number of packets accepted: ",  len(file_array), Colors.RESET)
        print(Colors.GREEN+"Number of all packets: ", len(file_array)+error_count, Colors.RESET)
        print(Colors.GREEN+"Size of the file: ", os.path.getsize(SOURCE_FOLDER+file_name), "B"+Colors.RESET)
        print(Colors.GREEN+"Name of the file: ", file_name, Colors.RESET)
        print(Colors.GREEN+"Absolute path: ", os.path.abspath(SOURCE_FOLDER+file_name), Colors.RESET)
    
    def quit(self, switch):
        if(not self.cant_connect):
            if(not self.connection_lost):
                self.stop_keep_alive()
            else:
                self.timeout_thread.join()
        self.sock.close() 
        if(switch):
            print(Colors.BRIGHT_YELLOW+"\nSwitching to server."+Colors.RESET)
        else:
            print(Colors.BRIGHT_RED+"Client closed.."+Colors.RESET)

def client_communication(client_ip, client_port, server_ip, server_port):
    client  = Client(client_ip, client_port, server_ip, server_port)
    if(client.send_initialization_message()):
        return False, None, None

    while True:
        client.active = False
        print(Colors.BRIGHT_BLACK+"\nDo you want to send a message or a file?"+Colors.RESET)
        print(Colors.BRIGHT_BLACK+"1 - Message"+Colors.RESET)
        print(Colors.BRIGHT_BLACK+"2 - File"+Colors.RESET)
        print(Colors.BRIGHT_BLACK+"3 - Switch roles"+Colors.RESET)
        print(Colors.BRIGHT_BLACK+"4 - Exit"+Colors.RESET)
        client.start_check_timeout()
        choice = int(input(Colors.BRIGHT_BLACK+"Number: "+Colors.RESET))
        if(choice == 3 or client.switch):
            print(Colors.BRIGHT_YELLOW+"\nSwitch initialized."+Colors.RESET)
            if(client.switch):
                client.quit(True)
                return True, client_ip, client_port
            elif(client.send_switch_initialization()):
                client.quit(True)
                return True, client_ip, client_port
        elif(choice == 4):
            while True:
                if(client.send_terminating_message()):
                    break
            break    
        else:
            if(choice == 1):
                message = input(Colors.BRIGHT_BLACK+"\nInput your message: "+Colors.RESET)
            elif(choice == 2):
                global DESTINATION_FOLDER
                global SOURCE_FOLDER
                print(Colors.MAGENTA+"\nCurrent destination folder: ", os.path.abspath(DESTINATION_FOLDER), Colors.RESET)
                print(Colors.BRIGHT_CYAN+"\nCurrent source folder: ", os.path.abspath(SOURCE_FOLDER),"\n"+ Colors.RESET)
                print(Colors.BLUE+"Do you want to change destination or source folder?"+Colors.RESET)
                print(Colors.MAGENTA+"1 - Change destination folder"+Colors.RESET)
                print(Colors.BRIGHT_CYAN+"2 - Change source folder"+Colors.RESET)
                print(Colors.BLUE+"3 - Don't change"+Colors.RESET)
                change_folder = int(input(Colors.BLUE+"Number: "+Colors.RESET))
                if(change_folder == 1):
                    DESTINATION_FOLDER = input(Colors.BLUE+"Enter new destination folder: "+Colors.RESET)
                if(change_folder == 2):
                    SOURCE_FOLDER = input(Colors.BLUE+"Enter new source folder: "+Colors.RESET)
                
                file_name = input(Colors.BRIGHT_BLACK+"\nEnter file name: "+Colors.RESET)
            else:
                if(not client.connection_lost):
                    continue
            print(Colors.BLUE+"\nEnter fragment size for the next message."+Colors.RESET)
            print(Colors.BLUE+"Min fragment size - 1\nMax fragment size - 1467"+Colors.RESET)
            fragment_size = int(input(Colors.BLUE+"Number: "+Colors.RESET))
            print(Colors.RED+"\nDo you want to simulate Error?"+Colors.RESET)
            print(Colors.RED+"Yes - enter the maximum amount of errors"+Colors.RESET)
            print(Colors.RED+"No - 0"+Colors.RESET)
            max_error = int(input(Colors.RED+"Number: "+Colors.RESET))
            if(choice == 1):
                client.send_message(message, max_error, fragment_size)
            else:
                client.send_file(file_name, max_error, fragment_size)
    client.quit(False)
    return False, None, None