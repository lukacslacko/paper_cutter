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

def comb(a, b, x):
    return [a[i]*x + b[i]*(1-x) for i in range(3)]

def mid(a, b):
    return comb(a, b, 1/2)

def mul(v, x):
    return [v[i]*x for i in range(3)]

def add(a, b, x):
    return [a[i]+x*b[i] for i in range(3)]

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

def fold_point(center, normal, horiz, point):
    v = vect(center, point)
    vlen = veclen(v)
    w = project_and_normalize(normal, v)
    u = np.cross(horiz, normal)
    x = dot(w, horiz)
    y = dot(w, u)
    return [x * vlen, y * vlen]

def fold_star_to_plane(center, points):
    nlen = veclen(center)
    n = [center[i] / nlen for i in range(3)]
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

def proj(p, rad):
    return mul(p, rad/veclen(p))

def polygon(center, points, rad):
    a = fold_star_to_plane(proj(center, rad), [proj(p, rad) for p in points])
    draw_holes(a)
    draw_edge(a)

phi = (1 + math.sqrt(5)) / 2

rad = 150
p = mul([phi, -1, 0], rad)
q = mul([phi, 1, 0], rad)
r = mul([1, 0, phi], rad)
s = mul([0, -phi, 1], rad)
t = mul([0, -phi, -1], rad)
u = mul([1, 0, -phi], rad)

v = mul(vect(p, mid(q,r)), 1/5)
w = mul(vect(r, mid(p,q)), -1/5)
vs = mul(vect(p, mid(r,s)), 1/5)
ws = mul(vect(s, mid(p,r)), -1/5)

polygon(add(p, v, 3), 
        [add(p, v, 4), add(add(p, v, 3), w, 1),
         add(add(p, v, 2), w, 1), add(p, v, 2),
         add(add(p, v, 3), w, -1), add(add(p, v, 4), w, -1)], rad)

shifty -= rad/2

polygon(p, [add(p, vect(p, mid(q,r)), 1/5),
            add(p, vect(p, mid(r,s)), 1/5),
            add(p, vect(p, mid(s,t)), 1/5),
            add(p, vect(p, mid(t,u)), 1/5),
            add(p, vect(p, mid(u,q)), 1/5)], rad)

shifty -= rad/2

polygon(add(add(p, v, 1), w, 1), 
        [add(add(p, v, 2), w, 1), add(p, v, 2), add(p, v, 1),
         add(p, vs, 1), add(p, vs, 2), add(add(p, vs, 3), ws, -1)], rad)

footer()
