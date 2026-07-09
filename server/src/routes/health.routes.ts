import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = Router();

router.get("/", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is running ",
  });
});
router.get(
  "/test",
  authenticate,
  authorize("admin", "compnay"),
  (req, res) => {
    res.json({
      success: true,
      message: "Authenticated",
    });
  },
);

export default router;
