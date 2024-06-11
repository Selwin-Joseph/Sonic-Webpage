import SimpleHTTPServer
import SocketServer
import os
import socket
import subprocess

# Get the path to the 'webpage' directory
static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '/tmp/iCOS/boot/web_server1/')

# Change the current working directory to 'webpage'
os.chdir(static_dir)

# Function to get IP addresses of all interfaces
def get_all_ip_addresses():
    ip_addresses = []
    try:
        # Get the output of the 'ifconfig' command
        ifconfig_output = subprocess.check_output(['ifconfig']).decode('utf-8')
        
        # Split the output by interface sections
        interface_sections = ifconfig_output.split('\n\n')

        # Iterate over interface sections
        for section in interface_sections:
            # Extract the interface name
            lines = section.strip().split('\n')
            if lines:
                iface_name = lines[0].split()[0]
                # Extract the IPv4 address if available
                for line in lines:
                    if 'inet addr:' in line:
                        ip_address = line.split('inet addr:')[1].split()[0]
                        ip_addresses.append((iface_name, ip_address))
    except Exception as e:
        print("Error getting IP addresses:", e)
    return ip_addresses

# Get all IP addresses
all_ips = get_all_ip_addresses()

# Set a dynamic port number
PORT = 8000  # 0 means the OS will choose a random available port

# Custom handler to serve additional files
class MyHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/tmp':
            # Serve a different txt file for the "/additional" path
            self.path = 'tmp/general.txt'
        # Call the superclass method to handle other paths
        return SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

# Create the server with the custom handler
httpd = SocketServer.TCPServer(("0.0.0.0", PORT), MyHandler)  # Listen on all available interfaces

# Get the dynamically assigned port
PORT = httpd.server_address[1]

print("Serving at:")
for iface_name, ip_address in all_ips:
    print("- {} http://{}:{}".format(iface_name, ip_address, PORT))

httpd.serve_forever()
