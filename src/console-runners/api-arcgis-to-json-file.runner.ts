import fs from "fs";
import path from "path";
import { getLatestEntries } from "src/services/arcgis-api.service";

async function downloadLatestDataToFile() {
  const outPath = path.resolve(process.cwd(), "embalses_last_week.json");
  const writeStream = fs.createWriteStream(outPath, { flags: "w" });
  writeStream.write("[\n");

  try {
    const entries = await getLatestEntries();
    entries.forEach((attrs, idx) => {
      if (idx > 0) writeStream.write(",\n");
      writeStream.write(JSON.stringify(attrs));
    });
    writeStream.write("\n]\n");
    writeStream.end(() => {
      console.log(
        `Exportación finalizada en "${outPath}" con ${entries.length} registros.`
      );
    });
  } catch (error: any) {
    writeStream.end();
    console.error("Error running api-arcgis-to-json-file: ", error.message);
  }
}

export const run = async () => {
  await downloadLatestDataToFile();
};
