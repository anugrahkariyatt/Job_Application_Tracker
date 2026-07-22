import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import Settings from "../models/settings.model.js";

const router = Router();

// GET /api/settings - Public retrieval
router.get("/", async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        platformName: "Techno Careers",
        supportEmail: "support@technocareers.com",
      });
    }
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/settings - Admin only update
router.put("/", authenticate, authorize("admin"), async (req, res, next) => {
  try {
    const { platformName, supportEmail } = req.body;
    
    if (!platformName || !platformName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Platform name is required.",
      });
    }
    if (!supportEmail || !supportEmail.trim()) {
      return res.status(400).json({
        success: false,
        message: "Support email is required.",
      });
    }

    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    
    settings.platformName = platformName;
    settings.supportEmail = supportEmail;
    await settings.save();

    return res.status(200).json({
      success: true,
      message: "Platform settings updated successfully.",
      data: settings,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
