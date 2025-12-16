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

const TOTAL_ROUNDS = 3;
const TIME_TO_DRAW = 80;
const TIME_TO_PICK = 15;
// server/index.js

const WORD_LIST = [
  // --- ANIMALS & CREATURES ---
  "alligator",
  "alpaca",
  "anteater",
  "armadillo",
  "baboon",
  "badger",
  "bat",
  "beaver",
  "bison",
  "buffalo",
  "camel",
  "chameleon",
  "cheetah",
  "chimpanzee",
  "cobra",
  "coral",
  "crab",
  "cricket",
  "crocodile",
  "dinosaur",
  "dolphin",
  "dragon",
  "dragonfly",
  "duck",
  "eagle",
  "eel",
  "elephant",
  "flamingo",
  "fox",
  "frog",
  "giraffe",
  "gorilla",
  "grasshopper",
  "hamster",
  "hedgehog",
  "hippo",
  "hummingbird",
  "hyena",
  "iguana",
  "jellyfish",
  "kangaroo",
  "koala",
  "ladybug",
  "lemur",
  "leopard",
  "lion",
  "llama",
  "lobster",
  "meerkat",
  "mosquito",
  "mouse",
  "narwhal",
  "octopus",
  "ostrich",
  "otter",
  "owl",
  "panda",
  "panther",
  "parrot",
  "peacock",
  "pelican",
  "penguin",
  "platypus",
  "porcupine",
  "raccoon",
  "rhino",
  "scorpion",
  "seahorse",
  "seal",
  "shark",
  "sheep",
  "skunk",
  "sloth",
  "snail",
  "snake",
  "spider",
  "squirrel",
  "starfish",
  "stork",
  "swan",
  "tiger",
  "toad",
  "toucan",
  "turkey",
  "turtle",
  "unicorn",
  "vulture",
  "walrus",
  "wasp",
  "whale",
  "wolf",
  "wombat",
  "worm",
  "zebra",
  "zombie",
  "vampire",
  "werewolf",
  "alien",
  "robot",
  "mummy",

  // --- FOOD & DRINK ---
  "avocado",
  "bacon",
  "bagel",
  "banana",
  "bbq",
  "beans",
  "beer",
  "biscuit",
  "blueberry",
  "bread",
  "broccoli",
  "burrito",
  "cake",
  "candy",
  "carrot",
  "cheese",
  "cherry",
  "chicken",
  "chocolate",
  "coconut",
  "coffee",
  "cookie",
  "corn",
  "croissant",
  "cupcake",
  "donut",
  "egg",
  "eggplant",
  "fries",
  "grapes",
  "hamburger",
  "honey",
  "hotdog",
  "ice cream",
  "ketchup",
  "kiwi",
  "lasagna",
  "lemon",
  "lettuce",
  "lobster",
  "lollipop",
  "mango",
  "marshmallow",
  "milk",
  "mushroom",
  "mustard",
  "nachos",
  "noodle",
  "onion",
  "pancake",
  "pasta",
  "peach",
  "peanut",
  "pear",
  "pepper",
  "pickle",
  "pie",
  "pineapple",
  "pizza",
  "popcorn",
  "potato",
  "pretzel",
  "pumpkin",
  "radish",
  "rice",
  "sandwich",
  "sausage",
  "smoothie",
  "soup",
  "spaghetti",
  "spinach",
  "steak",
  "strawberry",
  "sushi",
  "taco",
  "toast",
  "tomato",
  "waffle",
  "watermelon",
  "yogurt",

  // --- OBJECTS & ITEMS ---
  "accordion",
  "airplane",
  "alarm clock",
  "anchor",
  "anvil",
  "backpack",
  "balloon",
  "bandage",
  "banjo",
  "basket",
  "battery",
  "bed",
  "bell",
  "bicycle",
  "binoculars",
  "blender",
  "book",
  "boomerang",
  "bottle",
  "bowtie",
  "brick",
  "bridge",
  "broom",
  "brush",
  "bucket",
  "bus",
  "button",
  "cactus",
  "calculator",
  "calendar",
  "camera",
  "candle",
  "cannon",
  "car",
  "carpet",
  "castle",
  "catapult",
  "chair",
  "chandelier",
  "chess",
  "chimney",
  "clock",
  "cloud",
  "compass",
  "computer",
  "couch",
  "crayon",
  "crown",
  "diamond",
  "dice",
  "door",
  "drum",
  "dynamite",
  "ear",
  "earth",
  "envelope",
  "eraser",
  "eye",
  "fan",
  "feather",
  "fence",
  "fire",
  "flashlight",
  "flower",
  "flute",
  "fork",
  "fridge",
  "ghost",
  "glasses",
  "glove",
  "glue",
  "guitar",
  "hammer",
  "hat",
  "headphones",
  "heart",
  "helicopter",
  "helmet",
  "hook",
  "hourglass",
  "house",
  "key",
  "kite",
  "knife",
  "ladder",
  "lamp",
  "laptop",
  "leaf",
  "lightbulb",
  "lighthouse",
  "lock",
  "magnet",
  "map",
  "mask",
  "match",
  "microphone",
  "microscope",
  "mirror",
  "money",
  "moon",
  "mountain",
  "mouse",
  "nail",
  "necklace",
  "needle",
  "net",
  "newspaper",
  "notebook",
  "ocean",
  "oven",
  "paint",
  "pants",
  "paper",
  "parachute",
  "pencil",
  "phone",
  "piano",
  "pillow",
  "pipe",
  "planet",
  "plate",
  "plug",
  "pocket",
  "pool",
  "postcard",
  "present",
  "printer",
  "prism",
  "pyramid",
  "radio",
  "rainbow",
  "ring",
  "rocket",
  "roof",
  "rope",
  "rug",
  "ruler",
  "satellite",
  "saw",
  "saxophone",
  "scarf",
  "scissors",
  "screw",
  "shoe",
  "shovel",
  "skateboard",
  "skeleton",
  "skull",
  "sled",
  "smartphone",
  "snow",
  "snowflake",
  "snowman",
  "soap",
  "sock",
  "sofa",
  "spider web",
  "sponge",
  "spoon",
  "stairs",
  "stamp",
  "star",
  "statue",
  "stethoscope",
  "stop sign",
  "stove",
  "suitcase",
  "sun",
  "sunglasses",
  "sword",
  "table",
  "tablet",
  "tank",
  "tape",
  "taxi",
  "teapot",
  "telescope",
  "television",
  "tent",
  "thermometer",
  "thunder",
  "ticket",
  "tie",
  "tire",
  "toast",
  "toilet",
  "toothbrush",
  "toothpaste",
  "torch",
  "tornado",
  "tower",
  "tractor",
  "traffic light",
  "train",
  "trash can",
  "tree",
  "triangle",
  "trombone",
  "trophy",
  "truck",
  "trumpet",
  "umbrella",
  "vacuum",
  "vase",
  "violin",
  "volcano",
  "wall",
  "wallet",
  "watch",
  "water",
  "waterfall",
  "wave",
  "wheel",
  "whistle",
  "window",
  "wing",
  "witch",
  "wood",
  "wrench",
  "xylophone",
  "yacht",
  "yoyo",
  "zipper",

  // --- ACTIONS & ABSTRACT ---
  "archery",
  "argument",
  "balance",
  "ballet",
  "baseball",
  "basketball",
  "bath",
  "birthday",
  "blind",
  "bowling",
  "boxing",
  "camping",
  "camping",
  "chess",
  "clap",
  "climb",
  "coding",
  "cooking",
  "cough",
  "cry",
  "dance",
  "dig",
  "dive",
  "drawing",
  "dream",
  "drink",
  "drive",
  "eat",
  "exercise",
  "explosion",
  "fall",
  "fight",
  "fishing",
  "fly",
  "football",
  "game",
  "gardening",
  "golf",
  "gymnastics",
  "haircut",
  "hiccup",
  "hide",
  "high five",
  "hiking",
  "hockey",
  "hug",
  "hunting",
  "idea",
  "jump",
  "karate",
  "kiss",
  "knit",
  "laugh",
  "magic",
  "marriage",
  "math",
  "meditate",
  "music",
  "night",
  "ninja",
  "paint",
  "party",
  "photo",
  "picnic",
  "pirate",
  "plumber",
  "police",
  "prayer",
  "puzzle",
  "race",
  "rain",
  "read",
  "recycle",
  "run",
  "sad",
  "scream",
  "scuba",
  "shadow",
  "shopping",
  "shout",
  "sing",
  "skate",
  "ski",
  "sleep",
  "smile",
  "smoke",
  "sneeze",
  "soccer",
  "storm",
  "study",
  "surf",
  "sweat",
  "swim",
  "swing",
  "tennis",
  "think",
  "throw",
  "thunderstorm",
  "travel",
  "vampire",
  "video game",
  "vote",
  "waiter",
  "walk",
  "wash",
  "wedding",
  "whisper",
  "wind",
  "write",
  "yoga",
];

let rooms = {};

const getWordOptions = () =>
  WORD_LIST.sort(() => 0.5 - Math.random()).slice(0, 3);

// server/index.js

// ... imports and setup ...

const revealHint = (room) => {
  const game = rooms[room];
  if (!game || !game.currentWord) return;

  // 1. Calculate actual length (ignoring spaces)
  const cleanWord = game.currentWord.replace(/ /g, "");
  const totalLetters = cleanWord.length;

  // 2. Set Limit based on your rules
  let maxReveals = 0;

  if (totalLetters <= 5) {
    maxReveals = 2; // 4-5 letters -> Max 2 hints
  } else if (totalLetters <= 7) {
    maxReveals = 3; // 6-7 letters -> Max 3 hints
  } else {
    maxReveals = 4; // 8+ letters -> Max 4 hints
  }

  // 3. Stop if we already revealed enough
  if (game.revealedIndices.length >= maxReveals) return;

  // 4. Reveal a random hidden letter (Existing Logic)
  const unrevealedIndices = game.currentWord
    .split("")
    .map((c, i) => ({ c, i }))
    .filter((x) => x.c !== " " && !game.revealedIndices.includes(x.i))
    .map((x) => x.i);

  if (unrevealedIndices.length > 0) {
    const idx =
      unrevealedIndices[Math.floor(Math.random() * unrevealedIndices.length)];
    game.revealedIndices.push(idx);

    const hint = game.currentWord
      .split("")
      .map((c, i) =>
        c === " " ? "  " : game.revealedIndices.includes(i) ? c + " " : "_ "
      )
      .join("");

    io.to(room).emit("hint_update", hint);
  }
};

// ... rest of the code ...

io.on("connection", (socket) => {
  console.log(`User: ${socket.id}`);

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
    const newPlayer = {
      id: socket.id,
      username,
      avatar,
      score: 0,
      hasGuessed: false,
    };
    rooms[room].players.push(newPlayer);
    io.to(room).emit("update_players", rooms[room].players);
    io.to(room).emit("receive_message", {
      author: "SYSTEM",
      message: `${username} joined!`,
      type: "join",
    });

    // Late Joiner Sync
    const game = rooms[room];
    if (game.gameState === "drawing" || game.gameState === "selecting_word") {
      socket.emit("current_state_sync", {
        timer: game.timer,
        round: game.currentRound,
        drawerId: game.players[game.currentDrawerIndex].id,
        hint: game.currentWord
          .split("")
          .map((c) => (c === " " ? "  " : "_ "))
          .join(""),
      });
    }
  });

  // 2. DISCONNECT (UPDATED FOR DRAWER LEAVING)
  socket.on("disconnect", () => {
    for (const roomId in rooms) {
      const game = rooms[roomId];
      const playerIndex = game.players.findIndex((p) => p.id === socket.id);

      if (playerIndex !== -1) {
        const leavingPlayer = game.players[playerIndex];
        const wasDrawer = playerIndex === game.currentDrawerIndex;

        // 1. Remove the player
        game.players.splice(playerIndex, 1);

        // 2. Fix the Drawer Index
        // If the person who left was BEFORE the current drawer in the list,
        // everyone shifts down by 1, so we must decrease the index.
        if (playerIndex < game.currentDrawerIndex) {
          game.currentDrawerIndex--;
        }

        // 3. Notify everyone
        io.to(roomId).emit("update_players", game.players);
        io.to(roomId).emit("receive_message", {
          author: "SYSTEM",
          message: `${leavingPlayer.username} left.`,
          type: "leave",
        });

        // 4. Handle Empty Room
        if (game.players.length === 0) {
          clearInterval(game.timerInterval);
          delete rooms[roomId];
          break;
        }

        // 5. IF THE DRAWER LEFT
        if (wasDrawer) {
          clearInterval(game.timerInterval); // Stop the clock

          // Since the drawer left, the player who was at (index + 1) is now at (index).
          // So we do NOT need to increment currentDrawerIndex, just ensure it's valid.
          if (game.currentDrawerIndex >= game.players.length) {
            game.currentDrawerIndex = 0;
            game.currentRound++;
          }

          // Send Special "Drawer Left" Event (Uses same UI as Turn Skipped)
          io.to(roomId).emit("turn_skipped", {
            username: leavingPlayer.username,
            reason: "left the game!",
          });

          // Start next turn after 5 seconds
          setTimeout(() => {
            startTurn(roomId);
          }, 5000);
        }
        // 6. If a GUESSER left, check if everyone else has guessed now
        else if (
          game.gameState === "drawing" &&
          game.guessedCount >= game.players.length - 1
        ) {
          clearInterval(game.timerInterval);
          endTurn(roomId);
        }

        break;
      }
    }
  });

  socket.on("start_game", (room) => {
    if (rooms[room]) {
      rooms[room].currentRound = 1;
      rooms[room].currentDrawerIndex = 0;
      startTurn(room);
    }
  });

  socket.on("word_selected", ({ room, word }) => {
    const game = rooms[room];
    if (!game) return;
    game.currentWord = word;
    game.gameState = "drawing";
    game.timer = TIME_TO_DRAW;
    game.guessedCount = 0;
    game.revealedIndices = [];
    game.players.forEach((p) => (p.hasGuessed = false));

    const hint = word
      .split("")
      .map((c) => (c === " " ? "  " : "_ "))
      .join("");
    io.to(room).emit("round_start", { timer: game.timer, currentWord: hint });

    clearInterval(game.timerInterval);
    game.timerInterval = setInterval(() => {
      game.timer--;
      io.to(room).emit("timer_update", game.timer);
      if (game.timer === 60 || game.timer === 40 || game.timer === 20)
        revealHint(room);
      if (game.timer <= 0) {
        clearInterval(game.timerInterval);
        endTurn(room);
      }
    }, 1000);
  });

  socket.on("send_message", (data) => {
    const game = rooms[data.room];
    if (!game) return;
    const guess = data.message.trim().toLowerCase();
    const actual = game.currentWord.trim().toLowerCase();

    if (game.gameState === "drawing" && guess === actual) {
      const p = game.players.find((player) => player.id === socket.id);
      const drawer = game.players[game.currentDrawerIndex];

      if (p && !p.hasGuessed && p.id !== drawer.id) {
        p.hasGuessed = true;
        game.guessedCount++;
        p.score += Math.floor(game.timer * 2);

        io.to(data.room).emit("receive_message", {
          ...data,
          author: "SYSTEM",
          message: `${data.author} guessed it!`,
          type: "success",
        });
        io.to(data.room).emit("update_players", game.players);
        io.to(p.id).emit("hint_update", game.currentWord);

        if (game.guessedCount >= game.players.length - 1) {
          clearInterval(game.timerInterval);
          endTurn(data.room);
        }
      }
    } else {
      io.to(data.room).emit("receive_message", data);
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
      const winner = game.players.sort((a, b) => b.score - a.score)[0];
      io.to(room).emit("game_over", winner);
      return;
    }

    const drawer = game.players[game.currentDrawerIndex];
    game.gameState = "selecting_word";
    game.timer = TIME_TO_PICK;

    io.to(room).emit("choose_word", {
      drawer: drawer.username,
      drawerId: drawer.id,
    });
    io.to(drawer.id).emit("your_turn_to_pick", getWordOptions());

    game.timerInterval = setInterval(() => {
      game.timer--;
      io.to(room).emit("timer_update", game.timer);

      // --- TIMEOUT LOGIC ---
      if (game.timer <= 0) {
        clearInterval(game.timerInterval);
        handlePickTimeout(room); // Use special timeout handler
      }
    }, 1000);
  }

  // --- NEW: Handle when someone doesn't pick a word ---
  function handlePickTimeout(room) {
    const game = rooms[room];
    const drawer = game.players[game.currentDrawerIndex];

    // Deduct points
    drawer.score -= 50;

    // Send event to client (Fail sound, show -50)
    io.to(room).emit("turn_skipped", {
      username: drawer.username,
      score: drawer.score,
    });
    io.to(room).emit("update_players", game.players);

    // Go to next person after 5 seconds
    setTimeout(() => {
      advanceToNextPlayer(room);
    }, 5000);
  }

  function endTurn(room) {
    const game = rooms[room];
    clearInterval(game.timerInterval);
    const drawer = game.players[game.currentDrawerIndex];
    if (game.guessedCount > 0 && drawer) drawer.score += game.guessedCount * 10;

    io.to(room).emit("update_players", game.players);
    io.to(room).emit("round_end", {
      word: game.currentWord,
      guessedCount: game.guessedCount,
    });

    setTimeout(() => {
      advanceToNextPlayer(room);
    }, 8000);
  }

  // Helper to move index and start next turn
  function advanceToNextPlayer(room) {
    const game = rooms[room];
    game.currentDrawerIndex++;
    if (game.currentDrawerIndex >= game.players.length) {
      game.currentDrawerIndex = 0;
      game.currentRound++;
    }
    startTurn(room);
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT}`));
