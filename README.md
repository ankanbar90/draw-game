# 🎨 Real-Time Multiplayer Drawing Game (Skribbl Clone)

A full-stack, real-time multiplayer drawing and guessing game built with **React**, **Node.js**, and **Socket.io**. Players can join rooms, customize avatars, draw words, and chat live to guess what others are drawing!

🔗 **Live Demo:** [INSERT YOUR VERCEL APP LINK HERE]

---

## 📸 Screenshots

| Login & Avatar Builder | Gameplay & Chat | Mobile Responsive |
|:---:|:---:|:---:|
| ![Login Screen](<img width="1271" height="886" alt="Screenshot 2025-12-16 202135" src="https://github.com/user-attachments/assets/26637353-b5fa-4c0d-a2c9-4608b1b421f2" />
) | ![Gameplay](<img width="1906" height="883" alt="Screenshot 2025-12-16 202500" src="https://github.com/user-attachments/assets/30c1abb6-95df-4181-89b2-b0f65d3bcee6" />
) | ![Mobile](![WhatsApp Image 2025-12-17 at 12 50 59_ff172299](https://github.com/user-attachments/assets/a592c299-c8ce-460c-a090-108c0c1ee520)
) |

*(Note: Replace these placeholder links with actual screenshots of your game for a better portfolio look!)*

---

## 🚀 Features

* **Real-Time Drawing Sync:** Low-latency canvas synchronization using WebSockets.
* **Multiplayer Rooms:** Create or join specific rooms to play with friends.
* **Game Logic Engine:** Server-side state machine handling rounds, timers, and turn-switching.
* **Custom Tools:** Includes a **Flood Fill (Bucket)** algorithm built from scratch, brush sizes, and color palette.
* **Smart Scoring:** Faster guesses earn more points; drawer gets points if others guess correctly.
* **Mobile Support:** Fully optimized for touch devices with prevents scrolling while drawing.
* **Dynamic Chat:** System detects correct guesses, hides the answer from others, and announces winners.
* **AFK Handling:** Automatically skips turns if a player doesn't select a word in time.
* **Sound Effects:** Audio cues for ticking timer, success, round over, and failures.

---

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), HTML5 Canvas API, CSS3
* **Backend:** Node.js, Express.js
* **Real-Time Communication:** Socket.io
* **Deployment:** Vercel (Client) & Render (Server)

---

## ⚙️ Installation & Running Locally

Follow these steps to run the game on your own machine.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_USERNAME/draw-game.git](https://github.com/YOUR_USERNAME/draw-game.git)
cd draw-game
