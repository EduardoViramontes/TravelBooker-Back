import "dotenv/config";
import fs from "fs";
import path from "path";
import https from "https";
import db from "./db";
import app from "./app";


const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log("Conexión a la base de datos exitosa.");

    try {
      // Rutas de certificados SSL desde .env
      const certPath = process.env.KEY_SSL;
      const keyPath = process.env.CER_SSL;
      const caBundlePath = process.env.SSL_CA_BUNDLE;

      if (!certPath || !keyPath || !caBundlePath) {
        throw new Error("Certificados SSL no configurados en el .env");
      }

      const options: https.ServerOptions = {
        key: fs.readFileSync(path.resolve(__dirname, keyPath)),
        cert: fs.readFileSync(path.resolve(__dirname, certPath)),
        ca: fs.readFileSync(path.resolve(__dirname, caBundlePath)),
      };

      https.createServer(options, app).listen(process.env.PORT, () => {
        console.log(
          `Servidor HTTPS ${process.env.NOM_APP} corriendo en puerto ${process.env.PORT}`
        );
      });

    } catch (sslError) {
      app.listen(process.env.PORT, () => {
        console.log(
          `Servidor HTTP ${process.env.NOM_APP} corriendo en puerto ${process.env.PORT}`
        );
      });
    }

  } catch (dbError) {
    console.error("No se pudo conectar a la base de datos. Por favor verifique que este configurado correctamente las credenciales al servidor de base de datos e intente nuevamente.");
  }
};

startServer();