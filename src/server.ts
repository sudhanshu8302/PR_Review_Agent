import express from "express";
import { handler } from "./index.js";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  const event = {
    headers: req.headers,
    body: JSON.stringify(req.body)
  };

  const result = await handler(event);
  res.status(result.statusCode).send(result.body);
});

app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});