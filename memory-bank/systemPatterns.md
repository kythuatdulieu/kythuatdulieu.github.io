# System Patterns: kythuatdulieu

## Architecture Overview
The kythuatdulieu blog follows a static site generation pattern using Astro, optimized for GitHub Pages deployment.

## Key Technical Decisions

### Static Site Generation
- **Choice**: Astro with static output
- **Rationale**: Fastest possible performance, perfect for blog content
- **Benefits**: No server-side processing, instant page loads, excellent SEO

### Content Management
- **Pattern**: File-based content with frontmatter
- **Structure**: `src/content/blog/` for blog posts
- **Format**: Markdown and MDX for enhanced content
- **Metadata**: YAML frontmatter for post information

### Deployment Strategy
- **Platform**: GitHub Pages
- **Method**: GitHub Actions workflow
- **Trigger**: Push to main branch
- **Artifact**: Static files in `./dist` directory

## Component Architecture

### Layout System
```
src/layouts/
├── BaseLayout.astro      # Main layout wrapper
├── BlogPost.astro        # Blog post specific layout
└── RSSLayout.astro       # RSS feed layout
```

### Page Structure
```
src/pages/
├── index.astro           # Homepage
├── blog/                 # Blog listing
├── rss.xml.js           # RSS feed
└── [slug].astro         # Dynamic blog post pages
```

### Content Collections
```
src/content/
└── blog/
    ├── _schema.ts        # Content validation schema
    └── *.md              # Blog post files
```

## Design Patterns

### Content Rendering
1. **Collection-based**: Use `getCollection()` for content retrieval
2. **Type-safe**: TypeScript schemas for frontmatter validation
3. **SEO-optimized**: Automatic meta tag generation
4. **Performance**: Static generation with no client-side JavaScript

### Asset Management
- **Images**: Stored in `public/` directory
- **CSS**: Component-scoped styles
- **Build assets**: Custom `_astro` directory for better caching

### Routing Strategy
- **File-based routing**: Astro's automatic route generation
- **Dynamic routes**: `[slug].astro` for blog posts
- **Base path**: `/kythuatdulieu` for GitHub Pages compatibility

## Integration Patterns

### MDX Integration
- **Purpose**: Enhanced markdown with React components
- **Usage**: Code blocks, interactive elements, custom components
- **Configuration**: `@astrojs/mdx` integration

### SEO Integration
- **Sitemap**: Automatic generation via `@astrojs/sitemap`
- **RSS**: Feed generation via `@astrojs/rss`
- **Meta tags**: Automatic OpenGraph and Twitter card generation

### Build Optimization
- **Assets**: Custom `_astro` directory for better caching
- **Output**: Static files optimized for CDN delivery
- **Performance**: Lighthouse 100/100 score target

## Development Workflow
1. **Local Development**: `npm run dev` for hot reload
2. **Content Creation**: Add markdown files to `src/content/blog/`
3. **Preview**: `npm run preview` to test build locally
4. **Deploy**: Push to main branch triggers GitHub Actions
5. **Publish**: Automatic deployment to GitHub Pages

## Configuration Patterns

### Astro Configuration
```javascript
export default defineConfig({
  site: 'https://kythuatdulieu.github.io',
  base: '/kythuatdulieu',
  output: 'static',
  build: {
    assets: '_astro'
  }
});
```

### GitHub Actions Pattern
- **Trigger**: Push to main branch
- **Build**: Node.js 18 with npm ci
- **Deploy**: GitHub Pages with artifact upload
- **Concurrency**: Prevents deployment conflicts 