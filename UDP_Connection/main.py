from client import client_communication
from server import server_communication
from colors import Colors
import socket

SERVER_IP = "169.254.2.250"
SERVER_PORT = 42424

CLIENT_IP = "169.254.48.190"
CLIENT_PORT = 42422

# SERVER_IP = "127.0.0.1"
# SERVER_PORT = 42424

# CLIENT_IP = "127.0.0.1"
# CLIENT_PORT = 42422


if __name__ =="__main__":
    print(Colors.BRIGHT_BLACK + "\nChoose role: \n1 - Client \n2 - Server" + Colors.RESET)
    role = int(input(Colors.BRIGHT_BLACK+"Number: " + Colors.RESET))
    switch = True
    if(role == 1):
        host = socket.gethostname()
        # print(socket.gethostbyname(host))
        # client_ip = input("Enter client IP: ")
        # client_port = int(input("Enter client port: "))
        # server_ip = input("Enter server IP: ")
        # server_port = int(input("Enter server port: "))
        client_ip = CLIENT_IP
        client_port = CLIENT_PORT
        server_ip = SERVER_IP
        server_port = SERVER_PORT
        while switch:
            switch, server_ip, server_port = client_communication(client_ip, client_port, server_ip, server_port)
            if switch:
                switch, client_ip, client_port, server_ip, server_port = server_communication(server_ip, server_port)
    elif(role == 2):
        # server_ip = input("Enter server IP: ")
        # server_port = int(input("Enter server port: "))
        server_ip = SERVER_IP
        server_port = SERVER_PORT
        while switch:
            switch, client_ip, client_port, server_ip, server_port = server_communication(server_ip, server_port)
            if switch: 
                switch, server_ip, server_port = client_communication(client_ip, client_port, server_ip, server_port)