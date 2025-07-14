import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import { DataSource } from "typeorm";
import { Transaction } from "./entity/Transaction";
import crypto from "crypto";

// DATOS DE PRUEBA PAYU
const PAYU_APIKEY = "4Vj8eK4rloUd272L48hsrarnUA";

// Configuración de la DB (mismo que docker-compose)
const AppDataSource = new DataSource({
  type: "postgres",
  host: "dpg-d1q9vgjuibrs73eg7k10-a",
  port: 5432,
  username: "payu",
  password: "6qbgtn9MQJxlBBrK2Ykl8c8Q7JSOJnB9",
  database: "payudb",
  synchronize: false,
  ssl: { rejectUnauthorized: false },
  logging: false,
  entities: [Transaction],
});

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/api/confirmation", async (req, res) => {
  const {
    merchantId,
    referenceCode,
    TX_VALUE,
    currency,
    transactionState,
    signature,
    transactionId,
    buyerEmail,
  } = req.body;

  const value = Number.parseFloat(TX_VALUE).toFixed(1);
  const signatureString = [
    PAYU_APIKEY,
    merchantId,
    referenceCode,
    value,
    currency,
    transactionState,
  ].join("~");

  const localSignature = crypto.createHash("md5").update(signatureString).digest("hex");

  if (localSignature.toUpperCase() === (signature || "").toUpperCase()) {
    // Guarda la transacción
    const trx = new Transaction();
    trx.referenceCode = referenceCode || "";
    trx.transactionId = transactionId || "";
    trx.status = transactionState || "";
    trx.value = value || "";
    trx.currency = currency || "";
    trx.buyerEmail = buyerEmail || "";
    await AppDataSource.manager.save(trx);

    console.log("Transacción registrada:", trx);

    return res.status(200).send("OK");
  } else {
    console.error("Firma inválida en notificación PayU");
    return res.status(400).send("Firma inválida");
  }
});

AppDataSource.initialize().then(() => {
  app.listen(4000, () => {
    console.log("Servidor API demo PayU en http://localhost:4000");
  });
}).catch((err) => {
  console.error("Error inicializando DB:", err);
});
