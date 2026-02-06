const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./app/config/db.config");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve client index as the root page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Serve /client assets from this repo
app.use("/client", express.static(path.join(__dirname, "client")));


require("./app/routes/auth.routes")(app);
require("./app/routes/photo.routes")(app);
require("./app/routes/album.routes")(app);
require("./app/routes/comment.routes")(app);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

app.use((err, req, res, next) => {
  const status = Number.isInteger(err.status) ? err.status : 500;
  const message = typeof err.message === "string" && err.message.length ? err.message : "Server Error";
  res.status(status).json({ message });
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

if (process.env.MONGO_URI) {
  connectDB()
    .then(() => startServer())
    .catch((err) => {
      console.warn('Failed to connect to MongoDB:', err.message);
      console.warn('Starting server without DB connection (some features will be disabled)');
      startServer();
    });
} else {
  console.warn('MONGO_URI not set — starting server without DB connection (frontend will still work)');
  startServer();
}

