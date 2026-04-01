import { app, initializeApp } from "../server/index.js";

let isReadyPromise;

export default async function handler(req, res) {
  if (!isReadyPromise) {
    isReadyPromise = initializeApp();
  }

  await isReadyPromise;
  return app(req, res);
}
