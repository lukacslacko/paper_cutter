import math
from math import sin, cos, pi

shx = 0
shy = 0

def line(x1,y1,x2,y2):
  print(0)
  print('LINE')
  print(8)
  print('Polygon')
  print(10)
  print(shx+x1)
  print(20)
  print(shy+y1)
  print(11)
  print(shx+x2)
  print(21)
  print(shy+y2)

def rotx(x,y,a):
    return x*math.cos(a) - y*math.sin(a)

def roty(x,y,a):
    return x*math.sin(a) + y*math.cos(a)

def rotline(x1,y1,x2,y2,a):
    line(rotx(x1,y1,a), roty(x1,y1,a), rotx(x2,y2,a), roty(x2,y2,a))

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

def star(a):
    n = 5
    for i in range(24):
        g = pi * i / 12
        gg = g + pi / 12
        line(1.5 * cos(g), 1.5 * sin(g), 1.5 * cos(gg), 1.5 * sin(gg))
    for i in range(n):
        g = 2 * pi / n * i
        w = a * cos(2*pi/n)/cos(pi/n)
        rotline(0, a, w * sin(pi / n), w * (cos(pi / n)), g)
        rotline(0, a, -w * sin(pi / n), w * (cos(pi / n)), g)

for a in range(8, 50, 2):
    star(a)
    shx += 2.2*a
    if shx > 150:
        shx = 0
        shy -= 2*a

footer()
