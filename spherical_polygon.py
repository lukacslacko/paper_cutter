import math

def line(x1,y1,x2,y2):
  print(0)
  print('LINE')
  print(8)
  print('Polygon')
  print(10)
  print(x1)
  print(20)
  print(y1)
  print(11)
  print(x2)
  print(21)
  print(y2)

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

n = 3
hole = 3
width = 10
radius = 30
angle = math.pi/3


circle = 12

r = radius * math.asin(math.sqrt((1 - math.cos(angle)) / (1 - math.cos(2*math.pi/n))))
y = width / (2 * math.tan(math.pi / n))

for i in range(n):
    a = 2*i*math.pi/n
    rotline(width/2, y, width/2, r, a)
    for p in range(circle):
        rotline(width/2*math.cos(p*math.pi/circle), r + width/2*math.sin(p*math.pi/circle), 
                width/2*math.cos((p+1)*math.pi/circle), r + width/2*math.sin((p+1)*math.pi/circle),
                a)
    for p in range(2*circle):
        rotline(hole/2*math.cos(p*math.pi/circle), r + hole/2*math.sin(p*math.pi/circle), 
                hole/2*math.cos((p+1)*math.pi/circle), r + hole/2*math.sin((p+1)*math.pi/circle),
                a)
    rotline(-width/2, r, -width/2, y, a)

footer()
