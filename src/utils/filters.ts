import { getCollection } from 'astro:content';

export interface FilterOptions {
  search?: string;
  categories?: string[];
  tags?: string[];
  authors?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  featured?: boolean;
  hasQuiz?: boolean;
  readingTime?: string;
  sort?: string;
}

export interface FilterResult {
  posts: any[];
  totalCount: number;
  filteredCount: number;
  appliedFilters: FilterOptions;
}

// Lấy tất cả tags
export async function getAllTags() {
  const posts = await getCollection('blog');
  const allTags = new Set<string>();
  
  posts.forEach(post => {
    post.data.tags.forEach(tag => allTags.add(tag.toLowerCase()));
  });
  
  return Array.from(allTags).sort();
}

// Lấy tags với số lượng bài viết
export async function getTagsWithCount() {
  const posts = await getCollection('blog');
  const tagCounts = new Map<string, number>();
  
  posts.forEach(post => {
    post.data.tags.forEach(tag => {
      const normalizedTag = tag.toLowerCase();
      tagCounts.set(normalizedTag, (tagCounts.get(normalizedTag) || 0) + 1);
    });
  });
  
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}

// Lấy categories với số lượng bài viết
export async function getAllCategoriesWithPosts() {
  const posts = await getCollection('blog');
  const categoryStats = new Map<string, { count: number; posts: any[] }>();
  
  posts.forEach(post => {
    const category = post.data.category;
    if (!categoryStats.has(category)) {
      categoryStats.set(category, { count: 0, posts: [] });
    }
    const stats = categoryStats.get(category)!;
    stats.count++;
    stats.posts.push(post);
  });
  
  return Array.from(categoryStats.entries()).map(([key, stats]) => ({
    key,
    name: getCategoryName(key),
    postCount: stats.count,
    posts: stats.posts
  }));
}

// Lấy authors với số lượng bài viết
export async function getAllAuthors() {
  const posts = await getCollection('blog');
  const authorStats = new Map<string, { count: number; posts: any[] }>();
  
  posts.forEach(post => {
    const author = post.data.author;
    if (!authorStats.has(author)) {
      authorStats.set(author, { count: 0, posts: [] });
    }
    const stats = authorStats.get(author)!;
    stats.count++;
    stats.posts.push(post);
  });
  
  return Array.from(authorStats.entries()).map(([key, stats]) => ({
    key,
    name: getAuthorName(key),
    postCount: stats.count,
    posts: stats.posts
  }));
}

// Tìm bài viết liên quan dựa trên tags chung
export function findRelatedPosts(currentPost: any, allPosts: any[], limit: number = 3) {
  const currentTags = new Set(currentPost.data.tags.map(t => t.toLowerCase()));
  
  return allPosts
    .filter(post => post.slug !== currentPost.slug)
    .map(post => {
      const postTags = new Set(post.data.tags.map(t => t.toLowerCase()));
      const commonTags = [...currentTags].filter(tag => postTags.has(tag));
      return { post, commonTags: commonTags.length };
    })
    .filter(item => item.commonTags > 0)
    .sort((a, b) => b.commonTags - a.commonTags)
    .slice(0, limit)
    .map(item => item.post);
}

// Helper functions
function getCategoryName(key: string): string {
  const categoryMap: Record<string, string> = {
    'data-analytics-bi': 'Data Analytics & Business Intelligence',
    'data-engineering-infra': 'Data Engineering & Infrastructure',
    'data-science-ml': 'Data Science & Machine Learning',
    'generative-ai-llm': 'Generative AI & Large Language Models',
    'automation-workflow': 'Automation & Workflow Optimization',
    'life-career-skills': 'Life, Career & Other Skills'
  };
  return categoryMap[key] || key;
}

function getAuthorName(key: string): string {
  // Có thể load từ authors collection
  return key;
} 