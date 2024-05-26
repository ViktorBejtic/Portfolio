import socket
import os
import time
import threading
import sys
import select
from zlib import crc32
from colors import Colors
from Utilities import create_datagram, extract_data
class Server:
    def __init__(self, server_ip, server_port):
        self.sock = socket.socket(socket.AF_INET,socket.SOCK_DGRAM) 
        self.sock.bind((server_ip, server_port)) 
        self.server_ip = server_ip
        self.server_port = server_port
        self.client_ip = None
        self.client_port = None
        self.end_com = False
        self.ended = False
        self.client = None
        self.ask_switch = False
    
    def receive(self):
        try:
            datagram = None
            while datagram is None:
                datagram, self.client = self.sock.recvfrom(1472) 

            datagram, flag, data, crc = extract_data(datagram, True)
            if(crc != crc32(datagram)):
                self.send_response(8, "NACK");
                return flag, data, False
            return flag, data, True
        except OSError:
            sys.exit(0)
    
    def wait_for_input(self, timeout):
        print(Colors.MAGENTA+"\nWaiting for input. You have", timeout  ,"seconds."+Colors.RESET)
        rlist, _, _ = select.select([sys.stdin.fileno()], [], [], timeout)
        if rlist:
            input = sys.stdin.readline().strip()
            print(Colors.YELLOW+"Switch initialized.\n"+Colors.RESET)
            return input
        else:
            print(Colors.BRIGHT_RED+"No input received within the timeout.\n"+Colors.RESET)
            return None
    
    def send_switch_initialization(self):
        datagram = create_datagram(flag=128, data="SWITCH", error=False)
        self.sock.sendto(datagram, self.client)
    
    def send_response(self, flag, message):
        datagram = create_datagram(flag, message, error=False)
        self.sock.sendto(datagram, self.client)
    
    def send_last_response(self):
        self.send_response(6, "END-ACK")
        print(Colors.BRIGHT_RED+"End connection message received...closing connection"+Colors.RESET)
    
    def quit(self, switch):
        self.ended = True
        self.sock.close()
        if(switch):
            print(Colors.YELLOW+"\nSwitching to client."+Colors.RESET)
        else:
            print(Colors.BRIGHT_RED+"Server closed.."+Colors.RESET)
    
    def quit_com_when_unresponsive(self):
        while not self.end_com:
            self.end_com = True
            time.sleep(10)
        
        if self.ended:
            return False
        print(Colors.BRIGHT_RED+"\nNo packet received in 10 seconds."+Colors.RESET)
        print(Colors.BRIGHT_RED+"Connection to client lost. Closing server..."+Colors.RESET)
        print(Colors.BRIGHT_RED+"Server closed.."+Colors.RESET)
        self.quit(False)
        return True
    
    def start_timeout(self):
        self.quit_com_when_unresponsive_thread = threading.Thread(target=self.quit_com_when_unresponsive)
        self.quit_com_when_unresponsive_thread.setDaemon(True)
        self.quit_com_when_unresponsive_thread.start()

def server_communication(server_ip, server_port):
    server  = Server(server_ip, server_port)
    print(Colors.MAGENTA + "\nWaiting for connection." + Colors.RESET)
    message = ""
    file_array = []
    corrupted_packets = 0
    received_packets = 0
    started = True
    switch = None
    connected = False
    sending_switch = False
    
    while True:
        if connected:
            if(server.start_timeout()):
                return False, None, None, None, None
        if not started:
            server.ask_switch = True
            switch = server.wait_for_input(3)
        if(switch):
            server.send_switch_initialization()
            sending_switch = True
        flag, data, correct = server.receive()
        connected = False
        started = False
        server.end_com = False
        if(not correct):
            print(Colors.BRIGHT_RED+"Corrupted packet: ", received_packets+1, Colors.RESET)
            corrupted_packets += 1
            started = True
            continue
        if(flag == 1):
            server.send_response(5, "INIT-ACK");
            print(Colors.BRIGHT_GREEN + "\nConnection Established. Server is running"+ Colors.RESET)
            message = ""
            connected = True
            started = True
        elif(flag == 2):
            server.send_last_response()
            break
        elif(flag == 16 or flag == 18):
            started = True
            received_packets += 1
            data = data.decode("utf-8")
            print(Colors.GREEN+"Packet number", received_packets,"received", Colors.RESET)
            
            message += data
            if(flag == 18):
                print(Colors.BRIGHT_GREEN+"\nMessage successfully received\n", Colors.RESET)
                print(Colors.GREEN+"Size of message: ", len(message), "B", Colors.RESET)
                print(Colors.GREEN+"Number of corrupted packets: ", corrupted_packets, Colors.RESET)
                print(Colors.GREEN+"Number of packets accepted: ",  received_packets, Colors.RESET)
                print(Colors.GREEN+"Number of all packets: ", corrupted_packets+received_packets, Colors.RESET)
                print(Colors.BRIGHT_GREEN+"\nMessage received: " + message, Colors.RESET)
                message = "" 
                corrupted_packets = 0
                received_packets = 0 
                started = False
            server.send_response(20, "MESSAGE-ACK")
        elif(flag == 32 or flag == 34):
            started = True
            received_packets += 1
            print(Colors.BRIGHT_GREEN+"Packet number ", received_packets," received", Colors.RESET)
            if(flag == 34):
                path = data.decode("utf-8")
                parts = path.rsplit("/", 1)
                file_name = parts[1]
                with open(path, 'wb') as file:
                    for file_data in file_array:
                        file.write(file_data)
                print(Colors.BRIGHT_GREEN+"\nFile successfully received\n"+Colors.RESET)           
                print(Colors.GREEN+"Number of corrupted packets: ", corrupted_packets, Colors.RESET)
                print(Colors.GREEN+"Number of packets accepted: ",  received_packets, Colors.RESET)
                print(Colors.GREEN+"Number of all packets: ", corrupted_packets+received_packets, Colors.RESET)
                print(Colors.GREEN+"Size of the file: ", os.path.getsize(path),"B", Colors.RESET)
                print(Colors.GREEN+"Name of the file: ", file_name, Colors.RESET)
                print(Colors.GREEN+"\nAbsolute path: ", os.path.abspath(path), Colors.RESET)
                file_array = []
                corrupted_packets = 0
                received_packets = 0 
                started = False
            else:
                file_array.append(data)
            server.send_response(36, "FILE-ACK")
        elif(flag == 17):
            data = data.decode("utf-8")
            client_ip, client_port = data.split("|")
            server.client_ip = client_ip
            server.client_port = int(client_port)
        elif(flag == 64):
            started = True
            server.send_response(68, "KEEP-ALIVE-ACK")
            if(not sending_switch):
                print(Colors.BRIGHT_CYAN + "Keep-alive message received." + Colors.RESET)
        elif(flag == 128 or flag == 132):
            if(flag == 128):
                server.send_response(132, "SWITCH-ACK")
                print(Colors.YELLOW+"Switch initialized."+Colors.RESET)
            server.quit(True)
            return True, server.server_ip, server.server_port, server.client_ip, server.client_port 
    server.quit(False)
    return False, None, None, None, None

