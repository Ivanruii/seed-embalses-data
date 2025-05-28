import axios from "axios";

const url = process.env.API_URL || "";

export const getLatestEntries = async (): Promise<any[]> => {
  const maxDateResponse = await axios.get(url, {
    params: {
      where: "1=1",
      outFields: "Fecha_str",
      orderByFields: "fecha DESC",
      resultRecordCount: 1,
      f: "json",
    },
  });
  const features = maxDateResponse.data.features;
  if (!features || features.length === 0) {
    throw new Error("No se pudo obtener la Fecha_str más reciente.");
  }
  const latestFechaStr =
    features[0].attributes?.Fecha_str || features[0].Fecha_str;

  let offset = 0;
  let allResults: any[] = [];
  let keepFetching = true;

  while (keepFetching) {
    const response = await axios.get(url, {
      params: {
        where: `Fecha_str = '${latestFechaStr}'`,
        outFields: "*",
        returnGeometry: false,
        f: "json",
        resultRecordCount: 2000,
        resultOffset: offset,
      },
    });

    const feats = response.data.features;
    if (!feats.length) {
      keepFetching = false;
      break;
    }

    allResults.push(...feats.map((f: any) => f.attributes || f));
    offset += feats.length;
  }
  return allResults;
};
