from http.server import HTTPServer, BaseHTTPRequestHandler
import threading
import base64
from time import sleep
import datetime as dt
from subprocess import call, check_call
#from picamera import PiCamera
import picamera
from gpiozero import Device, Button
import os
import logging

#define some globals
zoomLevel = 0.0
camera = None

class  web_server(BaseHTTPRequestHandler):
	def do_POST(self):
		logging.info(self.path)
		global zoomLevel
		if self.path.endswith("resetCamera"):
			#logging.info(camera)
			camera.exposure_mode = "auto"
			camera.awb_mode = "auto"
			sleep(1)
			camera.exposure_mode = "off"
			g = camera.awb_gains
			camera.awb_mode = "off"
			camera.awb_gains = g
			zoomLevel = 0.0

		elif self.path.endswith("zoomIn") or self.path.endswith("zoomOut"):
			contentLen = int(self.headers.get("Content-Length"))
			body = self.rfile.read(contentLen)
			body = body.decode('utf-8')
			zoomLevel = float(body)

		self.send_response(200)
		self.send_header('Content-type', 'text/html')

		return 

	def do_GET(self):
		if self.path == "/":
			self.path = "/index.html"

		#logging.info ("Serving GET for " + self.path[1:])

		try:
			reply = False
			path = os.path.dirname(os.path.realpath(__file__)) + "/"
			#logging.info ("Running in " + path)

			if "/api" in self.path:
				mime = "text/plain"
				reply = True
			elif self.path.endswith(".html"):
				mime = "text/html"
				reply = True
			elif self.path.endswith(".jpg"):
				mime = "image/jpg"
				reply = True
			elif self.path.endswith(".js"):
				mime = "application/javascript"
				reply = True
			elif self.path.endswith(".css"):
				mime = "text/css"
				reply = True

			if reply:
				self.send_response(200)
				self.send_header("Content-type", mime)
				self.end_headers()

				if self.path == "/api/getImage":
					#logging.info("returning base64 image")
					f = open(path + "target.jpg", "rb")
					self.wfile.write(base64.b64encode(f.read()))
					f.close()
				else:
					#logging.info("Sending " + self.path + " - type " + mime)
					f = open(path + self.path, "rb")
					self.wfile.write(f.read())
					f.close()
			return

		except IOError as e:
			logging.error(self.path + "  " + str(e))
			self.send_error(404, "File not found : %s", self.path)


def start_web_server():
	httpd = HTTPServer(("0.0.0.0", 80), web_server)
	logging.info("Starting web server...")
	httpd.serve_forever()

def start_camera(path):
	logging.info ("Initialising camera...")
	global camera
	camera = picamera.PiCamera(resolution = (1280, 720), framerate = 30)
	sleep(2)
	logging.info("Camera initialised")
	camera.shutter_speed = camera.exposure_speed
	camera.exposure_mode = "off"
	camera.rotation = 180
	g = camera.awb_gains
	camera.awb_mode = "off"
	camera.awb_gains = g

	camera.annotate_background = picamera.Color('black')

	logging.info("Starting capture...")
	for fn in camera.capture_continuous(path + "/target.jpg"):
		w = 1.0 - (zoomLevel * 2)
		h = 1.0 - (zoomLevel * 2)
		camera.zoom = (zoomLevel, zoomLevel, w, h)
		camera.annotate_text = dt.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
		#print ("Captured %s" % fn)
		sleep(0.25)

	logging.info("Finished capture")

def shutdown():
	check_call(["sudo", "poweroff"])

#global httpd

try:
	# set up the shutdown button
	shutdownButton = Button(4, hold_time=1)
	shutdownButton.when_held = shutdown

	#configure logging
	path = os.path.dirname(os.path.realpath(__file__))
	logfile = path + "/camera.log"

	if os.path.exists(logfile):
		print("log file exists")
		### os.remove(logfile)

	logging.basicConfig(
		level=logging.INFO,
		format=('[%(asctime)s] %(levelname)-8s %(name)-12s %(message)s'),
		filename=(logfile)
	)
	logging.info("")

	#comment for local dev
	### start_web_server()

	##uncomment to run on the pi
	thread = threading.Thread(target=start_web_server)
	thread.setDaemon(True)
	thread.start()
	logging.info("web server started")

	start_camera(path)
	#### sleep(2000)

except KeyboardInterrupt as e:
	logging.error(e)
	logging.error("Shutting down the web server")
	#httpd.socket_close()
