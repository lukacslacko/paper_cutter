# http://dmccooey.com/polyhedra/TruncatedIcosahedron.txt
# https://levskaya.github.io/polyhedronisme/?recipe=jatI

from math import sqrt

C0 = (1 + sqrt(5)) / 4
C1 = (1 + sqrt(5)) / 2
C2 = (5 + sqrt(5)) / 4
C3 = (2 + sqrt(5)) / 2
C4 = 3 * (1 + sqrt(5)) / 4

V0  = [ 0.5,  0.0,   C4]
V1  = [ 0.5,  0.0,  -C4]
V2  = [-0.5,  0.0,   C4]
V3  = [-0.5,  0.0,  -C4]
V4  = [  C4,  0.5,  0.0]
V5  = [  C4, -0.5,  0.0]
V6  = [ -C4,  0.5,  0.0]
V7  = [ -C4, -0.5,  0.0]
V8  = [ 0.0,   C4,  0.5]
V9  = [ 0.0,   C4, -0.5]
V10 = [ 0.0,  -C4,  0.5]
V11 = [ 0.0,  -C4, -0.5]
V12 = [ 1.0,   C0,   C3]
V13 = [ 1.0,   C0,  -C3]
V14 = [ 1.0,  -C0,   C3]
V15 = [ 1.0,  -C0,  -C3]
V16 = [-1.0,   C0,   C3]
V17 = [-1.0,   C0,  -C3]
V18 = [-1.0,  -C0,   C3]
V19 = [-1.0,  -C0,  -C3]
V20 = [  C3,  1.0,   C0]
V21 = [  C3,  1.0,  -C0]
V22 = [  C3, -1.0,   C0]
V23 = [  C3, -1.0,  -C0]
V24 = [ -C3,  1.0,   C0]
V25 = [ -C3,  1.0,  -C0]
V26 = [ -C3, -1.0,   C0]
V27 = [ -C3, -1.0,  -C0]
V28 = [  C0,   C3,  1.0]
V29 = [  C0,   C3, -1.0]
V30 = [  C0,  -C3,  1.0]
V31 = [  C0,  -C3, -1.0]
V32 = [ -C0,   C3,  1.0]
V33 = [ -C0,   C3, -1.0]
V34 = [ -C0,  -C3,  1.0]
V35 = [ -C0,  -C3, -1.0]
V36 = [ 0.5,   C1,   C2]
V37 = [ 0.5,   C1,  -C2]
V38 = [ 0.5,  -C1,   C2]
V39 = [ 0.5,  -C1,  -C2]
V40 = [-0.5,   C1,   C2]
V41 = [-0.5,   C1,  -C2]
V42 = [-0.5,  -C1,   C2]
V43 = [-0.5,  -C1,  -C2]
V44 = [  C2,  0.5,   C1]
V45 = [  C2,  0.5,  -C1]
V46 = [  C2, -0.5,   C1]
V47 = [  C2, -0.5,  -C1]
V48 = [ -C2,  0.5,   C1]
V49 = [ -C2,  0.5,  -C1]
V50 = [ -C2, -0.5,   C1]
V51 = [ -C2, -0.5,  -C1]
V52 = [  C1,   C2,  0.5]
V53 = [  C1,   C2, -0.5]
V54 = [  C1,  -C2,  0.5]
V55 = [  C1,  -C2, -0.5]
V56 = [ -C1,   C2,  0.5]
V57 = [ -C1,   C2, -0.5]
V58 = [ -C1,  -C2,  0.5]
V59 = [ -C1,  -C2, -0.5]

def l(p):
    return sqrt(sum([p[i]*p[i] for i in [0,1,2]]))

def d(p,q):
    return l([p[i]-q[i] for i in [0,1,2]])

def proj(p, R):
    return [p[i]/l(p)*R for i in [0,1,2]]

R = l(V0)

def mid(pts):
    return [sum([p[i] for p in pts])/len(pts) for i in [0,1,2]]

elfelezo = proj(mid([V0,V2]), R)
felelhossz = d(V0, elfelezo)

# {  0,  2, 18, 42, 38, 14 }

hatszogkozep = proj(mid([V0,V2,V18,V42,V38,V14]),R)
hatszogsugar = d(hatszogkozep, V0)

# {  0, 14, 46, 44, 12 }

otszogkozep = proj(mid([V0,V14,V46,V44,V12]),R)
otszogsugar = d(otszogkozep, V0)

r = 400
print(felelhossz*r/R)
print(otszogsugar*r/R)
print(hatszogsugar*r/R)
