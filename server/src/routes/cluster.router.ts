import { Router } from "express";
import { ClusterController } from "../controllers/cluster.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const clusterRouter = Router();

clusterRouter.use(verifyToken);
clusterRouter.get("/", ClusterController.findAll);
clusterRouter.post("/", ClusterController.create);
clusterRouter.put("/:id", ClusterController.update);
clusterRouter.delete("/:id", ClusterController.delete);

export default clusterRouter;
