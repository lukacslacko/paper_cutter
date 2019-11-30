from math import cos, sin, atan, acos, pi, asin, sqrt, tan

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
    if alpha <= 2*pi/4:
        pts += arc([z, 0], rho + g, -pi, -pi/2)
        zz = d/2-z
        pts += arc([z, -rho-g-zz], zz, pi/2, 0, True)
    else:
        pts += arc([z, 0], rho + g, -pi, -acos((d/2-z)/(rho+g)), True)
    h = d/(2*tan(alpha/2))
    y = g/2*cos(alpha/2)
    R = d/2 / sin(alpha/2)
    #if alpha <= 2*pi/4:
    #    R += g/2
    beta = asin(d/2 / R)
    delta = asin(d/2/(R+w))
    gamma = -pi/2+beta+alpha/3
    poc = arc([0,0], R, -pi/2+beta, gamma)
    poc += arc([(R+w/2)*cos(gamma), (R+w/2)*sin(gamma)], w/2, pi+gamma, gamma)
    poc += arc([0,0], R+w, gamma, -pi/2+delta, True)
    v = []
    poc.reverse()
    for p in poc:
        v.append([-p[0], p[1]])
    v += pts
    pts = list(v)
    return pts

def edge(a, d, w, g, alpha, beta):
    v = end(d, alpha, g, w)
    vv = end(d, beta, g, w)
    w = list(v)
    for p in vv:
        w.append([-p[0], -p[1]-a])
    for i in range(len(w)):
        line(w[i], w[(i+1)%len(w)])

def rot(p, alpha):
    return [p[0]*cos(alpha)-p[1]*sin(alpha), p[0]*sin(alpha)+p[1]*cos(alpha)]

def haromagu(a, d, w, g, alpha):
    vv = end(d, alpha, g, w)
    v = [[p[0], p[1]+a] for p in vv]
    pts = []
    pts += v
    pts.append([d/2, d*sqrt(3)/6])
    for p in v:
        pts.append(rot(p, -2*pi/3))
    pts.append([0, -d*sqrt(3)/3])
    for p in v:
        pts.append(rot(p, 2*pi/3))
    pts.append([-d/2, d*sqrt(3)/6])
    for i in range(len(pts)):
        line(pts[i], pts[(i+1)%len(pts)])

def pentakis_dodeca_long():
    v = end(18, 2*pi/6, 2, 6)
    w = list(v)
    for p in v:
        w.append([-p[0], -p[1]-185.41])

    for i in range(len(w)):
        line(w[i], w[(i+1)%len(w)])

def pentakis_dodeca_short():
    v = end(18, 2*pi/6, 2, 6)
    vv = end(18, 2*pi/5, 2, 6)
    w = list(v)
    for p in vv:
        w.append([-p[0], -p[1]-164.47])

    for i in range(len(w)):
        line(w[i], w[(i+1)%len(w)])

def rhombic_triaconta():
    edge(150, 18, 6, 1, 2*pi/3, 2*pi/5)

def jatI_short():
    haromagu(81.1, 40, 6, 1, 2*pi/4)
    #edge(81.1, 40, 6, 1, 2*pi/3, 2*pi/4)

def jatI_middle():
    edge(139.5, 40, 6, 1, 2*pi/4, 2*pi/5)

def jatI_long():
    edge(165, 40, 6, 1, 2*pi/4, 2*pi/6)

header()
jatI_short()
footer()
