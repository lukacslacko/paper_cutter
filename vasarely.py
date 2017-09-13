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

for x in range(-7, 7):
  prevx = -100
  prevy = -100
  x = x + 0.5
  for y in range(-7*5, 7*5):
    y = y/5 + 0.5
    r = math.sqrt(x*x + y*y)
    rr = r
    if rr == 0:
      continue
    if rr < 6:
      rr = 6 * math.sqrt(rr/6)
    xx = x/r*rr
    yy = y/r*rr
    if prevx > -100:
      line(prevy, prevx, yy, xx)
    prevx = xx
    prevy = yy

footer()
