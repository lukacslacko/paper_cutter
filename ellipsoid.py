import scipy
import scipy.optimize
import scipy.spatial
import random
import numpy as np
import math

a = 1
b = 1
c = 2

def sq(x):
    return x*x

def surface(p):
    return sq(p[0]/a)+sq(p[1]/b)+sq(p[2]/c)-1


N = 35

points = [random.random() - 0.5 for i in range(3*N)]



def loss(points):
    tot = 0
    for a in range(N):
        for b in range(a+1, N):
            p = points[3*a:3*a+3]
            q = points[3*b:3*b+3]
            d = 0
            for i in range(3):
                d += sq(p[i]-q[i])
            tot += 1/d
    return tot

cons = ()
for i in range(N):
    cons += ({'type': 'ineq', 'fun': lambda x, i=i: -surface(x[3*i:3*i+3])},)

res = scipy.optimize.minimize(loss, points, constraints=cons, method='SLSQP')
#print(res)
pts = [res.x[3*i:3*i+3] for i in range(N)]
hull = scipy.spatial.ConvexHull(pts)
for s in hull.simplices:
    p = pts[s[0]]
    q = pts[s[1]]
    r = pts[s[2]]
    print(p[0], p[1], p[2])
    print(q[0], q[1], q[2])
    print(r[0], r[1], r[2])
    print(p[0], p[1], p[2])
    print(" ")
    print(" ")
