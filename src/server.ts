import express from "express";
import { handler } from "./index.js";

const app = express();
app.use(express.json());

app.post("/webhook", async (req, res) => {
  console.log("Received webhook body:", req.body );
  const result = await handler(req);
  res.status(result.statusCode).send(result.body);
});

app.listen(3000, () => {
  console.log("Webhook server running on port 3000");
});