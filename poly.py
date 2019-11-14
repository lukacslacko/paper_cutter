from math import cos, sin, atan, pi, asin, sqrt, tan

def line(P, Q):
    print(0)
    print('LINE')
    print(8)
    print('Polygon')
    print(10)
    print(P[0])
    print(20)
    print(P[1])
    print(11)
    print(Q[0])
    print(21)
    print(Q[1])

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

def arc(C, r, a, b, include_last=False):
    N = min(40, 4 + int(r*abs(a-b)/2))
    return [[C[0] + r * cos(a + (b-a)*i/N), C[1] + r * sin(a + (b-a)*i/N)] for i in range(N+1 if include_last else N)]

def end(d, alpha, g, w):
    pts = []
    pts += arc([0,0], d/2, pi, 0)
    rho = (d/2-g/2)/2
    z = rho + g/2
    pts += arc([z, 0], rho, 0, -pi)
    pts += arc([0,0], g/2, 0, pi)
    pts += arc([z, 0], rho + g, -pi, -pi/2)
    zz = d/2-z
    pts += arc([z, -rho-g-zz], zz, pi/2, 0, True)
    h = d/(2*tan(alpha/2))
    y = g/2*cos(alpha/2)
    R = d/2 / sin(alpha/2) + g/2
    beta = atan(d/2 / (h+y))
    delta = asin(d/2/(R+w))
    gamma = -pi/2+beta+alpha/2
    pts += arc([0,0], R, -pi/2+beta, gamma)
    pts += arc([(R+w/2)*cos(gamma), (R+w/2)*sin(gamma)], w/2, pi+gamma, gamma)
    pts += arc([0,0], R+w, gamma, -pi/2+delta, True)
    return pts

header()
v = end(16, 2*pi/5, 1, 8)
w = list(v)
for p in v:
    w.append([-p[0], -p[1]-100])

for i in range(len(w)):
    line(w[i], w[(i+1)%len(w)])
footer()
