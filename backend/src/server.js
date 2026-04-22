import app from "./app.js";
import { env } from "./config/env.js";
import { testDbConnection } from "./config/db.js";
import { startSchedulers } from "./jobs/scheduler.js";

const bootstrap = async () => {
  await testDbConnection();
  startSchedulers();

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
};

bootstrap();
