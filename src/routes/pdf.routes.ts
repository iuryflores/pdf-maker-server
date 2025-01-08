import express, { Request, Response } from "express";

import { createPDFsFromFolders } from "../config/pdfConfig";

const router = express.Router();

router.get("/generate-pdf", (req: Request, res: Response) => {
  try {
    const { pdfFiles, errors } = createPDFsFromFolders();

    const response = {
      message: "Processamento concluído!",
      generatedPDFs: pdfFiles,
      errors:
        errors.length > 0
          ? `Ocorreram erros em ${errors.length} pastas. Verifique o log.`
          : "Sem erros!"
    };

    return res.status(200).json(response);
  } catch (err) {
    console.error("Erro ao gerar PDFs:", err);
    return res.status(500).send("Erro ao gerar PDFs");
  }
});

export default router;
