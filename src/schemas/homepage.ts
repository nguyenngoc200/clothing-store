import { z } from 'zod';

export const advertisementSchema = z.object({ title: z.string().optional() });
export const heroBoxSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  buttonText: z.string().optional(),
  images: z.array(z.string()).optional(), // Array of image URLs
});
export const heroSchema = z.object({
  boxOne: heroBoxSchema.optional(),
  boxTwo: heroBoxSchema.optional(),
});
export const brandSchema = z.object({
  image: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});
export const iconicImageItemSchema = z.object({
  url: z.string(),
  title: z.string().optional(),
});

export const iconicSchema = z.object({
  title: z.string().optional(),
  images: z.array(iconicImageItemSchema).optional(), // Array of image items with titles (max 4)
  products: z.array(z.any()).optional(),
  boxFooter: z
    .object({ title: z.string().optional(), buttonText: z.string().optional() })
    .optional(),
});
export const shoesSchema = z.object({
  title: z.string().optional(),
  products: z.array(z.any()).optional(),
});
export const stylingSchema = z.union([
  z.array(z.string()), // Array of product IDs
  z
    .object({
      title: z.string().optional(),
      url: z.string().optional(),
      description: z.string().optional(),
      buttonText: z.string().optional(),
    })
    .optional(),
]);

export const categoryItemSchema = z.object({
  label: z.string(),
});

export const categorySchema = z.array(categoryItemSchema);

export const productsSchema = z.array(z.string()); // Array of product IDs

export const whatshotSchema = z.array(z.string()); // Array of product IDs

export const sectionSchema = z.object({
  section_id: z.string(),
  label: z.string(),
  data: z
    .union([
      advertisementSchema,
      heroSchema,
      brandSchema,
      iconicSchema,
      shoesSchema,
      stylingSchema,
      categorySchema,
      productsSchema,
      whatshotSchema,
      z.array(z.any()),
    ])
    .optional(),
});

export const formSchema = z.object({ sections: z.array(sectionSchema) });

export type FormSchema = z.infer<typeof formSchema>;
export type SectionSchema = z.infer<typeof sectionSchema>;

export default formSchema;

// A single homepage row's data can be either the legacy { sections: [...] }
// payload, or a per-tab Section object. Provide a schema to validate both.
export const homepageRowDataSchema = z.array(
  z.object({
    tab: z.string(),
    data: z
      .union([
        advertisementSchema,
        heroSchema,
        brandSchema,
        iconicSchema,
        shoesSchema,
        stylingSchema,
        categorySchema,
        productsSchema,
        whatshotSchema,
        z.array(z.any()),
      ])
      .optional(),
  }),
);
export type HomepageRowData = z.infer<typeof homepageRowDataSchema>;
