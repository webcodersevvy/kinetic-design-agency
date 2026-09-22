import * as z from 'zod';

export const site = {
  name: 'KINETIC®',
  title: 'KINETIC® — Design & Motion Agency — New York City',
  description:
    'KINETIC is an independent design & motion agency in New York City. We make brands move — identity, motion, interactive & 3D.',
  url: 'https://kinetic-design-agency.vercel.app',
  locale: 'en_US',
  address: '148 Grand St, 4th Floor, New York, NY 10013',
  email: 'hello-kineticagency@outlook.com',
  phone: '+1 212 555 0147',
  coords: '40.7128°N / 74.0060°W',
} as const;

export const ContactSchema = z.object({
  name: z.string({ error: 'Name is required' }).min(2, { error: 'Name must be at least 2 characters' }).max(80),
  email: z.email({ error: 'Enter a valid email' }),
  budget: z.enum(['$20k – $35k', '$35k – $75k', '$75k – $150k', '$150k+']),
  timeline: z.enum(['ASAP', '1–2 months', '3+ months']),
  message: z.string({ error: 'Tell us about the project' }).min(10, { error: 'Tell us a little more (10+ chars)' }).max(2000),
});
export type ContactInput = z.infer<typeof ContactSchema>;

export const WorkCategory = z.enum(['branding', 'motion', 'web']);
export type WorkCategory = z.infer<typeof WorkCategory>;

export const workSchema = z.object({
  title: z.string(),
  client: z.string(),
  year: z.string(),
  categories: z.array(WorkCategory),
  tag: z.string(),
  tagDark: z.string(),
  excerpt: z.string(),
  cover: z.url(),
  coverAlt: z.string(),
  featured: z.boolean().default(false),
  views: z.string().optional(),
});
export type WorkMeta = z.infer<typeof workSchema>;

export const journalSchema = z.object({
  title: z.string(),
  category: z.string(),
  minutes: z.string(),
  excerpt: z.string(),
  cover: z.url(),
  coverAlt: z.string(),
  date: z.string(),
});
export type JournalMeta = z.infer<typeof journalSchema>;

export const testimonialSchema = z.object({
  quote: z.string(),
  name: z.string(),
  role: z.string(),
  avatar: z.url(),
});
export type TestimonialMeta = z.infer<typeof testimonialSchema>;
