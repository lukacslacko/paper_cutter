import tkinter as tk
import random

window = tk.Tk()
window.title('Mozgo kor')

v = tk.Canvas(window, height=400, width=400, bg='darkblue')
v.pack()

class Buborek(object):
    def __init__(self):
        self.x = 100
        self.y = 100
        self.oval = v.create_oval(self.x, self.y, 
                                  self.x + 25, self.y + 25,
                                  fill='blue', outline='white')

    def mozog(self):
        self.x += 1
        self.y += 1
        v.coords(self.oval, self.x, self.y, self.x + 25, self.y + 25)
        v.update()
        window.after(100, self.mozog)

buborek = Buborek()

window.after(100, buborek.mozog)
window.mainloop()
