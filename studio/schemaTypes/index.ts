import { defineArrayMember, defineField, defineType } from 'sanity';
import {
  ICONS,
  imageField,
  languageField,
  linkField,
  linkMember,
  portableTextField,
  seoField,
  slugField,
  translationKeyField,
} from './shared';

const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site settings',
  type: 'document',
  fields: [
    languageField,
    translationKeyField,
    defineField({ name: 'siteName', type: 'string', validation: (r) => r.required() }),
    defineField({ name: 'tagline', type: 'string' }),
    defineField({ name: 'email', type: 'string', validation: (r) => r.required().email() }),
    defineField({ name: 'city', type: 'string' }),
    defineField({
      name: 'socials',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({ name: 'platform', type: 'string', options: { list: ['instagram', 'linkedin', 'github', 'x'] } }),
            defineField({
              name: 'url',
              type: 'string',
              description: 'Use # until the profile exists',
              validation: (r) => r.required().regex(/^(https:\/\/|#$)/),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'map',
      type: 'object',
      fields: [
        defineField({ name: 'lat', type: 'number' }),
        defineField({ name: 'lng', type: 'number' }),
        defineField({ name: 'zoom', type: 'number', validation: (r) => r.min(3).max(18).integer() }),
        defineField({ name: 'label', type: 'string' }),
      ],
    }),
    defineField({
      name: 'newsletter',
      type: 'object',
      fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'text', type: 'text', rows: 2 })],
    }),
    defineField({ name: 'footerNote', type: 'string' }),
    defineField({
      name: 'seo',
      type: 'object',
      fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'description', type: 'text', rows: 3 })],
    }),
  ],
  preview: { select: { title: 'siteName', subtitle: 'language' } },
});

const navigation = defineType({
  name: 'navigation',
  title: 'Navigation & footer',
  type: 'document',
  fields: [
    languageField,
    translationKeyField,
    defineField({ name: 'header', type: 'array', of: [linkMember] }),
    linkField('cta', 'Header button'),
    defineField({
      name: 'footerColumns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'links', type: 'array', of: [linkMember] })],
        }),
      ],
    }),
    defineField({ name: 'legalLinks', type: 'array', of: [linkMember] }),
  ],
  preview: { select: { subtitle: 'language' }, prepare: ({ subtitle }) => ({ title: 'Navigation', subtitle }) },
});

const homePage = defineType({
  name: 'homePage',
  title: 'Home page',
  type: 'document',
  fields: [
    languageField,
    translationKeyField,
    seoField,
    defineField({
      name: 'hero',
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string' }),
        defineField({ name: 'note', type: 'string' }),
        imageField('image', 'Wide image'),
        imageField('smallImage', 'Small image'),
        defineField({ name: 'tags', type: 'array', of: [defineArrayMember({ type: 'string' })], validation: (r) => r.max(6) }),
      ],
    }),
    defineField({
      name: 'tools',
      type: 'object',
      description: 'Platforms and tools we work with — not clients. Known names show their logo.',
      fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'items', type: 'array', of: [defineArrayMember({ type: 'string' })] })],
    }),
    defineField({
      name: 'intro',
      type: 'object',
      fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'text', type: 'text' }), linkField('cta', 'Button')],
    }),
    defineField({
      name: 'duo',
      type: 'object',
      fields: [
        imageField('first', 'First image'),
        imageField('second', 'Second image'),
        defineField({ name: 'firstTag', type: 'string' }),
        defineField({ name: 'secondTag', type: 'string' }),
        linkField('link', 'Arrow link'),
      ],
    }),
    defineField({
      name: 'approach',
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string' }),
        imageField('image', 'Image'),
        defineField({ name: 'tag', type: 'string' }),
        defineField({
          name: 'items',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'icon', type: 'string', options: { list: ICONS } }),
                defineField({ name: 'title', type: 'string' }),
                defineField({ name: 'text', type: 'text' }),
              ],
            }),
          ],
        }),
        linkField('cta', 'Button'),
      ],
    }),
    defineField({
      name: 'servicesSection',
      type: 'object',
      fields: [defineField({ name: 'title', type: 'string' }), defineField({ name: 'text', type: 'text' })],
    }),
    defineField({
      name: 'process',
      type: 'object',
      fields: [
        defineField({ name: 'title', type: 'string' }),
        defineField({ name: 'text', type: 'text' }),
        defineField({
          name: 'steps',
          type: 'array',
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'title', type: 'string' }),
                defineField({ name: 'text', type: 'text' }),
                defineField({
                  name: 'deliverables',
                  title: 'What the client receives',
                  type: 'array',
                  of: [defineArrayMember({ type: 'string' })],
                }),
              ],
            }),
          ],
          validation: (r) => r.min(3),
        }),
      ],
    }),
    defineField({
      name: 'stats',
      title: 'Figures',
      type: 'object',
      description: 'Two to four short commitments shown as counting numbers. Only use figures you can stand behind.',
      fields: [
        defineField({
          name: 'items',
          type: 'array',
          validation: (r) => r.min(2).max(4),
          of: [
            defineArrayMember({
              type: 'object',
              fields: [
                defineField({ name: 'value', type: 'number', validation: (r) => r.required().integer().min(0) }),
                defineField({ name: 'suffix', type: 'string', description: 'Shown after the number, e.g. " h" or "%".' }),
                defineField({ name: 'label', type: 'string', validation: (r) => r.required() }),
              ],
              preview: { select: { title: 'label', value: 'value', suffix: 'suffix' }, prepare: ({ title, value, suffix }) => ({ title: `${value ?? ''}${suffix ?? ''} — ${title ?? ''}` }) },
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'closing',
      type: 'object',
      fields: [defineField({ name: 'title', type: 'string' }), imageField('image', 'Image'), defineField({ name: 'tag', type: 'string' }), linkField('cta', 'Button')],
    }),
  ],
  preview: { select: { subtitle: 'language' }, prepare: ({ subtitle }) => ({ title: 'Home page', subtitle }) },
});

const service = defineType({
  name: 'service',
  title: 'Service',
  type: 'document',
  fields: [
    languageField,
    translationKeyField,
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    slugField(),
    defineField({ name: 'order', type: 'number', validation: (r) => r.required().integer() }),
    defineField({ name: 'icon', type: 'string', options: { list: ICONS }, validation: (r) => r.required() }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, validation: (r) => r.required().max(220) }),
    imageField('image', 'Image'),
    defineField({ name: 'deliverables', type: 'array', of: [defineArrayMember({ type: 'string' })], validation: (r) => r.min(1) }),
    portableTextField(),
    seoField,
  ],
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'title', subtitle: 'language', media: 'image' } },
});

const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  fields: [
    languageField,
    translationKeyField,
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    slugField(),
    defineField({ name: 'publishedAt', type: 'date', validation: (r) => r.required() }),
    defineField({ name: 'updatedAt', type: 'date' }),
    defineField({ name: 'author', type: 'string', initialValue: 'SUN | WORKS' }),
    defineField({ name: 'excerpt', type: 'text', rows: 3, validation: (r) => r.required().max(260) }),
    imageField('image', 'Cover image'),
    defineField({ name: 'tags', type: 'array', of: [defineArrayMember({ type: 'string' })] }),
    portableTextField(),
    seoField,
  ],
  preview: { select: { title: 'title', subtitle: 'language', media: 'image' } },
});

const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    languageField,
    translationKeyField,
    defineField({ name: 'kind', type: 'string', options: { list: ['contact', 'legal'] }, validation: (r) => r.required() }),
    defineField({ name: 'title', type: 'string', validation: (r) => r.required() }),
    slugField(),
    defineField({ name: 'intro', type: 'text', rows: 3 }),
    portableTextField(),
    defineField({
      name: 'legalReviewRequired',
      title: 'Requires legal review',
      type: 'boolean',
      initialValue: true,
      description: 'Shows a "draft, not legally reviewed" notice on the page.',
    }),
    defineField({ name: 'updatedAt', type: 'date', validation: (r) => r.required() }),
    seoField,
  ],
  preview: { select: { title: 'title', subtitle: 'language' } },
});

export const schemaTypes = [siteSettings, navigation, homePage, service, post, page];
export const translatedTypes = schemaTypes.map((t) => t.name);
