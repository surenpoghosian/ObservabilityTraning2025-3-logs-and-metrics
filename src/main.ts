import express from "express";
import "reflect-metadata";
import { DataSource } from "typeorm";
import userRoutes from "./routes/userRoutes";
import { User } from "./entities/User";
import logger from "./utils/logger";
import pinoHttp from "pino-http";

const app = express();

app.use(express.json());
app.use(pinoHttp({ logger }));

app.use("/users", userRoutes);

app.get("/health", (_req, res) => {
  const dbStatus = AppDataSource.isInitialized ? "connected" : "not connected";
  logger.info({ service: "healthcheck", db: dbStatus });

  if (AppDataSource.isInitialized) {
    res.status(200).json({ status: "ok", message: "Service is healthy" });
  } else {
    res.status(500).json({ status: "error", message: "Database not connected" });
  }
});


export const AppDataSource = new DataSource({
  type: "postgres",
  host: "db",
  port: 5432,
  username: "postgres",
  password: "password",
  database: "cruddb",
  entities: [User],
  synchronize: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log("Database connected successfully");
    app.listen(3000, () => console.log("server running on port 3000"));
  })
  .catch((error) => console.log("Database connection error:", error));
