const express = require("express");
const router = express.Router();
const controller = require("../controller/file.controller");

let routes = (app) => {
  router.post("/api/upload", controller.upload);
  router.post("/api/train", controller.train);
  router.post("/api/newIndex", controller.newIndex);
  router.get("/files", controller.getListFiles);
  router.get("/files/:name", controller.download);
  router.delete("/files/:name", controller.remove);

  app.use(router);
};

module.exports = routes;
