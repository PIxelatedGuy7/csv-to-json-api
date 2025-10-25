import express from "express";
import uploadRoute from "./routes/uploadRoute.js";
import statusRoute from "./routes/statusRoute.js";

const app = express();
app.use(express.json());
app.use("/api", uploadRoute);
app.use("/api", statusRoute);

app.listen(3000, () => console.log("Server running on port 3000"));
