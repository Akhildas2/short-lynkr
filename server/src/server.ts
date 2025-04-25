import "dotenv/config";
import express from "express";
import cors from "cors";
import urlRoutes from "./routes/url.routes";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);
app.use(cors());
app.use(express.json());

app.use("/api", urlRoutes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});