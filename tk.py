import tkinter as tk
import math

window = tk.Tk()

window.title('Kor')
canvas = tk.Canvas(window, width=600, height=600)

canvas.pack()
oval = {}
for i in range(12):
    oval[i] = canvas.create_oval(100, 100, 200, 200, fill='black')

def move(time=0):
    for i in range(12):
        r = 20 + 10 * math.sin((time/50 + i / 12) * math.pi*2)
        x = 200 + 150 * math.cos(i/12*math.pi*2)
        y = 200 + 150 * math.sin(i/12*math.pi*2)
        canvas.coords(oval[i], x - r, y - r, x + r, y + r)
    canvas.update()
    window.after(30, move, time+1)

window.after(0, move)
window.mainloop()

