/**
 * Field helpers shared by all document types. Keep in sync with src/content/schema.ts (zod),
 * which validates the same shapes when the site is built.
 */
import { defineArrayMember, defineField } from 'sanity';

export const ICONS = ['wordpress', 'cart', 'wrench', 'code', 'server', 'book', 'search', 'chat', 'check', 'spark', 'ai'];

export const languageField = defineField({
  name: 'language',
  type: 'string',
  readOnly: true,
  hidden: true,
});

export const translationKeyField = defineField({
  name: 'translationKey',
  title: 'Translation key',
  description: 'Same value on the TR and EN versions of this document (used for hreflang).',
  type: 'string',
  validation: (r) => r.required(),
});

export const imageField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'image',
    options: { hotspot: true },
    fields: [defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: (r) => r.required() })],
    validation: (r) => r.required(),
  });

export const linkField = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: 'object',
    fields: [
      defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
      defineField({
        name: 'href',
        type: 'string',
        description: 'Internal path (/…), https:// URL, mailto: or #anchor',
        validation: (r) => r.required().regex(/^(\/|https:\/\/|mailto:|#)/),
      }),
    ],
  });

export const linkMember = defineArrayMember({
  type: 'object',
  fields: [
    defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'href', type: 'string', validation: (r) => r.required().regex(/^(\/|https:\/\/|mailto:|#)/) }),
  ],
});

export const seoField = defineField({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  fields: [
    defineField({ name: 'title', type: 'string', validation: (r) => r.max(70) }),
    defineField({ name: 'description', type: 'text', rows: 3, validation: (r) => r.max(170) }),
  ],
});

export const portableTextField = (name = 'body', title = 'Body') =>
  defineField({
    name,
    title,
    type: 'array',
    of: [

      defineArrayMember({
        type: 'block',
        styles: [
          { title: 'Normal', value: 'normal' },
          { title: 'H2', value: 'h2' },
          { title: 'H3', value: 'h3' },
          { title: 'Quote', value: 'blockquote' },
        ],
        lists: [
          { title: 'Bullet', value: 'bullet' },
          { title: 'Numbered', value: 'number' },
        ],
        marks: {
          decorators: [
            { title: 'Strong', value: 'strong' },
            { title: 'Emphasis', value: 'em' },
            { title: 'Code', value: 'code' },
          ],
          annotations: [
            {
              name: 'link',
              type: 'object',
              title: 'Link',
              fields: [
                defineField({
                  name: 'href',
                  type: 'string',
                  validation: (r) => r.required().regex(/^(\/|https:\/\/|mailto:|#)/),
                }),
              ],
            },
          ],
        },
      }),
    ],
  });

export const slugField = (source = 'title') =>
  defineField({ name: 'slug', type: 'slug', options: { source, maxLength: 96 }, validation: (r) => r.required() });
