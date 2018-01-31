import tkinter as tk
import random

window = tk.Tk()
window.title('Mozgo kor')

v = tk.Canvas(window, height=400, width=400)
v.pack()

class Buborek(object):
    def __init__(self):
        self.x = 100
        self.y = 100
        self.oval = v.create_oval(self.x, self.y, self.x + 25, self.y + 25, fill='red')

buborek = Buborek()

window.mainloop()
