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
    N = 40
    return [(C[0] + r * cos(a + (b-a)*i/N), C[1] + r * sin(a + (b-a)*i/N)) for i in range(N+1 if include_last else N)]

def swirl(a, n, r, g, flip=False):
    alpha = pi/n
    rho = a/2 / tan(alpha)
    pts = [(rho, -a/2)]
    pts += arc((0,0), rho, -2*alpha, -2*pi+2*alpha)
    z = (rho - g/2)/2 + g/2
    y = rho-z
    P = (z*cos(2*alpha), z*sin(2*alpha))
    pts += arc(P, y, 2*alpha, 2*alpha-pi)
    pts += arc((0,0), g/2, 2*alpha, 2*alpha+pi) 
    beta = asin((y-r)/(y+g+r))
    gamma = 2*alpha - pi/2 + beta
    pts += arc(P, y+g, 2*alpha-pi, gamma)
    Q = (P[0] + (y+g+r)*cos(gamma), P[1] + (y+g+r)*sin(gamma))
    pts += arc(Q, r, gamma+pi, 2*alpha, True)
    w = [(v[0]-rho, v[1]) for v in pts]
    if flip:
        w = [(-v[0], -v[1]) for v in w]
    return w

def edge(a, n1, n2, r, g):
    pts = swirl(a, n1, r, g)
    pts += swirl(a, n2, r, g, True)
    pts += [pts[0]]
    dashes = 10
    N = 2*dashes+1
    for i in range(1, N, 2):
        line((0, -a/2+i*a/N), (0, -a/2+(i+1)*a/N))
    for i in range(len(pts)-1):
        line(pts[i], pts[i+1])

header()    
edge(100, 3, 4, 10, 2)
footer()
