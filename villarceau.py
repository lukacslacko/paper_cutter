from math import tan, atan, sin, cos, pi, asin, sqrt

R = 60
rho = 25
steps = 50
subdiv = 10
gap = 2

def gamma(beta):
    return atan(tan(beta)/cos(asin(rho/R)))

def d(beta, sign):
    g = gamma(beta)
    return sign*rho*cos(g) + sqrt(R*R - rho*rho*sin(g)*sin(g))

h = sqrt(R*R-rho*rho)

outside = []
inside = []
middle = []

outside.append([0,-h])
inside.append([0,-h])

for i in range(1-steps, steps):
    beta = (pi/2*i)/steps
    g = gamma(beta)
    d1 = d(beta, 1)
    d2 = d(beta, -1)
    outside.append([d1*cos(g), d1*sin(g)])
    inside.append([d2*cos(g), d2*sin(g)])
    middle.append([(d1+d2+gap)/2*cos(g), (d1+d2+gap)/2*sin(g)])

outside.append([0,h])
inside.append([0,h])

def line(p,q):
  x1 = p[0]
  y1 = p[1]
  x2 = q[0]
  y2 = q[1]
  print(0)
  print('LINE')
  print(8)
  print('Polygon')
  print(10)
  print(x1)
  print(20)
  print(y1)
  print(11)
  print(x2)
  print(21)
  print(y2)

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
for i in range(0, 2*steps):
    line(outside[i], outside[i+1])
    #line(inside[i], inside[i+1])
    if i > 0 and i % subdiv == 0:
        line(inside[i], middle[i-1])
footer()
