from math import *

def l(v):
    return sqrt(sum([x*x for x in v]))
    
def norm(v):
    return [x/l(v) for x in v]
    
def rot(v):
    return [-v[1], v[0]]
    
def vec(a, b):
    return [b[0]-a[0], b[1]-a[1]]
    
def plus(a, b):
    return [a[0]+b[0], a[1]+b[1]]
    
def mul(x, a):
    return [x*a[0], x*a[1]]

def midpoint(p, q):
    return mul(0.5, plus(p, q))


def line(a, b):
    print(0)
    print('LINE')
    print(8)
    print('Polygon')
    print(10)
    print(a[0])
    print(20)
    print(a[1])
    print(11)
    print(b[0])
    print(21)
    print(b[1])

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
    
def arc(c, r, st, en, num=16):
    rr = rot(r)
    lastq = None
    for i in range(num):
        a = st + (i*(en-st))/num
        aa = st + ((i+1)*(en-st))/num
        p = plus(c, plus(mul(cos(a), r), mul(sin(a), rr)))
        q = plus(c, plus(mul(cos(aa), r), mul(sin(aa), rr)))
        line(p, q)
        lastq = q
    return lastq

def angle(a, b, c):
    v = norm(vec(b, a))
    w = norm(vec(b, c))
    x = v[0]*w[0] + v[1]*w[1]
    return acos(x)

def halfquad(p, q, r, s, rho, d, t):
    b = rot(norm(vec(p, q)))    
    bb = rot(b)
    c = rot(norm(vec(r, s)))
    cc = mul(-1, rot(c))
    rr = (d-t)/2

    line(plus(p, mul(rho, b)), plus(q, mul(rho, b)))
    arc(q, mul(rho, b), -pi, 0)
    line(plus(q, mul(-rho, b)), plus(plus(q, mul(-rho, b)), mul(t, bb)))
    arc(plus(mul(t, bb), plus(q, mul(-(rho + rr), b))), mul(rr, b), 0, pi/2)
    arc(plus(q, mul(-(rho + rr), b)), mul((d+t)/2, b), pi/2, pi)
    arc(q, mul(-(rho+d), b), 0, pi - angle(p, q, r))
    
    u = rot(norm(vec(q, r)))
    line(plus(q, mul(-(rho+d), u)), plus(r, mul(-(rho+d), u)))
    arc(r, mul(-(rho+d), c), 0, -(pi - angle(q, r, s)))
    line(plus(r, mul(-rho, c)), plus(plus(r, mul(-rho,c)), mul(t, cc)))
    arc(plus(mul(t, cc), plus(r, mul(-(rho + rr), c))), mul(rr, c), -pi/2, 0)
    arc(plus(r, mul(-(rho + rr), c)), mul((d+t)/2, c), -pi, -pi/2)
    arc(r, mul(rho, c), 0, pi)

def sarok(p, q, r, rho, d, t):
    b = rot(norm(vec(p, q)))    
    bb = rot(b)
    rr = (d-t)/2

    line(plus(midpoint(p, q), mul(-rho, b)), plus(q, mul(rho, b)))
    arc(q, mul(rho, b), -pi, 0, 8)
    line(plus(q, mul(-rho, b)), plus(plus(q, mul(-rho, b)), mul(t, bb)))
    arc(plus(mul(t, bb), plus(q, mul(-(rho + rr), b))), mul(rr, b), 0, pi/2)
    arc(plus(q, mul(-(rho + rr), b)), mul((d+t)/2, b), pi/2, pi)
    L = l(vec(q, r)) / 2
    alpha = asin((d + 2*rho) / L)
    qq = arc(q, mul(-(rho+d), b), 0, pi - angle(p, q, r) + alpha)    
    line(qq, plus(midpoint(q,r), mul(-rho, rot(norm(vec(q, r))))))    

def face(vs, rho, d, t):
    for i in range(len(vs)):
        j = (i+1) % len(vs)
        k = (j+1) % len(vs)
        sarok(vs[i], vs[j], vs[k], rho, d, t)
    
def quad(p, q, r, s, rho, d, t):
    halfquad(p, q, r, s, rho, d, t)
    halfquad(r, s, p, q, rho, d, t)

def hex(a, b, c, d, e, f, rho, dd, t):
    halfquad(a, b, c, d, rho, dd, t)
    halfquad(c, d, e, f, rho, dd, t)
    halfquad(e, f, a, b, rho, dd, t)

def deltoidal_hexecontahedron(sc):
    a = 85.957*sc/100
    f = 95.863*sc/100
    e = sc
    p = [0,0]
    y = sqrt(a**2 - (f/2)**2)
    q = [f/2,y]
    r = [0,e]
    s = [-f/2,y]
    return (p,q,r,s) 

def rhombic_enneacontahedron_wide(edge):
    w = edge*sqrt(6)/3
    h = edge*sqrt(3)/3
    return([0,h],[-w,0],[0,-h],[w,0])

def rhombic_enneacontahedron_thin(edge):
    w = edge*(sqrt(15)+sqrt(3))/6
    h = edge*(sqrt(15)-sqrt(3))/6
    return([0,h],[-w,0],[0,-h],[w,0])

def rhombic_dodecahedron(s):
    w = s
    h = s * sqrt(2)
    return([0,h],[-w,0],[0,-h],[w,0])

def square(edge):
    s = edge/2
    return([s,s],[-s,s],[-s,-s],[s,-s])

def triangle(edge):
    s = edge/2
    return([s, 0], [0, s*sqrt(3)], [-s, 0])

def hexagon(edge):
    s = edge
    return([s,0],[s/2,s*sqrt(3)/2],[-s/2,s*sqrt(3)/2],[-s,0],[-s/2,-s*sqrt(3)/2],[s/2,-s*sqrt(3)/2])

def pentagon(edge):
    r = edge / 2 / sin(pi / 5)
    return[[r * sin(2 * i * pi / 5), r * cos(2 * i * pi / 5)] for i in range(5,0,-1)]

#p, q, r, s = deltoidal_hexecontahedron(50)
edge = 70
#p, q, r, s = rhombic_enneacontahedron_thin(edge)
#p, q, r, s = rhombic_enneacontahedron_wide(edge)

p, q, r, s = square(edge)
a, b, c, d, e, f = hexagon(edge)

rho = 0.5
dd = 18
t = 5

header()
#quad(p, q, r, s, rho, dd, t)
#hex(a, b, c, d, e, f, rho, dd, t)
#face(square(edge), rho, dd, t)
#face(triangle(edge), rho, dd, t)
face(pentagon(edge), rho, dd, t)
footer()
