import { getCollection } from 'astro:content';

export async function GET() {
  const docs = await getCollection('docs');
  const concepts = {};

  for (const doc of docs) {
    if (doc.id === 'index.mdx' || doc.id.startsWith('quizzes/')) continue;
    
    // Fallback to auto-generating description if it doesn't exist
    let definition = doc.data.description || doc.data.definition || "";
    
    if (!definition) {
      // Very crude fallback: take first 150 chars of body
      const bodyClean = doc.body.replace(/[#*`>[\]-]/g, '').trim();
      definition = bodyClean.substring(0, 150) + "...";
    }

    // Determine category from path
    const parts = doc.id.split('/');
    let category = "Khái niệm";
    if (parts.length > 1) {
      // Map root folders to nice category names
      const folderMap = {
        'concepts': 'Cốt lõi',
        'interview': 'Phỏng vấn',
        'learning-paths': 'Lộ trình',
        'projects': 'Dự án E2E'
      };
      category = folderMap[parts[0]] || parts[0];
    }

    concepts[doc.id] = {
      title: doc.data.title,
      category: category,
      definition: definition,
      url: `/${doc.slug}/`
    };
  }

  return new Response(
    JSON.stringify({ concepts }), 
    {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    }
  );
}
