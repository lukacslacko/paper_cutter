from math import sin,cos,pi
scale = 24
shifty = 0
shiftx = 0
def line(x1,y1,x2,y2):
  print(0)
  print('LINE')
  print(8)
  print('Polygon')
  print(10)
  print((shiftx+x1)*scale)
  print(20)
  print((shifty+y1)*scale)
  print(11)
  print((shiftx+x2)*scale)
  print(21)
  print((shifty+y2)*scale)

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

def sq(x):
    return x*x

def cu(x):
    return x*x*x

def f(x,y,z):
    return cu(sq(x)+9/4*sq(y)+sq(z)-1)-sq(x)*cu(z)-sq(y)*cu(z)*9/80

def root(x, y, z1, z2):
    if max(z1,z2)-min(z1,z2) < 0.0001:
        return z2
    z = (z1+z2)/2
    if f(x,y,z) < 0:
        return root(x,y,z1,z)
    else:
        return root(x,y,z,z2)

zlim = 5
zstep = 0.01
def interval(x, y):
    z = -zlim
    while z < zlim:
        if f(x,y,z) < 0:
            return [root(x,y,-zlim,z), root(x,y,zlim,z)]
        z += zstep
    return None

def cut(y):
    maxz = 0
    xstep = 50
    for xx in range(2*xstep-1):
        x = xx/xstep
        x1 = x + 1/xstep
        i = interval(x, y)
        maxz = max(maxz,max(i)-min(i))
        j = interval(x1, y)
        if j is None:
            line(x,i[0],x,i[1])
            line(-x,i[0],-x,i[1])
            return [x, maxz]
        line(x,i[0],x1,j[0])
        line(x,i[1],x1,j[1])
        line(-x,i[0],-x1,j[0])
        line(-x,i[1],-x1,j[1])

def hole():
    r = 1.5/scale
    w = 0.15/scale
    p=0.18
    line(-w,p-r,w,p-r)
    line(w,p-r,w,p+r)
    line(w,p+r,-w,p+r)
    line(-w,p+r,-w,p-r)

header()
maxz = 0
ysteps = 40
for y in range(ysteps):
    d=cut(0.68*y/ysteps)
    hole()
    shiftx += 2.1*d[0]
    maxz = max(maxz, d[1])
    if shiftx > 6:
        shiftx = 0
        shifty -= maxz*1.05
        maxz = 0
footer()
