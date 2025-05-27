import axios from "axios";
import fs from "fs";
import path from "path";

const url = process.env.API_URL || "";

async function getMaxFechaStr() {
  const response = await axios.get(url, {
    params: {
      where: "1=1",
      outFields: "Fecha_str",
      returnGeometry: false,
      f: "json",
      orderByFields: "Fecha_str DESC",
      resultRecordCount: 1,
    },
  });

  const features = response.data.features;
  if (features && features.length > 0) {
    return features[0].attributes.Fecha_str;
  }

  throw new Error("No se pudo obtener la Fecha_str más reciente.");
}

async function downloadLatestData(latestFechaStr: string) {
  const paramsBase = {
    where: `Fecha_str = '${latestFechaStr}'`,
    outFields: "*",
    returnGeometry: false,
    f: "json",
    resultRecordCount: 2000,
  };

  const outPath = path.resolve(process.cwd(), "embalses_last_week.json");
  const writeStream = fs.createWriteStream(outPath, { flags: "w" });
  writeStream.write("[\n");

  let offset = 0;
  let totalRecords = 0;
  let isFirst = true;
  let keepFetching = true;

  while (keepFetching) {
    try {
      const params = {
        ...paramsBase,
        resultOffset: offset,
      };

      const response = await axios.get(url, { params });
      const features = response.data.features;

      if (!features || features.length === 0) {
        keepFetching = false;
        break;
      }

      for (const f of features) {
        if (!isFirst) writeStream.write(",\n");
        writeStream.write(JSON.stringify(f.attributes));
        isFirst = false;
        totalRecords++;
      }

      offset += features.length;
      console.log(`Descargados: ${totalRecords} registros...`);
    } catch (error: any) {
      console.error("Error durante la descarga:", error.message);
      break;
    }
  }

  writeStream.write("\n]\n");
  writeStream.end(() => {
    console.log(
      `Exportación finalizada en "${outPath}" con ${totalRecords} registros.`
    );
  });
}

export const run = async () => {
  try {
    const latestFechaStr = await getMaxFechaStr();
    console.log(`Fecha_str más reciente encontrada: ${latestFechaStr}`);
    await downloadLatestData(latestFechaStr);
  } catch (err: any) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};
