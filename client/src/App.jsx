// client/src/App.jsx
import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import "./App.css";

// ASSETS & SOUNDS
import eye1 from "./assets/eyes/eyes1.png";
import eye2 from "./assets/eyes/eyes2.png";
import eye3 from "./assets/eyes/eyes3.png";
import eye4 from "./assets/eyes/eyes4.png";
import eye5 from "./assets/eyes/eyes5.png";
import eye6 from "./assets/eyes/eyes6.png";
import eye7 from "./assets/eyes/eyes7.png";
import mouth1 from "./assets/mouths/mouth1.png";
import mouth2 from "./assets/mouths/mouth2.png";
import mouth3 from "./assets/mouths/mouth3.png";
import mouth4 from "./assets/mouths/mouth4.png";
import mouth5 from "./assets/mouths/mouth5.png";
import mouth6 from "./assets/mouths/mouth6.png";

import sndTik from "./assets/sounds/tiktik.mp3";
import sndSuccess from "./assets/sounds/success.mp3";
import sndFail from "./assets/sounds/fail.mp3";
import sndRoundOver from "./assets/sounds/round_over.mp3";

const EYES_OPTIONS = [eye1, eye2, eye3, eye4, eye5, eye6, eye7];
const MOUTH_OPTIONS = [mouth1, mouth2, mouth3, mouth4, mouth5, mouth6];
const BODY_COLORS = [
  "#FFC0CB",
  "#FFD700",
  "#87CEEB",
  "#98FB98",
  "#DDA0DD",
  "#FFA500",
  "#F08080",
  "#FFFFFF",
];
const COLORS = [
  "#000000",
  "#FFFFFF",
  "#7f7f7f",
  "#c3c3c3",
  "#880015",
  "#b97a57",
  "#ed1c24",
  "#ffaec9",
  "#ff7f27",
  "#ffc90e",
  "#fff200",
  "#efe4b0",
  "#22b14c",
  "#b5e61d",
  "#00a2e8",
  "#99d9ea",
  "#3f48cc",
  "#7092be",
  "#a349a4",
  "#c8bfe7",
];

const socket = io.connect(
  import.meta.env.VITE_SERVER_URL || "http://localhost:3001"
);

const Avatar = ({ config, size = "60px" }) => (
  <div
    className="avatar-preview"
    style={{
      width: size,
      height: size,
      backgroundColor: config.color,
      position: "relative",
      overflow: "hidden",
      borderRadius: "50%",
      border: "3px solid #000",
    }}
  >
    <img
      src={config.eyes}
      className="avatar-layer"
      style={{ top: "25%", width: "85%" }}
    />
    <img
      src={config.mouth}
      className="avatar-layer"
      style={{ top: "65%", width: "60%" }}
    />
  </div>
);

const Footer = () => (
  <div className="footer-container">
    <div className="info-box how-to-play creative-box">
      <h3>❓ How to Play</h3>
      <ul>
        <li>
          <strong>Draw:</strong> Choose a word...
        </li>
        <li>
          <strong>Guess:</strong> Type guesses...
        </li>
        <li>
          <strong>Win:</strong> Score points!
        </li>
      </ul>
    </div>
    <div className="info-box about-section creative-box">
      <h3>🎨 About</h3>
      <p>Custom built drawing game with React & Socket.io.</p>
      <small>Created by You</small>
    </div>
  </div>
);

function App() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  // Audio Refs
  const audioTik = useRef(new Audio(sndTik));
  const audioSuccess = useRef(new Audio(sndSuccess));
  const audioFail = useRef(new Audio(sndFail));
  const audioRoundOver = useRef(new Audio(sndRoundOver));

  const [gameState, setGameState] = useState("login");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [myAvatar, setMyAvatar] = useState({
    color: BODY_COLORS[0],
    eyes: EYES_OPTIONS[0],
    mouth: MOUTH_OPTIONS[0],
  });
  const [players, setPlayers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [currentWord, setCurrentWord] = useState("");
  const [drawerName, setDrawerName] = useState("");
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [wordOptions, setWordOptions] = useState([]);
  const [winner, setWinner] = useState(null);

  const [overlayMessage, setOverlayMessage] = useState("");
  const [showRoundSummary, setShowRoundSummary] = useState(false);
  const [roundResults, setRoundResults] = useState({
    word: "",
    guessedCount: 0,
  });

  // NEW: Skipped Turn Message
  const [skippedMessage, setSkippedMessage] = useState(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState("pen");
  const [chat, setChat] = useState([]);
  const [msg, setMsg] = useState("");

  const floodFill = (startX, startY, newColorHex) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const r = parseInt(newColorHex.slice(1, 3), 16);
    const g = parseInt(newColorHex.slice(3, 5), 16);
    const b = parseInt(newColorHex.slice(5, 7), 16);
    const a = 255;
    const startPos = (startY * width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    if (startR === r && startG === g && startB === b && startA === a) return;
    const stack = [[startX, startY]];
    const matchStartColor = (pos) =>
      data[pos] === startR &&
      data[pos + 1] === startG &&
      data[pos + 2] === startB &&
      data[pos + 3] === startA;
    const colorPixel = (pos) => {
      data[pos] = r;
      data[pos + 1] = g;
      data[pos + 2] = b;
      data[pos + 3] = a;
    };
    while (stack.length) {
      let [x, y] = stack.pop();
      let pixelPos = (y * width + x) * 4;
      while (y >= 0 && matchStartColor(pixelPos)) {
        y--;
        pixelPos -= width * 4;
      }
      pixelPos += width * 4;
      y++;
      let reachLeft = false;
      let reachRight = false;
      while (y < height && matchStartColor(pixelPos)) {
        colorPixel(pixelPos);
        if (x > 0) {
          if (matchStartColor(pixelPos - 4)) {
            if (!reachLeft) {
              stack.push([x - 1, y]);
              reachLeft = true;
            }
          } else if (reachLeft) reachLeft = false;
        }
        if (x < width - 1) {
          if (matchStartColor(pixelPos + 4)) {
            if (!reachRight) {
              stack.push([x + 1, y]);
              reachRight = true;
            }
          } else if (reachRight) reachRight = false;
        }
        y++;
        pixelPos += width * 4;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  };

  useEffect(() => {
    socket.on("update_players", (data) => setPlayers(data));

    socket.on("current_state_sync", (data) => {
      setGameState("game");
      setTimer(data.timer);
      setCurrentWord(data.hint);
    });

    socket.on("choose_word", (data) => {
      setGameState("game");
      setShowRoundSummary(false);
      setOverlayMessage("");
      setSkippedMessage(null);
      setDrawerName(data.drawer);
      setIsMyTurn(data.drawerId === socket.id);
      setOverlayMessage(`${data.drawer} is choosing a word...`);
      setWordOptions([]);
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 800, 600);
      }
    });

    socket.on("your_turn_to_pick", (words) => setWordOptions(words));

    socket.on("round_start", ({ currentWord }) => {
      setWordOptions([]);
      setOverlayMessage("");
      setCurrentWord(currentWord);
      setShowRoundSummary(false);
      setSkippedMessage(null);
      const ctx = ctxRef.current;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 800, 600);
      }
    });

    // --- TIMER & SOUNDS ---
    socket.on("timer_update", (time) => {
      setTimer(time);
      // Play tick sound at 15s (End of drawing) AND 5s (End of picking)
      if (time === 15 || time === 5) {
        audioTik.current.currentTime = 0;
        audioTik.current.play().catch((e) => console.log(e));
      }
    });

    // --- SKIPPED TURN / DRAWER LEFT ---
    socket.on("turn_skipped", (data) => {
      // Stop the ticking
      audioTik.current.pause();
      audioTik.current.currentTime = 0;

      // Play fail sound
      audioFail.current.play().catch((e) => console.log(e));

      setOverlayMessage("");
      setWordOptions([]);

      // Check if it's a "Left Game" reason or "Timeout" reason
      if (data.reason) {
        setSkippedMessage(`${data.username} ${data.reason}`); // "Ankan left the game!"
      } else {
        setSkippedMessage(`${data.username} didn't pick! -50 Points`); // Default timeout
      }
    });

    socket.on("draw_line", (data) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const prevColor = ctx.strokeStyle;
      const prevWidth = ctx.lineWidth;
      ctx.strokeStyle = data.color;
      ctx.lineWidth = data.width;
      if (data.type === "start") {
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
      } else if (data.type === "draw") {
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
      } else if (data.type === "end") {
        ctx.closePath();
      } else if (data.type === "clear") {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 800, 600);
      }
      ctx.strokeStyle = prevColor;
      ctx.lineWidth = prevWidth;
    });

    socket.on("fill_canvas", ({ x, y, color }) => {
      floodFill(x, y, color);
    });

    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
      if (data.type === "success") {
        audioSuccess.current.currentTime = 0;
        audioSuccess.current.play().catch((e) => console.log(e));
      }
    });

    socket.on("round_end", ({ word, guessedCount }) => {
      audioTik.current.pause();
      audioTik.current.currentTime = 0;
      setRoundResults({ word, guessedCount });
      setShowRoundSummary(true);
      if (guessedCount === 0) {
        audioFail.current.play().catch((e) => console.log(e));
      } else {
        audioRoundOver.current.play().catch((e) => console.log(e));
      }
    });

    socket.on("game_over", (winner) => {
      setGameState("game_over");
      setWinner(winner);
    });
    socket.on("hint_update", (newHint) => setCurrentWord(newHint));

    return () => socket.off();
  }, []);

  const cycleOption = (current, options, direction) => {
    const idx = options.indexOf(current);
    if (direction === "next")
      return options[idx === options.length - 1 ? 0 : idx + 1];
    else return options[idx === 0 ? options.length - 1 : idx - 1];
  };
  const updateAvatar = (part, direction) => {
    if (part === "color")
      setMyAvatar({
        ...myAvatar,
        color: cycleOption(myAvatar.color, BODY_COLORS, direction),
      });
    if (part === "eyes")
      setMyAvatar({
        ...myAvatar,
        eyes: cycleOption(myAvatar.eyes, EYES_OPTIONS, direction),
      });
    if (part === "mouth")
      setMyAvatar({
        ...myAvatar,
        mouth: cycleOption(myAvatar.mouth, MOUTH_OPTIONS, direction),
      });
  };

  useEffect(() => {
    if (gameState === "game" || gameState === "lobby") {
      setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = 800;
          canvas.height = 600;
          const ctx = canvas.getContext("2d");
          ctx.lineCap = "round";
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctxRef.current = ctx;
        }
      }, 100);
    }
  }, [gameState]);

  const joinGame = () => {
    socket.emit("join_room", { room, username, avatar: myAvatar });
    setGameState("lobby");
  };
  const startGame = () => socket.emit("start_game", room);
  const selectWord = (word) => {
    setCurrentWord(word);
    setWordOptions([]);
    socket.emit("word_selected", { room, word });
  };
  const sendMessage = () => {
    if (!msg.trim()) return;
    socket.emit("send_message", { room, message: msg, author: username });
    setMsg("");
  };
  const leaveGame = () => {
    window.location.reload();
  };

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (event.nativeEvent.type.startsWith("touch")) {
      const touch =
        event.nativeEvent.touches[0] || event.nativeEvent.changedTouches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (event) => {
    if (!isMyTurn) return;
    const { x, y } = getCoordinates(event);
    if (tool === "bucket") {
      const MathX = Math.floor(x);
      const MathY = Math.floor(y);
      floodFill(MathX, MathY, color);
      socket.emit("fill_canvas", { room, x: MathX, y: MathY, color });
      return;
    }
    ctxRef.current.strokeStyle = color;
    ctxRef.current.lineWidth = lineWidth;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(x, y);
    setIsDrawing(true);
    socket.emit("draw_line", {
      room,
      x,
      y,
      type: "start",
      color,
      width: lineWidth,
    });
  };
  const draw = (event) => {
    if (!isDrawing || !isMyTurn || tool === "bucket") return;
    const { x, y } = getCoordinates(event);
    ctxRef.current.lineTo(x, y);
    ctxRef.current.stroke();
    socket.emit("draw_line", {
      room,
      x,
      y,
      type: "draw",
      color,
      width: lineWidth,
    });
  };
  const stopDrawing = () => {
    if (!isDrawing) return;
    ctxRef.current.closePath();
    setIsDrawing(false);
    socket.emit("draw_line", {
      room,
      x: 0,
      y: 0,
      type: "end",
      color,
      width: lineWidth,
    });
  };
  const clearBoard = () => {
    const ctx = ctxRef.current;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 800, 600);
    socket.emit("draw_line", { room, x: 0, y: 0, type: "clear" });
  };

  return (
    <div className="App">
      {gameState === "login" && (
        <div className="login-wrapper">
          <h1 className="game-title-big">
            <span style={{ color: "red" }}>D</span>
            <span style={{ color: "orange" }}>R</span>
            <span style={{ color: "gold" }}>A</span>
            <span style={{ color: "green" }}>W</span>
            <span>&nbsp;</span>
            <span style={{ color: "cyan" }}>G</span>
            <span style={{ color: "blue" }}>A</span>
            <span style={{ color: "purple" }}>M</span>
            <span style={{ color: "pink" }}>E</span>
          </h1>
          <div className="login-box creative-box">
            <div className="avatar-builder">
              <Avatar config={myAvatar} size="100px" />
              <div className="controls">
                <div className="row">
                  <span>Color</span>
                  <button onClick={() => updateAvatar("color", "prev")}>
                    ◀
                  </button>
                  <button onClick={() => updateAvatar("color", "next")}>
                    ▶
                  </button>
                </div>
                <div className="row">
                  <span>Eyes</span>
                  <button onClick={() => updateAvatar("eyes", "prev")}>
                    ◀
                  </button>
                  <button onClick={() => updateAvatar("eyes", "next")}>
                    ▶
                  </button>
                </div>
                <div className="row">
                  <span>Mouth</span>
                  <button onClick={() => updateAvatar("mouth", "prev")}>
                    ◀
                  </button>
                  <button onClick={() => updateAvatar("mouth", "next")}>
                    ▶
                  </button>
                </div>
              </div>
            </div>
            <input
              placeholder="Enter Name"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              placeholder="Room ID"
              onChange={(e) => setRoom(e.target.value)}
            />
            <button className="play-btn" onClick={joinGame}>
              PLAY!
            </button>
          </div>
          <Footer />
        </div>
      )}
      {gameState === "lobby" && (
        <div className="lobby creative-box">
          <div className="lobby-header">
            <h2>Lobby</h2>
            <button className="exit-btn" onClick={leaveGame}>
              Exit
            </button>
          </div>
          <div className="lobby-avatars">
            {players.map((p) => (
              <div key={p.id} className="lobby-player">
                <Avatar config={p.avatar} size="50px" />
                <div>{p.username}</div>
              </div>
            ))}
          </div>
          <button className="play-btn" onClick={startGame}>
            START GAME
          </button>
        </div>
      )}

      {gameState === "game" && (
        <div className="game-container creative-box">
          <div className="sidebar">
            <h3>Players</h3>
            {players
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <div
                  className={`player ${p.hasGuessed ? "correct" : ""}`}
                  key={p.id}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span>#{i + 1}</span>
                    <Avatar config={p.avatar} size="40px" />
                    <span>{p.username}</span>
                  </div>
                  <span>{p.score}</span>
                  {p.username === drawerName && " ✏️"}
                </div>
              ))}
          </div>
          <div className="board-area">
            <div className="top-bar">
              <div className="timer">⏳ {timer}s</div>
              <div className="word-display">
                {isMyTurn ? currentWord : currentWord.split("").join(" ")}
              </div>
              <button className="exit-btn-small" onClick={leaveGame}>
                EXIT
              </button>
            </div>
            <div className="canvas-wrapper">
              {overlayMessage && !showRoundSummary && !skippedMessage && (
                <div className="overlay">
                  <h2>{overlayMessage}</h2>
                </div>
              )}
              {wordOptions.length > 0 && (
                <div className="overlay word-pick">
                  <h2>Choose a word!</h2>
                  {wordOptions.map((w) => (
                    <button key={w} onClick={() => selectWord(w)}>
                      {w}
                    </button>
                  ))}
                </div>
              )}

              {/* --- SKIPPED TURN MESSAGE --- */}
              {skippedMessage && (
                <div
                  className="overlay"
                  style={{ background: "rgba(100,0,0,0.85)" }}
                >
                  <h2 style={{ color: "#ff6b6b", fontSize: "30px" }}>
                    Turn Skipped!
                  </h2>
                  <p style={{ fontSize: "24px", color: "white" }}>
                    {skippedMessage}
                  </p>
                </div>
              )}

              {showRoundSummary && (
                <div className="overlay round-summary">
                  <h2>Round Over!</h2>
                  <p className="revealed-word">
                    The word was: <span>{roundResults.word}</span>
                  </p>
                  <div className="round-scores">
                    {players
                      .sort((a, b) => b.score - a.score)
                      .map((p, i) => (
                        <div key={p.id} className="score-row">
                          <span className="rank">#{i + 1}</span>
                          <span className="name">{p.username}</span>
                          <span className="score">
                            +{p.hasGuessed ? "100+" : "0"} ({p.score})
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                style={{ cursor: tool === "bucket" ? "cell" : "crosshair" }}
              />
            </div>
          </div>
          <div className="right-panel">
            {isMyTurn ? (
              <div className="toolbar-container">
                <div className="color-palette">
                  {COLORS.map((c) => (
                    <div
                      key={c}
                      className={`color-swatch ${color === c ? "active" : ""}`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setColor(c);
                        setTool("pen");
                      }}
                    />
                  ))}
                  <div
                    className="color-input-wrapper"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginLeft: "5px",
                    }}
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        setColor(e.target.value);
                        setTool("pen");
                      }}
                      style={{
                        width: "28px",
                        height: "28px",
                        padding: 0,
                        border: "none",
                        cursor: "pointer",
                      }}
                    />
                  </div>
                </div>
                <div className="brush-sizes">
                  <div
                    className={`size-dot s ${lineWidth === 5 ? "active" : ""}`}
                    onClick={() => setLineWidth(5)}
                  ></div>
                  <div
                    className={`size-dot m ${lineWidth === 10 ? "active" : ""}`}
                    onClick={() => setLineWidth(10)}
                  ></div>
                  <div
                    className={`size-dot l ${lineWidth === 20 ? "active" : ""}`}
                    onClick={() => setLineWidth(20)}
                  ></div>
                </div>
                <div className="tools-row">
                  <button
                    className={tool === "bucket" ? "active-tool" : ""}
                    onClick={() => setTool("bucket")}
                  >
                    🪣 Fill
                  </button>
                  <button
                    onClick={() => {
                      setColor("#FFFFFF");
                      setTool("pen");
                    }}
                  >
                    Eraser
                  </button>
                </div>
                <div className="tools-row">
                  <button onClick={clearBoard} style={{ color: "red" }}>
                    🗑️ Clear
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="toolbar-container"
                style={{ justifyContent: "center", height: "50px" }}
              >
                <b>Guess the Word!</b>
              </div>
            )}
            <div className="chat">
              <div className="chat-messages">
                {chat.map((c, i) => (
                  <div
                    key={i}
                    className={`
                            ${c.type === "join" ? "sys-msg-join" : ""} 
                            ${c.type === "leave" ? "sys-msg-leave" : ""} 
                            ${c.type === "success" ? "sys-msg-success" : ""} 
                            ${c.author === "SYSTEM" && !c.type ? "sys-msg" : ""}
                        `}
                  >
                    {c.author === "SYSTEM" ? (
                      <b>{c.message}</b>
                    ) : (
                      <span>
                        <b>{c.author}: </b>
                        {c.message}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              <div className="chat-input-area">
                <input
                  placeholder="Type here..."
                  value={msg}
                  onChange={(e) => setMsg(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <button onClick={sendMessage} className="send-btn">
                  ➤
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {gameState === "game_over" && (
        <div className="game-over creative-box">
          <h1>GAME OVER!</h1>
          <h2>Winner: {winner?.username}</h2>
          <h3>Score: {winner?.score}</h3>
          <button className="play-btn" onClick={() => window.location.reload()}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
