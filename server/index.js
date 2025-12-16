const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

// --- CONFIG ---
const TOTAL_ROUNDS = 3;
const TIME_TO_DRAW = 80; // <--- UPDATED TO 80 SECONDS
const TIME_TO_PICK = 15;
const WORD_LIST = [
  "apple",
  "banana",
  "car",
  "dog",
  "elephant",
  "fish",
  "guitar",
  "house",
  "ice cream",
  "jelly",
  "kite",
  "lion",
  "moon",
  "nest",
  "orange",
  "pencil",
  "queen",
  "robot",
  "sun",
  "tree",
  "umbrella",
  "van",
  "watch",
  "xylophone",
  "yacht",
  "zebra",
];

let rooms = {};

const getWordOptions = () => {
  const shuffled = WORD_LIST.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3);
};

const revealHint = (room) => {
  const game = rooms[room];
  if (!game || !game.currentWord) return;
  const unrevealedIndices = game.currentWord
    .split("")
    .map((char, index) => ({ char, index }))
    .filter(
      (item) => item.char !== " " && !game.revealedIndices.includes(item.index)
    )
    .map((item) => item.index);
  if (unrevealedIndices.length > 0) {
    const randomIndex =
      unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    game.revealedIndices.push(randomIndex);
    const hintString = game.currentWord
      .split("")
      .map((char, i) => {
        if (char === " ") return "  ";
        if (game.revealedIndices.includes(i)) return char + " ";
        return "_ ";
      })
      .join("");
    io.to(room).emit("hint_update", hintString);
  }
};

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // 1. JOIN ROOM
  socket.on("join_room", ({ room, username, avatar }) => {
    socket.join(room);
    if (!rooms[room]) {
      rooms[room] = {
        players: [],
        currentDrawerIndex: 0,
        currentRound: 1,
        timer: 0,
        timerInterval: null,
        gameState: "lobby",
        currentWord: "",
        revealedIndices: [],
        guessedCount: 0,
      };
    }
    rooms[room].players.push({
      id: socket.id,
      username,
      avatar,
      score: 0,
      hasGuessed: false,
    });
    io.to(room).emit("update_players", rooms[room].players);
    // Type: "join" for Green
    io.to(room).emit("receive_message", {
      author: "SYSTEM",
      message: `${username} joined the room!`,
      type: "join",
    });
  });

  // 2. DISCONNECT
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const playerIndex = room.players.findIndex((p) => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        io.to(roomId).emit("update_players", room.players);
        // Type: "leave" for Red
        io.to(roomId).emit("receive_message", {
          author: "SYSTEM",
          message: `${player.username} left the room.`,
          type: "leave",
        });
        if (room.players.length === 0) {
          clearInterval(room.timerInterval);
          delete rooms[roomId];
        }
        break;
      }
    }
  });

  // 3. START GAME
  socket.on("start_game", (room) => {
    if (rooms[room]) {
      rooms[room].gameState = "selecting_word";
      rooms[room].currentRound = 1;
      rooms[room].currentDrawerIndex = 0;
      startTurn(room);
    }
  });

  // 4. WORD SELECTION
  socket.on("word_selected", ({ room, word }) => {
    const game = rooms[room];
    if (!game) return;
    game.currentWord = word;
    game.gameState = "drawing";
    game.timer = TIME_TO_DRAW;
    game.guessedCount = 0;
    game.revealedIndices = [];
    game.players.forEach((p) => (p.hasGuessed = false));

    const initialHint = word
      .split("")
      .map((c) => (c === " " ? "  " : "_ "))
      .join("");
    io.to(room).emit("round_start", {
      timer: game.timer,
      currentWord: initialHint,
    });

    clearInterval(game.timerInterval);
    game.timerInterval = setInterval(() => {
      game.timer--;
      io.to(room).emit("timer_update", game.timer);
      if (game.currentWord.length > 2) {
        // Reveal hints at 75%, 50%, 25% time roughly
        if (game.timer === Math.floor(TIME_TO_DRAW * 0.75)) revealHint(room);
        if (game.timer === Math.floor(TIME_TO_DRAW * 0.5)) revealHint(room);
        if (game.timer === Math.floor(TIME_TO_DRAW * 0.25)) revealHint(room);
      }
      if (game.timer <= 0) endTurn(room);
    }, 1000);
  });

  // 5. CHAT & SCORING
  socket.on("send_message", (data) => {
    const game = rooms[data.room];
    if (!game) return;
    const guess = data.message.trim().toLowerCase();
    const actualWord = game.currentWord.trim().toLowerCase();
    const isCorrectGuess = game.gameState === "drawing" && guess === actualWord;

    if (isCorrectGuess) {
      const player = game.players.find((p) => p.id === socket.id);
      if (
        player &&
        !player.hasGuessed &&
        player.id !== game.players[game.currentDrawerIndex].id
      ) {
        player.hasGuessed = true;
        game.guessedCount++;
        const baseScore = Math.floor(game.timer * 10);
        const bonus = game.guessedCount === 1 ? 100 : 0;
        player.score += baseScore + bonus;

        // Type: "success" for Sound Trigger
        io.to(data.room).emit("receive_message", {
          ...data,
          author: "SYSTEM",
          message: `${data.author} guessed the word!`,
          type: "success",
        });
        io.to(data.room).emit("update_players", game.players);
        io.to(player.id).emit("hint_update", game.currentWord);
        if (game.guessedCount >= game.players.length - 1) endTurn(data.room);
      }
    } else {
      io.to(data.room).emit("receive_message", { ...data, type: "chat" });
    }
  });

  socket.on("draw_line", (data) =>
    socket.to(data.room).emit("draw_line", data)
  );
  socket.on("fill_canvas", (data) =>
    socket.to(data.room).emit("fill_canvas", data)
  );

  function startTurn(room) {
    const game = rooms[room];
    clearInterval(game.timerInterval);
    if (game.currentRound > TOTAL_ROUNDS) {
      game.gameState = "game_over";
      const winner = game.players.sort((a, b) => b.score - a.score)[0];
      io.to(room).emit("game_over", winner);
      return;
    }
    const drawer = game.players[game.currentDrawerIndex];
    game.gameState = "selecting_word";
    game.timer = TIME_TO_PICK;
    const words = getWordOptions();
    io.to(room).emit("choose_word", {
      drawer: drawer.username,
      drawerId: drawer.id,
    });
    io.to(drawer.id).emit("your_turn_to_pick", words);
    game.timerInterval = setInterval(() => {
      game.timer--;
      io.to(room).emit("timer_update", game.timer);
      if (game.timer <= 0) {
        clearInterval(game.timerInterval);
        endTurn(room);
      }
    }, 1000);
  }

  function endTurn(room) {
    const game = rooms[room];
    clearInterval(game.timerInterval);
    const drawer = game.players[game.currentDrawerIndex];
    if (game.guessedCount > 0) drawer.score += game.guessedCount * 50;

    io.to(room).emit("update_players", game.players);
    // Send detailed stats for the Round Summary
    io.to(room).emit("round_end", {
      word: game.currentWord,
      guessedCount: game.guessedCount,
    });

    setTimeout(() => {
      game.currentDrawerIndex++;
      if (game.currentDrawerIndex >= game.players.length) {
        game.currentDrawerIndex = 0;
        game.currentRound++;
      }
      startTurn(room);
    }, 8000); // Show summary for 8 seconds
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));
