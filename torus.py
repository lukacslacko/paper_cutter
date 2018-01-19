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

def rotlineshift(x1,y1,x2,y2,a,x3,y3):
    line(rotx(x1,y1,a)+x3, roty(x1,y1,a)+y3, rotx(x2,y2,a)+x3, roty(x2,y2,a)+y3)

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

R = 80
rho = 50
n1 = 2
n2 = 16

hole = 3
width = 10

circle = 12

draw_holes = True

def point(phi, delta):
    return [(R + rho * math.cos(phi)) * math.cos(delta),
            (R + rho * math.cos(phi)) * math.sin(delta),
            rho * math.sin(phi)]

def vect(p, q):
    return [q[i] - p[i] for i in range(3)]

def summul(p, q, a):
    return [p[i] + a * q[i] for i in range(3)]

def dot(x, y):
    s = 0
    for i in range(3):
        s += x[i] * y[i]
    return s

for i in range(4 * n1):
    phi = (i * math.pi) / (2*n1)
    a = [math.cos(phi), 0, math.sin(phi)]
    b = [math.sin(phi), 0, -math.cos(phi)]
    p = point(phi, 0)

    q1 = point(phi + math.pi / (6*n1), 2 * math.pi / n2)
    v1 = vect(p, q1)
    va1 = dot(v1, a)
    w1 = summul(v1, a, -va1)
    wb1 = dot(w1, b)
    wabs1 = math.sqrt(dot(w1, w1))
    alpha1 = math.acos(wb1 / wabs1)
    vabs1 = math.sqrt(dot(v1, v1))

    q2 = point(phi - math.pi / (6*n1), 2 * math.pi / n2)
    v2 = vect(p, q2)
    va2 = dot(v2, a)
    w2 = summul(v2, a, -va2)
    wb2 = dot(w2, b)
    wabs2 = math.sqrt(dot(w2, w2))
    alpha2 = math.acos(wb2 / wabs2)
    vabs2 = math.sqrt(dot(v2, v2))

    pp = point(phi + math.pi / (3*n1), 0)
    ppp = vect(p, pp)
    pppabs = math.sqrt(dot(ppp, ppp))

    dy = i * rho * 3

    if draw_holes:
        for c in range(circle):
            u1 = 2 * math.pi * c / circle
            u2 = u1 + 2 * math.pi / circle
            x1 = hole / 2 * math.cos(u1)
            y1 = hole / 2 * math.sin(u1)
            x2 = hole / 2 * math.cos(u2)
            y2 = hole / 2 * math.sin(u2)
            rotlineshift(pppabs + x1, y1, pppabs + x2, y2, 0, 0, dy)
            rotlineshift(pppabs + x1, y1, pppabs + x2, y2, math.pi, 0, dy)
            rotlineshift(vabs1 + x1, y1, vabs1 + x2, y2, alpha1, 0, dy)
            rotlineshift(vabs1 + x1, y1, vabs1 + x2, y2, -alpha1, 0, dy)
            rotlineshift(vabs2 + x1, y1, vabs2 + x2, y2, alpha2, 0, dy)
            rotlineshift(vabs2 + x1, y1, vabs2 + x2, y2, -alpha2, 0, dy)
    else:
        rotlineshift(0, 0, pppabs, 0, 0, 0, dy)
        rotlineshift(0, 0, pppabs, 0, math.pi, 0, dy)
        rotlineshift(0, 0, vabs1, 0, alpha1, 0, dy)
        rotlineshift(0, 0, vabs1, 0, -alpha1, 0, dy)
        rotlineshift(0, 0, vabs2, 0, alpha2, 0, dy)
        rotlineshift(0, 0, vabs2, 0, -alpha2, 0, dy)

#
#r = radius * math.asin(math.sqrt((1 - math.cos(angle)) / (1 - math.cos(2*math.pi/n))))
#y = width / (2 * math.tan(math.pi / n))
#
#for i in range(n):
#    a = 2*i*math.pi/n
#    rotline(width/2, y, width/2, r, a)
#    for p in range(circle):
#        rotline(width/2*math.cos(p*math.pi/circle), r + width/2*math.sin(p*math.pi/circle), 
#                width/2*math.cos((p+1)*math.pi/circle), r + width/2*math.sin((p+1)*math.pi/circle),
#                a)
#    for p in range(2*circle):
#        rotline(hole/2*math.cos(p*math.pi/circle), r + hole/2*math.sin(p*math.pi/circle), 
#                hole/2*math.cos((p+1)*math.pi/circle), r + hole/2*math.sin((p+1)*math.pi/circle),
#                a)
#    rotline(-width/2, r, -width/2, y, a)

footer()
