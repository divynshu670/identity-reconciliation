import { Router } from "express";
import { IdentifyController } from "../controllers/identify.controller.js";

const router = Router();
const controller = new IdentifyController();

router.post("/identify", controller.identify.bind(controller));

export default router;