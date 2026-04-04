import { config, collection, fields } from '@keystatic/core';

const useGithub = !import.meta.env.DEV || import.meta.env.PUBLIC_KEYSTATIC_STORAGE === 'github';

const storage = useGithub
  ? {
      kind: 'github' as const,
      repo: {
        owner: import.meta.env.PUBLIC_GITHUB_REPO_OWNER ?? '',
        name: import.meta.env.PUBLIC_GITHUB_REPO_NAME ?? '',
      },
    }
  : { kind: 'local' as const };

export default config({
  storage,
  collections: {
    posts: collection({
      label: 'Статьи',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Заголовок' } }),
        date: fields.date({ label: 'Дата публикации', defaultValue: { kind: 'today' } }),
        cover: fields.image({
          label: 'Обложка',
          directory: 'public/images/posts',
          publicPath: '/images/posts',
        }),
        excerpt: fields.text({ label: 'Краткое описание', multiline: true }),
        content: fields.markdoc({ label: 'Контент' }),
      },
    }),
    products: collection({
      label: 'Материалы',
      slugField: 'title',
      path: 'src/content/products/*',
      format: 'json',
      schema: {
        title: fields.slug({ name: { label: 'Название' } }),
        description: fields.text({ label: 'Описание', multiline: true }),
        price: fields.number({ label: 'Цена (руб.)' }),
        cover: fields.image({
          label: 'Обложка',
          directory: 'public/images/products',
          publicPath: '/images/products',
        }),
      },
    }),
  },
});
