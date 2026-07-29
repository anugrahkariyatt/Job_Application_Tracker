import { Request, Response } from "express";
import { z } from "zod";
import { sendContactFormEmail } from "../services/mail.service.js";

const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().trim().email("Invalid email format"),
  role: z.string().optional(),
  subject: z.string().trim().max(100).optional(),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(1000),
});

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const validation = contactFormSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { name, email, role, subject, message } = validation.data;

    // Send email via n8n mail service
    await sendContactFormEmail({ name, email, role, subject, message });

    return res.status(200).json({
      success: true,
      message: "Thank you for reaching out! We've received your message and will respond within 24 hours.",
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to process contact submission",
    });
  }
};
