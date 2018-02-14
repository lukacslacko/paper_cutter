import math
import numpy as np

shiftx = 0
shifty = 0

def line(x1,y1,x2,y2):
  print(0)
  print('LINE')
  print(8)
  print('Polygon')
  print(10)
  print(x1+shiftx)
  print(20)
  print(y1+shifty)
  print(11)
  print(x2+shiftx)
  print(21)
  print(y2+shifty)

def header():
  print(0)
  print('SECTION')
  print(2)
  print('ENTITIES')

def footer():
  print(0)
  print('ENDSEC')
  print(0)
  print('EOF')


header()

R = 120
rho = 80
torus_alpha = 2/3
n1 = 10
n2 = 15

hole = 3
width = 10

page_width = 180

circle = 12

def remap(lat):
    return lat - math.asin(math.sin(lat)*torus_alpha)

def torus_point(R, rho, lat, lng):
    relat = remap(lat)
    return [math.cos(lng) * (R - rho*math.cos(relat)), 
            (R - rho*math.cos(relat))*math.sin(lng),
            rho*math.sin(relat)]

def dist(p, q):
    d = 0
    for i in range(3):
        d += (p[i] - q[i]) * (p[i] - q[i])
    return math.sqrt(d)

def strip(l):
    r = width/2
    line(0, -r, l, -r)
    line(0, r, l, r)
    for i in range(circle):
        a = math.pi * i / circle
        b = a + math.pi / circle
        line(-r*math.sin(a), r*math.cos(a), -r*math.sin(b), r*math.cos(b))
        line(l+r*math.sin(a), r*math.cos(a), l+r*math.sin(b), r*math.cos(b))
    for i in range(2*circle):
        a = math.pi * i / circle
        b = a + math.pi / circle
        r = hole/2
        line(-r*math.sin(a), r*math.cos(a), -r*math.sin(b), r*math.cos(b))
        line(l+r*math.sin(a), r*math.cos(a), l+r*math.sin(b), r*math.cos(b))

def render(d):
    global shiftx, shifty
    w = d + width*1.5
    if w+shiftx > page_width:
        shiftx = 0
        shifty -= width*1.5
    strip(d)
    shiftx += w


for i in range(9):
    lata = 2*math.pi/9*i
    latb = 2*math.pi/9*(i+1)
    lng = 2*math.pi/27
    p = torus_point(R, rho, lata, 0)
    #q = torus_point(R, rho, latb, lng)
    q = torus_point(R, rho, latb, 2*lng)
    d = dist(p,q)
    for i in range(3):
        render(d)

footer()
