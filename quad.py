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
    
def arc(c, r, st, en):
    num = 16
    rr = rot(r)
    for i in range(num):
        a = st + (i*(en-st))/num
        aa = st + ((i+1)*(en-st))/num
        p = plus(c, plus(mul(cos(a), r), mul(sin(a), rr)))
        q = plus(c, plus(mul(cos(aa), r), mul(sin(aa), rr)))
        line(p, q)

def angle(a, b, c):
    v = norm(vec(b, a))
    w = norm(vec(b, c))
    x = v[0]*w[0] + v[1]*w[1]
    return acos(x)

def halfquad(p, q, r, s, rho, d):
    b = rot(norm(vec(p, q)))    
    c = rot(norm(vec(r, s)))
    
    line(plus(p, mul(rho, b)), plus(q, mul(rho, b)))
    arc(q, mul(rho, b), -pi, 0)
    arc(plus(q, mul(-(rho + d/2), b)), mul(d/2, b), 0, pi)
    arc(q, mul(-(rho+d), b), 0, pi - angle(p, q, r))
    
    u = rot(norm(vec(q, r)))
    line(plus(q, mul(-(rho+d), u)), plus(r, mul(-(rho+d), u)))
    arc(r, mul(-(rho+d), c), 0, -(pi - angle(q, r, s)))
    arc(plus(r, mul(-(rho+d/2), c)), mul(d/2, c), -pi, 0)
    arc(r, mul(rho, c), 0, pi)
    
def quad(p, q, r, s, rho, d):
    halfquad(p, q, r, s, rho, d)
    halfquad(r, s, p, q, rho, d)

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

p, q, r, s = deltoidal_hexecontahedron(60)
rho = 1
d = 10

header()
line(p,q)
line(q,r)
line(r,s)
line(s,p)
quad(p, q, r, s, rho, d)
footer()
