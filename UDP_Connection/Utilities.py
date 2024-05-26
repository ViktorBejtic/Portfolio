from zlib import crc32

def create_datagram(flag, data, error):
    flags = flag.to_bytes(1, byteorder='big')
    if(flag == 32):
        Datagram = flags + data    
    else:
        Datagram = flags + data.encode("utf-8")
    crc = calculate_crc(Datagram, error)
    return Datagram + crc.to_bytes(4, byteorder='big')

def calculate_crc(datagram, error):
    if(error):
        return crc32(datagram + "error".encode("utf-8"))
    else:
        return crc32(datagram)

def extract_data(datagram, all):
    flag = datagram[0]
    crc = int.from_bytes(datagram[-4:])
    datagram = datagram[:-4]
    data = datagram[1:]
    if(all):
        return datagram, flag, data, crc
    else: 
        return datagram, flag   
