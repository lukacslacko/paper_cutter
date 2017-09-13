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

r = 10
alpha = 60.0
n = 10

#mul = 1 + 1 / (math.sin(math.radians(45 - alpha/(2 * n))) / math.sin(math.radians(alpha/(2*n)))) / math.sqrt(2)
mul = 1.1

def iv(d):
    for i in range(n):
        a = math.radians(d + i*alpha/n)
        b = a + math.radians(alpha/n)
        line(r*math.cos(a), r*math.sin(a), r*math.cos(b), r*math.sin(b))

def rece(d):
    rr = r * mul
    for i in range(n+1):
        a = math.radians(d + i*alpha/n)
        b = a + math.radians(alpha/(2 * n))
        line(r*math.cos(a), r*math.sin(a), rr*math.cos(b), rr*math.sin(b))

d = 0

#line(0,0, r*math.cos(math.radians(-15)), r*math.sin(math.radians(-15)))
#line(0,0, r*math.cos(math.radians(alpha)), r*math.sin(math.radians(alpha)))
#line(r*math.cos(math.radians(-15)), r*math.sin(math.radians(-15)), r, 0)

for i in range(n):
    #rece(d)
    d = d + alpha / (2 * n)
    r = r * mul
iv(d)

footer()
