import express, { Request, Response } from "express";
import pdfRoutes from "./routes/pdf.routes";
import { config } from "dotenv";
// import { fileUploadConfig } from "./config/fileUpload";
config();

const app = express();
app.use(express.json({ limit: "50mb" })); // Limite no json
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Limite no urlencoded
app.use((req: Request, res: Response, next) => {
  res.setTimeout(300000, () => {
    // Timeout de 5 minutos
    console.log("Request has timed out.");
    res.status(408).send({ message: "Request Timeout" });
  });
  next();
});
// app.use(fileUploadConfig);

app.use(express.json());

app.use("/api/pdf", pdfRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
