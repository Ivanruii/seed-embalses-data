import {
  connectToDatabase,
  disconnectFromDatabase,
  insertEmbalses,
} from "../services/database.service";
import { EmbalseJSON } from "../types/embalse";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const run = async () => {
  try {
    const connectionString = process.env.MONGODB_URI || "";

    await connectToDatabase(connectionString);

    const jsonPath = path.join(
      __dirname,
      "..",
      "..",
      "embalses_last_week.json"
    );

    const jsonContent = await fs.readFile(jsonPath, "utf-8");
    const embalses: EmbalseJSON[] = JSON.parse(jsonContent);

    const validEmbalses = embalses.filter(
      (embalse) =>
        embalse.EMBALSE_ID && embalse.embalse_nombre && embalse.ambito_nombre
    );

    await insertEmbalses(validEmbalses);
  } catch (error) {
    console.error("Error running local-json-file-to-mongo-database:", error);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
    process.exit(0);
  }
};
