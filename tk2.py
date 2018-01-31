import tkinter as tk
import random

window = tk.Tk()

window.title('Kor')

width = 1000
height = 1000
canvas = tk.Canvas(window, width=width, height=height)

canvas.pack()


class Buborek(object):
    def no(self):
        self.r += 0.02 * random.random()
        self.x += 4 * random.random() - 2
        self.y -= 1 + 2 * random.random()
        if self.y < 0:
            self.y = height
            self.r = 4
        if self.x < 0:
            self.x = width
        if self.x > width:
            self.x = 0
        canvas.coords(self.oval, self.x - self.r, self.y - self.r, self.x + self.r, self.y + self.r)
    
    def __init__(self):
        self.x = width * random.random()
        self.y = height * random.random()
        self.r = 5
        self.oval = canvas.create_oval(1,1,1,1)

buborek = {}

for i in range(200):
    buborek[i] = Buborek()

def move():
    for i in range(200):
        buborek[i].no()
    canvas.update()
    window.after(5, move)

window.after(0, move)
window.mainloop()

