# Technical Context: kythuatdulieu

## Technology Stack

### Core Framework
- **Astro**: 5.11.0 - Static site generator
- **Node.js**: 18.x - Runtime environment
- **npm**: Package manager

### Content & Styling
- **MDX**: Enhanced markdown with React components
- **Markdown**: Primary content format
- **CSS**: Component-scoped styling
- **Sharp**: Image optimization library

### SEO & Syndication
- **@astrojs/sitemap**: 3.4.1 - Automatic sitemap generation
- **@astrojs/rss**: 4.0.12 - RSS feed generation
- **OpenGraph**: Social media meta tags
- **Twitter Cards**: Twitter-specific meta tags

### Deployment
- **GitHub Pages**: Static site hosting
- **GitHub Actions**: CI/CD automation
- **Actions/checkout**: Repository checkout
- **Actions/setup-node**: Node.js setup
- **Actions/upload-pages-artifact**: Artifact upload
- **Actions/deploy-pages**: Pages deployment

## Development Setup

### Prerequisites
- Node.js 18.x or higher
- npm 8.x or higher
- Git for version control
- GitHub account for deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration
- **Development**: `localhost:4321`
- **Production**: `https://kythuatdulieu.github.io/kythuatdulieu`
- **Base path**: `/kythuatdulieu`

## Dependencies

### Production Dependencies
```json
{
  "@astrojs/mdx": "^4.3.0",
  "@astrojs/rss": "^4.0.12", 
  "@astrojs/sitemap": "^3.4.1",
  "astro": "^5.11.0",
  "sharp": "^0.34.2"
}
```

### Development Dependencies
- TypeScript configuration
- Astro CLI tools

## Build Configuration

### Astro Config
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

### TypeScript Config
- Strict type checking enabled
- Module resolution for ES modules
- Astro-specific type definitions

## Deployment Architecture

### GitHub Actions Workflow
- **Trigger**: Push to main branch
- **Environment**: Ubuntu latest
- **Node.js**: Version 18
- **Cache**: npm dependencies
- **Build**: Static site generation
- **Deploy**: GitHub Pages with artifacts

### Build Process
1. Checkout repository
2. Setup Node.js 18
3. Install dependencies with npm ci
4. Build Astro project
5. Upload build artifacts
6. Deploy to GitHub Pages

### Artifact Management
- **Source**: `./dist` directory
- **Upload**: Using `actions/upload-pages-artifact@v3`
- **Deploy**: Using `actions/deploy-pages@v4`

## Performance Optimization

### Build Optimizations
- Static site generation
- Custom assets directory (`_astro`)
- Image optimization with Sharp
- CSS minification
- JavaScript bundling

### Caching Strategy
- GitHub Actions dependency caching
- Browser asset caching via custom directory
- CDN caching through GitHub Pages

### Performance Targets
- Lighthouse Performance: 100/100
- Lighthouse SEO: 100/100
- Lighthouse Accessibility: 100/100
- Lighthouse Best Practices: 100/100

## Security Considerations

### GitHub Actions Security
- Minimal required permissions
- ID token for authentication
- Concurrency control to prevent conflicts
- No secrets in workflow files

### Content Security
- Static site generation (no server-side code)
- No user input processing
- Secure asset delivery through GitHub Pages

## Monitoring & Analytics

### Performance Monitoring
- Lighthouse CI integration (future)
- GitHub Pages analytics
- Core Web Vitals tracking

### Error Tracking
- GitHub Actions workflow monitoring
- Build failure notifications
- Deployment status tracking 