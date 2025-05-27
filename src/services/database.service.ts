import { MongoClient, Db, Collection } from "mongodb";
import { Embalse, Cuenca, MetaDatos, EmbalseJSON } from "../types/embalse";

interface DbContext {
  client: MongoClient;
  db: Db;
  collections: {
    embalses: Collection<Embalse>;
    cuencas: Collection<Cuenca>;
    metaDatos: Collection<MetaDatos>;
  };
}

let dbContext: DbContext | null = null;

const createDbContext = async (
  connectionString: string
): Promise<DbContext> => {
  const client = new MongoClient(connectionString);
  await client.connect();
  const db = client.db("embalses");

  return {
    client,
    db,
    collections: {
      embalses: db.collection<Embalse>("embalses"),
      cuencas: db.collection<Cuenca>("cuencas"),
      metaDatos: db.collection<MetaDatos>("metadatos"),
    },
  };
};

export const connectToDatabase = async (
  connectionString: string
): Promise<void> => {
  try {
    dbContext = await createDbContext(connectionString);
    console.log("Connected to database");
  } catch (error) {
    console.error("Error connecting to database:", error);
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  try {
    if (dbContext) {
      await dbContext.client.close();
      dbContext = null;
      console.log("Disconnected from database");
    }
  } catch (error) {
    console.error("Error disconnecting from database:", error);
    throw error;
  }
};

const getDbContext = (): DbContext => {
  if (!dbContext) {
    throw new Error("Database not connected. Call connectToDatabase first.");
  }
  return dbContext;
};

export const insertEmbalses = async (
  embalses: EmbalseJSON[]
): Promise<void> => {
  const { collections } = getDbContext();

  try {
    const cuencasMap = new Map<string, Cuenca>();

    embalses.forEach((embalse) => {
      if (!cuencasMap.has(embalse.ambito_nombre)) {
        cuencasMap.set(embalse.ambito_nombre, {
          _id: embalse.ambito_id.toString(),
          objectId: embalse.OBJECTID.toString(),
          nombre: embalse.ambito_nombre,
          comunidadAutonoma: "",
        });
      }
    });

    const cuencaBulkOps = Array.from(cuencasMap.values()).map((cuenca) => ({
      updateOne: {
        filter: { _id: cuenca._id },
        update: { $set: cuenca },
        upsert: true,
      },
    }));

    if (cuencaBulkOps.length > 0) {
      await collections.cuencas.bulkWrite(cuencaBulkOps);
    }

    const mappedEmbalses = embalses.map((embalse) => {
      const cuenca = cuencasMap.get(embalse.ambito_nombre)!;

      return {
        id: embalse.ID_Unico,
        objectId: embalse.OBJECTID.toString(),
        embalse_id: embalse.EMBALSE_ID,
        nombre: embalse.embalse_nombre,
        cuenca: {
          _id: cuenca._id,
          nombre: cuenca.nombre,
          comunidadAutonoma: cuenca.comunidadAutonoma,
        },
        provincia: null,
        capacidad: embalse.agua_total,
        aguaActualAemet: embalse.agua_actual,
        fechaMedidaAguaActualAemet: new Date(embalse.fecha),
        aguaActualSAIH: null,
        fechaMedidaAguaActualSAIH: null,
        descripcion_id: embalse.ID_Unico,
        uso: embalse.Uso,
      };
    });

    const embalseBulkOps = mappedEmbalses.map((embalse) => ({
      updateOne: {
        filter: { embalse_id: embalse.embalse_id },
        update: { $set: embalse },
        upsert: true,
      },
    }));

    if (embalseBulkOps.length > 0) {
      await collections.embalses.bulkWrite(embalseBulkOps);
    }

    const metaDatos: MetaDatos = {
      _id: new Date().toISOString(),
      objectId: "1",
      ultimaImportacionAemet: new Date(),
      ultimoStatus: "OK",
      ultimasImportacionesSAIH: [
        {
          nombresitio: "ImportaciónInicial",
          ultimaimportacion: new Date(),
          ultimoStatus: "OK",
        },
      ],
    };

    const { _id, ...data } = metaDatos;

    const metaDatosBulkOps = [
      {
        updateOne: {
          filter: { _id },
          update: { $set: data },
          upsert: true,
        },
      },
    ];

    await collections.metaDatos.bulkWrite(metaDatosBulkOps);

    console.log("Data imported and upserted successfully");
  } catch (error) {
    console.error("Error importing data:", error);
    throw error;
  }
};
