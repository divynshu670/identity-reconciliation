import { Request, Response } from "express";
import { ContactService } from "../services/contact.service.js";
import { normalizeEmail, normalizePhone } from "../utils/normalize.js";
import { z } from "zod";

const schema = z.object({
  email: z.string().email().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
});

export class IdentifyController {
  private service = new ContactService();

  async identify(req: Request, res: Response) {
    const parsed = schema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid input" });
    }

    const email = normalizeEmail(parsed.data.email);
    const phone = normalizePhone(parsed.data.phoneNumber);

    if (!email && !phone) {
      return res.status(400).json({ error: "At least one field required" });
    }

    const result = await this.service.identify(email, phone);

    return res.status(200).json({
      contact: result,
    });
  }
}