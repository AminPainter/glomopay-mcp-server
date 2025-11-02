import z from 'zod';

export const createPaymentLinkSchema = {
  body: z.object({
    amount: z.number().min(1, 'Amount must be greater than 0').describe('The payment amount (in smallest currency unit, e.g., cents).'),
    currency: z.string().min(1).describe("Currency code (e.g., 'USD', 'EUR', 'INR')."),
    customerId: z.string().min(1).describe('The ID of the customer for whom the payment link is created.'),
    purposeCode: z.string().min(1).describe('Code specifying the purpose of the payment (business-defined).'),
    expiresAt: z
      .string()
      .refine((v) => !isNaN(Date.parse(v)), {
        message: 'Must be a valid ISO date string',
      })
      .describe('ISO timestamp for when the payment link should expire.'),
    description: z.string().optional().describe('Optional description for the payment link.'),
  }),
};

export type TCreatePaymentLinkSchema = typeof createPaymentLinkSchema;
