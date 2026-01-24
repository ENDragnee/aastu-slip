import { z } from "zod";

/**
 * Ethiopian phone number
 * Accepts: +251XXXXXXXXX | 09XXXXXXXX | 07XXXXXXXX
 * Normalizes to: +251XXXXXXXXX
 */
export const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .superRefine((value, ctx) => {
    // +251XXXXXXXXX
    if (value.startsWith("+251")) {
      if (!/^\+251\d{9}$/.test(value)) {
        ctx.addIssue({
          code: "custom",
          message: "Invalid +251 phone number",
        });
      }
      return;
    }

    // 09XXXXXXXX or 07XXXXXXXX
    if (/^(09|07)\d{8}$/.test(value)) {
      return;
    }

    ctx.addIssue({
      code: "custom",
      message: "Phone must start with +251, 09, or 07",
    });
  })
  .transform((value) =>
    value.startsWith("+251") ? value : "+251" + value.slice(1),
  );

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),

    email: z.email(),

    phoneNumber: phoneSchema,

    universityId: z
      .string()
      .refine(
        (v) => /^ets\d{4}\/\d+$/i.test(v),
        "Invalid format. Expected ETS0000/00",
      ),

    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export type SignUpInput = z.infer<typeof signUpSchema>;
