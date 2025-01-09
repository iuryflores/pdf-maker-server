import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const getAllFolders = (baseDir: string, folders: string[] = []): string[] => {
  const entries = fs.readdirSync(baseDir);

  entries.forEach((entry) => {
    const fullPath = path.join(baseDir, entry);
    if (fs.statSync(fullPath).isDirectory()) {
      folders.push(fullPath);
      getAllFolders(fullPath, folders); // Chama recursivamente para subpastas
    }
  });

  return folders;
};

const logError = (folder: string, error: any) => {
  const logFile = path.join(__dirname, "../assets/logs/error_log.txt");
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] Erro na pasta: ${folder} - ${error.message}\n`;

  // Cria a pasta de logs, se não existir
  const logDir = path.dirname('logFile');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }

  fs.appendFileSync(logFile, logMessage);
  console.error(`❌ Erro na pasta: ${folder} - Veja o log para mais detalhes.`);
};

// Função para transformar imagens de várias pastas em PDFs separados
export const createPDFsFromFolders = () => {
  const baseDir = path.join(__dirname, "../assets/images");
  const outputDir = path.join(__dirname, "../assets/pdfs");

  // Cria a pasta de PDFs, se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const allFolders = getAllFolders(baseDir);
  const pdfFiles: string[] = [];
  const errors: string[] = [];

  allFolders.forEach((folder) => {
    try {
      const imageFiles = fs.readdirSync(folder).filter((file) => {
        return /\.(jpg|jpeg|png|gif)$/i.test(file); // Apenas arquivos de imagem
      });

      if (imageFiles.length === 0) {
        console.warn(`⚠️ Nenhuma imagem encontrada na pasta: ${folder}`);
        return;
      }

      // Cria o PDF com o nome da pasta e um timestamp
      const folderName = path.relative(baseDir, folder).replace(/[\\/]/g, "_");
      const pdfPath = path.join(outputDir, `${folderName}-${Date.now()}.pdf`);
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(pdfPath);

      doc.pipe(writeStream);

      // Adiciona cada imagem ao PDF
      imageFiles.forEach((file, index) => {
        const imagePath = path.join(folder, file);
        if (index > 0) doc.addPage();

        doc.image(imagePath, {
          fit: [500, 700],
          align: "center",
          valign: "center"
        });
      });

      doc.end();
      pdfFiles.push(pdfPath);
      console.log(`✅ PDF gerado: ${pdfPath}`);
    } catch (error: any) {
      errors.push(folder);
      logError(folder, error); // Loga o erro sem interromper
    }
  });

  return { pdfFiles, errors };
};
