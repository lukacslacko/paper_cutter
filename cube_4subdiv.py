import math
import numpy as np

shifty = 0

def line(x1,y1,x2,y2):
  print(0)
  print('LINE')
  print(8)
  print('Polygon')
  print(10)
  print(x1)
  print(20)
  print(y1+shifty)
  print(11)
  print(x2)
  print(21)
  print(y2+shifty)

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

hole = 3
width = 10

circle = 12

draw_holes = True

def vect(p, q):
    return [q[i] - p[i] for i in range(3)]

def dot(x, y):
    s = 0
    for i in range(3):
        s += x[i] * y[i]
    return s

def veclen(v):
    return math.sqrt(dot(v, v))

def summul(p, q, a):
    return [p[i] + a*q[i] for i in range(3)]

def project_and_normalize(normal, point):
    v = summul(point, normal, -dot(normal, point))
    l = veclen(v)
    return [v[i] / l for i in range(3)]

def sphere(x, y, z, R):
    a = 0.7
    xx = x - a * (x/z)*(1-x/z)*z
    yy = y - a * (y/z)*(1-y/z)*z
    r = veclen([xx, yy, z])/R
    return [xx/r, yy/r, z/r]

def fold_point(center, normal, horiz, point):
    v = vect(center, point)
    vlen = veclen(v)
    w = project_and_normalize(normal, v)
    u = np.cross(horiz, normal)
    x = dot(w, horiz)
    y = dot(w, u)
    return [x * vlen, y * vlen]

def fold_star_to_plane(center, normal, points):
    nlen = veclen(normal)
    n = [normal[i] / nlen for i in range(3)]
    folded = {}
    horiz = project_and_normalize(n, vect(center, points[0]))
    for i in range(len(points)):
        folded[i] = fold_point(center, n, horiz, points[i])
    return [folded[i] for i in range(len(points))]

def draw_holes(points):
    for p in points:
        for i in range(2*circle):
            a = i * math.pi / circle
            b = a + math.pi / circle
            line(p[0] + hole/2*math.cos(a), p[1] + hole/2*math.sin(a), 
                 p[0] + hole/2*math.cos(b), p[1] + hole/2*math.sin(b))

def connect(p, q):
    plen = math.sqrt(p[0]*p[0]+p[1]*p[1])
    qlen = math.sqrt(q[0]*q[0]+q[1]*q[1])
    a = [p[i]/plen for i in range(2)]
    b = [q[i]/qlen for i in range(2)]
    ab = a[0]*b[0]+a[1]*b[1]
    alpha = (width/2)/math.sqrt(1-ab*ab)
    t = [alpha*(a[0]+b[0]), alpha*(a[1]+b[1])]
    beta = alpha * (1 + ab)
    u = [t[0] - beta*b[0], t[1] - beta*b[1]]
    v = [t[0] - beta*a[0], t[1] - beta*a[1]]
    line(t[0],t[1], q[0]+u[0], q[1]+u[1])
    line(t[0],t[1], p[0]+v[0], p[1]+v[1])
    for i in range(circle):
        x = i * math.pi / circle
        y = x + math.pi / circle
        line(q[0] + math.cos(x) * u[0] + math.sin(x) * b[0] * width/2,
             q[1] + math.cos(x) * u[1] + math.sin(x) * b[1] * width/2,
             q[0] + math.cos(y) * u[0] + math.sin(y) * b[0] * width/2,
             q[1] + math.cos(y) * u[1] + math.sin(y) * b[1] * width/2)

def draw_edge(points):
    for i in range(len(points)):
        j = (i+1) % len(points)
        connect(points[i], points[j])

def square_face(size, dx, dy, R):
    a = fold_star_to_plane(sphere(1+dx,1+dy,size,R), sphere(1+dx, 1+dy, size, 1), [sphere(dx,dy,size,R), sphere(2+dx,dy,size,R), sphere(2+dx,2+dy,size,R), sphere(dx,2+dy,size,R)])
    draw_holes(a)
    draw_edge(a)

rad = 100
square_face(4, 1, 1, rad)
shifty -= 100
square_face(4, 1, 3, rad)
shifty -= 100
square_face(4, 3, 3, rad)

footer()
