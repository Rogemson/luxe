# CONTRIBUTING.md - Contributing Guidelines

Thank you for your interest in contributing to LUXE! This document provides guidelines and instructions for contributing to the project.

---

## 🤝 Code of Conduct

Be respectful, inclusive, and professional in all interactions.

---

## 📋 Before You Start

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature
4. Make your changes
5. Write/update tests
6. Submit a Pull Request

---

## 🚀 Getting Started

### **Setup Development Environment**

```bash
# Clone the repository
git clone https://github.com/yourusername/luxe.git
cd luxe

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local

# Fill in your Shopify credentials

# Start development
npm run dev
```

### **Branch Naming Convention**

```bash
# Features
git checkout -b feature/add-wishlist-feature

# Bug fixes
git checkout -b fix/cart-persistence-bug

# Documentation
git checkout -b docs/update-readme

# Performance
git checkout -b perf/optimize-images
```

---

## 📝 Commit Message Guidelines

Follow conventional commits:

```
type(scope): subject

body

footer
```

### **Types**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (formatting, missing semicolons, etc)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, etc

### **Examples**

```bash
# Good
git commit -m "feat(cart): add coupon support"
git commit -m "fix(auth): prevent token expiration on refresh"
git commit -m "docs(readme): update deployment section"

# Bad
git commit -m "fixed stuff"
git commit -m "updates"
git commit -m "asdfgh"
```

---

## ✅ Testing Requirements

All contributions MUST include tests. No exceptions!

### **Writing Tests**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

describe('YourFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something specific', () => {
    const result = yourFunction()
    expect(result).toBe(expectedValue)
  })

  it('should handle edge case', () => {
    const result = yourFunction(edgeCase)
    expect(result).toThrow()
  })
})
```

### **Running Tests**

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage

# Specific test file
npm run test -- useCart.test.ts
```

### **Test Coverage Requirements**

- Minimum 75% coverage
- All new features must have tests
- All bug fixes should have regression tests

---

## 🎨 Code Style Guidelines

### **TypeScript**

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  firstName: string
  lastName: string
}

const getUser = async (id: string): Promise<User> => {
  const response = await fetch(`/api/users/${id}`)
  return response.json()
}

// ❌ Bad
interface User {
  id: any
  email: any
}

const getUser = async (id) => {
  const response = await fetch(`/api/users/${id}`)
  const data = response.json()
  return data
}
```

### **React Components**

```typescript
// ✅ Good
interface CartItemProps {
  id: string
  name: string
  price: number
  onRemove: (id: string) => void
}

const CartItem: React.FC<CartItemProps> = ({
  id,
  name,
  price,
  onRemove,
}) => {
  return (
    <div>
      <h3>{name}</h3>
      <p>${price}</p>
      <button onClick={() => onRemove(id)}>Remove</button>
    </div>
  )
}

// ❌ Bad
const CartItem = ({ item, onRemove }) => {
  return (
    <div>
      <h3>{item.name}</h3>
      <p>${item.price}</p>
      <button onClick={() => onRemove(item)}>Remove</button>
    </div>
  )
}
```

### **File Organization**

```
components/
├── CartItem.tsx           # Component
├── CartItem.test.tsx      # Tests (co-located)
├── useCartItem.ts         # Hook (if needed)
└── index.ts              # Export
```

### **Naming Conventions**

```typescript
// Files
- components/ProductCard.tsx
- hooks/useCart.ts
- lib/shopify-client.ts
- types/product.ts

// Functions
- const handleClick = () => {}
- const fetchProducts = async () => {}
- const useProductVariants = () => {}

// Variables
- const isLoading = true
- const userId = "123"
- const cart: Cart[] = []
```

---

## 🔍 Code Review Checklist

Before submitting a PR, ensure:

- [ ] **Functionality** - Feature works as intended
- [ ] **Tests** - All tests pass, new tests added
- [ ] **Types** - No `any` types, full TypeScript coverage
- [ ] **Documentation** - Comments for complex logic
- [ ] **Performance** - No unnecessary renders/queries
- [ ] **Security** - No hardcoded secrets
- [ ] **Accessibility** - ARIA labels, semantic HTML
- [ ] **Mobile** - Responsive design verified
- [ ] **Lint** - No ESLint warnings
- [ ] **Formatting** - Prettier formatted

---

## 📤 Pull Request Process

### **1. Create Pull Request**

```bash
git push origin feature/your-feature
```

### **2. Fill PR Template**

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed:
- [ ] Unit tests added
- [ ] Component tests added
- [ ] Tested locally in dev mode
- [ ] Tested in production build

## Screenshots/Recordings (if applicable)
Add screenshots or links to demos

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] Tests pass (npm run test)
- [ ] No console errors/warnings
- [ ] Documentation is updated
- [ ] No breaking changes (or documented)

## Related Issues
Closes #123
```

### **3. Code Review**

- Maintainers will review your PR
- Address any requested changes
- Once approved, PR will be merged

---

## 🐛 Reporting Bugs

### **Bug Report Template**

```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS, Windows]
- Browser: [e.g. Chrome, Safari]
- Version: [e.g. 1.0.0]

## Screenshots
Attach screenshots if applicable

## Additional Context
Any other context
```

---

## 🎯 Feature Request Template

```markdown
## Problem Statement
Describe the problem this solves

## Proposed Solution
Describe your proposed solution

## Alternative Solutions
List alternative approaches

## Additional Context
Why is this feature important?
Who would benefit?
```

---

## 📚 Documentation

### **When to Update Docs**

- ✅ New features
- ✅ API changes
- ✅ Configuration changes
- ✅ Performance improvements
- ✅ Breaking changes

### **Documentation Style**

```markdown
## Feature Name

Brief description.

### Usage

```typescript
// Code example
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prop` | `string` | `'default'` | What it does |
```

---

## 🔐 Security

If you find a security vulnerability:

1. **Do NOT** open a public issue
2. Email security details privately
3. Include steps to reproduce
4. Wait for confirmation before disclosure

---

## 📞 Getting Help

- **Questions?** Open a Discussion
- **Bug?** Open an Issue
- **Feature?** Open an Issue with "enhancement" label
- **Chat?** Check out our Discord (if applicable)

---

## 🙏 Appreciation

Thank you for contributing to LUXE! Your efforts help make this project better for everyone.

**Happy coding! 🚀**