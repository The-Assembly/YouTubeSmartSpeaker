# Use Voice Search to make a Video Playlist

## Introduction to Today's Workshop
OBJECTIVE: Create a voice controlled YouTube playlist generator app that runs on a Raspberry Pi. <br/> 

The user inputs artist name or keywords using the microphone; the app searches for and retrieves songs based on this criteria and then queues them for instant playback as an fully navigable, embedded YouTube playlist on a web page. <br/>

![Function_diagram](https://user-images.githubusercontent.com/32713072/34607292-64ff54e4-f22c-11e7-9ab5-cf19736566d1.jpg)

For the circuit diagram, use the image below as a guide.<br/>

![Circuit_diagram](https://user-images.githubusercontent.com/32713072/34574074-c46ba1aa-f18f-11e7-9c27-439b266c20e6.jpg) 

## Installing the Libraries
To enable the functionalities of all the different functions we will be using on python. Certain libraries need to be installed to enable us to use these "functionalities" for the further use.

### Nginx
This is a light-weight webserver that runs on the raspberry PI. We will use it to serve the player.html that we will create.
We’ll update our packages and then install nginx. Open up the terminal and run these commands, one after the other:

- sudo apt-get update
- sudo apt-get install nginx <br/>

#### Install PHP
We’re finally at the end of our acronym! PHP is responsible for the dynamic content of our site. Back to the terminal, now, with this command:
- sudo apt-get install php5-fpm php5-mysql

Let’s edit a file. These are PHP’s settings, and we’re going to make it more secure.
- sudo nano /etc/php5/fpm/php.ini

Find the line that says #cgi.fix_pathinfo=1 and change it to cgi.fix_pathinfo=0. You can find it with the search function (Ctrl+W). Then exit with Ctrl+X and save with Y. 

Then you’ll just restart PHP:
- sudo systemctl restart php5-fpm
 

#### Configure nginx to use PHP
You need to edit a file: 
- sudo nano /etc/nginx/sites-available/default

Once in here, you’ll want to change a few things. Edit it so that it looks like this:
```python
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /var/www/html;

    index index.php index.html index.htm index.nginx-debian.html;

    server_name [your public IP];

    location / {
        try_files $uri $uri/ =404;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php5-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```
Next to server_name, where I have **[your public IP]**, plug in your public IP address (you can find this by asking Google or another search engine). 

Then we’ll just test this and re-load nginx.
- sudo nginx -t
- sudo systemctl reload nginx <br/>

If all goes fine you will see the message below: <br/>
![If_all_goes_right](https://user-images.githubusercontent.com/32713072/34576334-03bccd1e-f197-11e7-9321-3d7068a23276.PNG)

Access your website by typing your public IP address into your web browser’s address bar from any internet-connected device. Your site will just have the nginx welcome page for now,  located at /var/www/html. You can remove that and create a file calledindex.html, if you  and continue from there. <br/>
**In our case, move all the content from RPIvideoplayer folder to /var/www/html on your Raspberry PI**

### Install Python 3 and PIP
Usually Python3 is pre-installed when you install Raspbian on your Raspberry PI. 

But, not all Python packages are available in the Raspbian archives, and those that are can sometimes be out-of-date. If you can't find a suitable version in the Raspbian archives, you can install packages from the Python Package Index (PyPI). To do so, use the pip tool.

**Pip** is installed by default in Raspbian Jessie (but not Raspbian Wheezy or Jessie Lite). You can install it with apt:

-sudo apt-get install python3-pip

### Changing the Audio output
Changing the audio output
There are two ways of setting the audio output.

#### COMMAND LINE
The following command, entered in the command line, will switch the audio output to HDMI:
- amixer cset numid=3 2 

Here the output is being set to 2, which is HDMI. Setting the output to 1 switches to analogue (headphone jack). The default setting is 0 which is automatic. 

#### RASPI-CONFIG
Open up raspi-config by entering the following into the command line:
- sudo raspi-config

This will open the configuration screen:

Select Option 8 Advanced Options and press Enter, then select Option A6:  Audio and press Enter.

Now you are presented with the two modes explained above as an alternative to the default Auto option.<br/>
Select a mode, press Enter and press the right arrow key to exit the options list, then select Finish to exit the configuration tool.

### Setup a USB microphone
Two options of attaching a microphone into Raspberry Pi. One is to have USB mic, another to have an external USB sound card. Regardless the choice, the following instruction will work in setting up some basic microphone setup, before doing something cool like recording music, or experimenting with voice recognition modules.<br/>

1. Plug in the dongle and check the version of your sound card with lsusb:
- lsusb

Bus 001 Device 004: ID 041e:30d3 Creative Technology, Ltd Sound Blaster Play! 
(will show your sound card here)

2. To enable USB audio output, load the sound driver:
- sudo modprobe snd_bcm2835

To prevent the internal sound card to appear at the top comment out line, and change index from -2 to 1:
- $sudo nano /etc/modprobe.d/alsa-base.conf
- options snd-usb-audio index=1

3. Enable USB audio output by default: <br/>
sudo nano /etc/asound.conf <br/>

```python
pcm.!default {

type plug

slave {

pcm "hw:1,0"

}

}

ctl.!default {

type hw

card 1

}
```
4. Reboot now:<br/>
sudo reboot

5. To record:<br/>
arecord -D plughw:1,0 -f cd test.wav

6. To playback:<br/>
aplay test.wav

7. You may want to adjust some volumes:<br/>
alsamixer

8. To save your settings:<br/>
sudo alsactl store

### Speech Recognition
Library for performing speech recognition, with support for several engines and APIs, online and offline.

#### Installation: 
- pip install SpeechRecognition *(Installs Google Speech recognition API)*
- sudo python -m speech_recognition *(to test it)* 

#### Python
The first software requirement is **Python 2.6, 2.7, or Python 3.3+**. This is required to use the library.

#### PyAudio *(for microphone users)*
PyAudio is required if and only if you want to use microphone input (**Microphone**). PyAudio version 0.2.11+ is required, as earlier versions have known memory management bugs when recording from microphones in certain situations.

If not installed, everything in the library will still work, except attempting to instantiate a Microphone object will raise an AttributeError.

On Debian-derived Linux distributions *(like Ubuntu and Mint)*, install PyAudio using APT:<br/>
- sudo apt-get install python-pyaudio python3-pyaudio <br/>

If the version in the repositories is too old, install the latest release using Pip:<br/>
- sudo apt-get install portaudio19-dev python-all-dev python3-all-dev
- sudo pip install pyaudio *(replace pip with pip3 if using Python 3)*.

**FOR MORE INFO: http://people.csail.mit.edu/hubert/pyaudio/#downloads** <br/>
&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&nbsp;&nbsp;&nbsp; **https://pypi.python.org/pypi/SpeechRecognition/**

### Google API
In our application we are using a library called - **gTTS (text to speech library)** <br/>
gTTS is a module and command line utility to save spoken text to mp3.
It uses the Google Text to Speech (TTS) API.
This module supports many languages and sounds very natural.

#### Installation
Install with the python package tool (pip):
- sudo pip install gTTS <br/>

#### Example
```python
from gtts import gTTS
import os
tts = gTTS(text='Good morning', lang='en')
tts.save("good.mp3")
os.system("mpg321 good.mp3")
```
If you want to test it on the command line use:
- gtts-cli.py “Hello” -l ‘en’ -o hello.mp3 <br/>

In addition, we are also using an inbuilt library, that come with speechrecognition library, when you install it. 
**FOR MORE INFO: https://pythonprogramminglanguage.com/text-to-speech/**

### Selenium
Selenium is a web automation tool. A web browser can be controlled using Python code, any task you would normally do on the web can be done using the selenium module.This library enables us to open a web browser from python and simulate button clicks on hosted html pages.

#### Installation
To install the selenium module, type the command:<br/>
- pip install -U selenium

#### Selenium Webdriver
Selenium is a web automation framework that can be used to automate website testing. Because Selenium starts a webbrowser, it can do any task you would normally do on the web.
Supported browsers are:

- Chrome
- Firefox
- Internet Explorer
- Safari
- Opera
- PhantomJS (invisible)

**Example**
```python
from selenium import webdriver
import time
 
options = webdriver.ChromeOptions()
options.add_argument('--ignore-certificate-errors')
options.add_argument("--test-type")
options.binary_location = "/usr/bin/chromium"
driver = webdriver.Chrome(chrome_options=options)
driver.get('https://python.org')
```
#### Selenium button click
Start by importing the selenium module and creating a web driver object. We then use the method:
```python
drivers.find_elements_by_xpath(path)
```
to find the html element. To get the path, we can use chrome development tools (press F12). We take the pointer in devtools and select the html button we are interested in. 

### Aslaaudio
This library enables us to control speaker volume through python. <br/>
- sudo -H pip3 install pyalsaaudio

### Firefox browser Raspberry PI

**Install dirmngr:**	<br/>	
- sudo apt install dirmngr <br/>

**Add the repository to your sources:** <br/>
- echo "deb http://ppa.launchpad.net/ubuntu-mozilla-security/ppa/ubuntu trusty main" | sudo tee /etc/apt/sources.list.d/firefox.list <br/>
- echo "deb-src http://ppa.launchpad.net/ubuntu-mozilla-security/ppa/ubuntu trusty main" | sudo tee /etc/apt/sources.list.d/firefox-source.list <br/>

**Install Firefox: ** <br/>
- sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys A6DCF7707EBC211F <br/>
- sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 9BDB3D89CE49EC21 <br/>
- sudo apt update && sudo apt install firefox <br/>

### Find the X-path in Mozella Firefox (Firebug)
Firebug is a add-on of Firefox which helps you in identifying HTML, CSS and JAVASCRIPT web elements more easily.<br/>
Firebug integrates with Firefox to put a wealth of development tools at your fingertips while you browse. You can edit, debug, and monitor CSS, HTML, and JavaScript live in any web page.<br/>
How to install Firebug:
- Launch Firefox browser.
- Type about:addons in address and hit **Enter**.
- Click on **Extensions** from left side.
- Type **Firebug** in search box and press **Enter**.
- Click on **Install**. It will download. It does not require restart of Firefox.
- You should see an icon of **bug** in right side top corner.

**In case Firebug is not enabled, follow the steps below** 

The Firebug extension isn’t being developed or maintained any longer. So, it will be disabled by default. When you do right click and see you will not get option to inspect with firebug. Firefox DevTools is alternative of Firebug.<br/>

Still you can use it but you need to enable it.
 
Steps to enable Firebug in Firefox:

- Launch Firefox browser.

- Type **about:config** is address bar and click on  *I accept the risk*.

- Search for : <br/>
a. ‘browser.tabs.remote.autostart’ and set the value to ‘false’ <br/>
b. ‘browser.tabs.remote.autostart.1’ (if present) and set the value to ‘false’ <br/>
c. ‘browser.tabs.remote.autostart .2’ and set the value to ‘false’ <br/>

- Restart the Firefox.

### Setting up the GPIO pins on a Raspberry PI
The newest version of Raspbian has the RPi.GPIO library pre-installed. You’ll probably need to update your library, so using the command line, run:
- sudo apt-get install rpi.gpio
If it isn’t already installed it will be installed. If it is already installed it will be upgraded if a newer version is available.

#### Using the RPi.GPIO Library
Now that you’ve got the package installed and updated, let’s take a look at some of the functions that come with it. Open the Leafpad text editor and save your sketch as “myInputSketch.py”. From this point forward, we’ll execute this script using the command line:

- sudo python myInputSketch.py

All of the following code can be added to this same file. Remember to save before you run the above command. To exit the sketch and make changes, press Ctrl+C.

To add the GPIO library to a Python sketch, you must first import it: <br/>
```python
import RPi.GPIO as GPIO
```

Then we need to declare the type of numbering system we’re going to use for our pins: <br/>
```python
#set up GPIO using BCM numbering
GPIO.setmode(GPIO.BCM)
#setup GPIO using Board numbering
GPIO.setmode(GPIO.BOARD)
```
#### Examples: 
https://thepihut.com/blogs/raspberry-pi-tutorials/27968772-turning-on-an-led-with-your-raspberry-pis-gpio-pins <br/>
https://www.raspberrypi-spy.co.uk/2012/05/install-rpi-gpio-python-library/

### Setting up the program to run on terminal, after boot
A simple way to see how you can setup to run python file on Raspberry Pi startup (using the terminal).

- Save the python file on home/pi
- On the terminal, navigate to  /home/pi
- now open a hidden file  .bashrc  ( type "sudo nano .bashrc" on terminal and press enter)
- At the end of the file type "python" followed by your file name (eg: python3 speechtotext)
- If you want the terminal to revert back to its normal format, either comment out the command on the .bashrc file or remove it (you can access the bash file in /home/pi).

