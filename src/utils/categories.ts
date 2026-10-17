/**
 * Display names for the categories that the API seeds in English. The data stays as the server has it;
 * only what the user reads is translated. Any other (admin-created) category is shown as typed.
 */
const hebrewNames: Record<string, string> = {
  Music: 'מוזיקה',
  Theater: 'תיאטרון',
  Comedy: 'קומדיה',
  Sports: 'ספורט',
  Festival: 'פסטיבל',
};

export const categoryLabel = (name: string) => hebrewNames[name] ?? name;
