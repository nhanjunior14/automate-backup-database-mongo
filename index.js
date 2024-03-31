const path = require('path');
const cron = require('node-cron');
const spawn = require('child_process');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME;
const ARCHIVE_PATH = path.join(__dirname, "backup", `${DB_NAME}.gzip`);
const PORT = process.env.PORT || 27017;
const URL = process.env.URL || "localhost";

cron.schedule("59 23 * * 3", () => backupDbMongo()); //At 23:59 on Wednesday
//minute hour day(month) month day(week) (* * * * *)
const backupDbMongo = () => {
    const child = spawn("mongodump", [
      `--db=${DB_NAME}`,
      `--url=${URL}`,
      `--port=${PORT}`,
      `--archive=${ARCHIVE_PATH}`,
      `--gzip`,
    ]);
  
    // standard out
    child.stdout.on("data", (data) => {
      console.log("stdout:\n", data);
    });

    // standard err
    child.stderr.on("data", (data) => {
      console.log("stderr:\n", Buffer.from(data).toString());
    });

    child.stdout.on("error", (error) => {
      console.log("error:\n", error);
    });

    // Handle node process error
    child.on("exit", (code, signal) => {
      if (code) console.log("Backup process exited with code ", code);
      else if (signal) console.log("Backup process was killed with singal ", signal);
      else console.log("Successfully backup the database");
    });
  };