# 🤝 Contributing Guide

Thank you for considering contributing to the Currency Exchange API!

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- Git

### Setup
1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/currency-exchange-api.git
   cd currency-exchange-api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Development Workflow

### 1. Make Your Changes
- Keep changes focused and atomic
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 2. Test Your Changes
```bash
# Start the server
npm run dev

# In another terminal, test the API
./test-api.sh

# Or manually test specific endpoints
curl http://localhost:3000/quotes
```

### 3. Commit Your Changes
We follow conventional commits:
```bash
git commit -m "feat: add new scraper for XYZ source"
git commit -m "fix: correct slippage calculation"
git commit -m "docs: update API documentation"
```

Commit types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```
Then create a Pull Request on GitHub.

## 🎯 Contribution Ideas

### Add New Scrapers
Create a new scraper for additional currency sources:

1. Create file: `src/scrapers/{region}/{source-name}.js`
2. Implement the scraper class:
   ```javascript
   class NewScraper {
     constructor() {
       this.source = 'https://example.com';
       this.name = 'Example';
     }

     async scrape() {
       // Your scraping logic
       return {
         buy_price: buyPrice,
         sell_price: sellPrice,
         source: this.source,
       };
     }
   }

   module.exports = new NewScraper();
   ```
3. Add to `src/services/scraper.service.js`
4. Test thoroughly
5. Update documentation

### Add New Regions
Support additional currencies:

1. Create directory: `src/scrapers/{new-region}/`
2. Add scrapers for that region
3. Update `scraper.service.js`
4. Update documentation

### Improve Error Handling
- Add more specific error types
- Improve error messages
- Add retry logic
- Better logging

### Add Tests
- Unit tests for individual scrapers
- Integration tests for API endpoints
- Load testing
- Mock external sources for testing

### Enhance Features
- Add rate limiting
- Implement API authentication
- Add GraphQL support
- Create admin dashboard
- Add WebSocket support for real-time updates

## 📋 Code Style Guidelines

### JavaScript Style
- Use ES6+ features
- Use `const` and `let`, avoid `var`
- Use async/await over promises
- Use arrow functions for callbacks
- Use template literals for strings

### Naming Conventions
- Files: `kebab-case.js`
- Classes: `PascalCase`
- Functions/variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### File Structure
```javascript
// 1. Imports
const express = require('express');
const config = require('./config');

// 2. Class or function definitions
class MyService {
  // ...
}

// 3. Exports
module.exports = MyService;
```

### Comments
```javascript
// Good: Explain WHY, not WHAT
// Retry with exponential backoff to handle rate limiting
await retry(fn, { attempts: 3 });

// Bad: Obvious comment
// Loop through array
array.forEach(item => {});
```

## 🧪 Testing Guidelines

### Before Submitting PR
- [ ] Code runs without errors
- [ ] All endpoints return expected responses
- [ ] No console.log statements (use logger)
- [ ] Environment variables are documented
- [ ] README updated if needed
- [ ] No sensitive data in commits

### Manual Testing
```bash
# Start server
npm run dev

# Test all endpoints
curl http://localhost:3000/health
curl http://localhost:3000/quotes
curl http://localhost:3000/average
curl http://localhost:3000/slippage
```

## 📚 Documentation

Update documentation when:
- Adding new features
- Changing API endpoints
- Modifying configuration
- Adding dependencies

Files to update:
- `README.md`: Main documentation
- `API_DOCUMENTATION.md`: API reference
- `ARCHITECTURE.md`: System design changes

## 🐛 Reporting Bugs

### Before Reporting
1. Check if bug is already reported
2. Test on latest version
3. Reproduce the issue

### Bug Report Template
```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Step one
2. Step two
3. ...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Ubuntu 22.04]
- Node.js version: [e.g., 18.0.0]
- Region: [e.g., ARS]

**Logs**
```
Paste relevant logs here
```
```

## 💡 Feature Requests

We welcome feature requests! Please:
1. Check if feature is already requested
2. Explain the use case
3. Describe expected behavior
4. Consider implementation complexity

## 🔍 Code Review Process

PRs will be reviewed for:
- Code quality and style
- Test coverage
- Documentation
- Breaking changes
- Performance impact

## 📞 Getting Help

- Open an issue for bugs
- Start a discussion for questions
- Check existing documentation first

## 🙏 Thank You!

Every contribution helps make this project better. We appreciate your time and effort!

---

**Happy Coding!** 🚀
