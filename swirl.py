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

def swirl_angles(rho, alpha, beta, corner, center, inline=0):
    alpha_top = (pi - alpha) / 2
    alpha_bottom = (pi - beta) / 2
    a_top = (rho-inline) / tan(alpha / 2)
    a_bottom = (rho-inline) / tan(beta / 2)
    pts = [[rho-inline, -a_bottom]]
    pts += arc((0,0), rho-inline, -2*alpha_bottom, -2*pi+2*alpha_top)
    z = (rho - center/2)/2 + center/2
    y = rho-z
    P = (z*cos(2*alpha_top), z*sin(2*alpha_top))
    pts += arc(P, y-inline, 2*alpha_top, 2*alpha_top-pi)
    pts += arc((0,0), inline+center/2, 2*alpha_top, 2*alpha_top+pi) 
    delta = asin((y-corner)/(y+center+corner))
    gamma = 2*alpha_top - pi/2 + delta
    pts += arc(P, y+center+inline, 2*alpha_top-pi, gamma)
    Q = (P[0] + (y+center+corner)*cos(gamma), P[1] + (y+center+corner)*sin(gamma))
    pts += arc(Q, corner-inline, gamma+pi, 2*alpha_top, True)
    pts += [[rho-inline, a_top]]
    return pts

def half(a, alpha, beta, corner, center, inline=0, flip=False):
    rho = a / (1/tan(alpha/2) + 1/tan(beta/2))
    out_pts = swirl_angles(rho, alpha, beta, corner, center)
    dy = (out_pts[0][1] + out_pts[-1][1]) / 2
    for p in out_pts:
        p[0] -= rho
        p[1] -= dy
        if flip:
            p[0] *= -1
            p[1] *= -1
    for i in range(len(out_pts) - 1):
        line(out_pts[i], out_pts[i+1])
    if inline > 0:
        in_pts = swirl_angles(rho, alpha, beta, corner, center, inline)
        for p in in_pts:
            p[0] -= rho
            p[1] -= dy
            if flip:
                p[0] *= -1
                p[1] *= -1
        for i in range(len(in_pts)):
            line(in_pts[i], in_pts[(i+1)%len(in_pts)])
        
def edge(a, alpha_left, beta_left, alpha_right, beta_right, corner, center, inline=0):
    half(a, alpha_left, beta_left, corner, center, inline, False)
    half(a, alpha_right, beta_right, corner, center, inline, True)
    dashes = 10
    N = 2*dashes+1
    for i in range(1, N, 2):
        line((0, -a/2+i*a/N), (0, -a/2+(i+1)*a/N))

def angle(n):
    return pi - 2*pi/n

header()    
edge(60, angle(3), angle(3), angle(3), angle(3), 5, 1, 0)
footer()
