import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { app } from "./app.js";
import connectDB from "./db/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const port = process.env.PORT || 8001;

app.get("/", (req, res) => {
  res.status(200).send("Hello World");
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error ", err);
  });