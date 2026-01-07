# Development Rules - Master Index

This document serves as the central reference for all development standards, patterns, and best practices for the Kipi Core App project.

---

## 📚 Rule Documents

### 1. [Backend Rules](./backend_rules.md)
**Covers**: Node.js/Express/TypeScript backend development

**Key Topics**:
- Project structure and file organization
- Naming conventions
- Model/Service/Controller/Route patterns
- API design standards
- Validation with Zod
- Security best practices
- Error handling
- Database best practices

**Use When**: Creating or modifying backend APIs, services, models, or controllers

---

### 2. [Frontend Rules](./frontend_rules.md)
**Covers**: React/TypeScript frontend development (Customer & Admin apps)

**Key Topics**:
- Project structure and file organization
- Component architecture
- State management (Redux & Context)
- Service layer and API integration
- Routing patterns
- Form handling
- Performance optimization
- TypeScript best practices

**Use When**: Creating or modifying React components, pages, or frontend logic

---

### 3. [Design Rules](./design_rules.md)
**Covers**: UI/UX design system and patterns

**Key Topics**:
- Design system (colors, typography, spacing)
- Component patterns (buttons, cards, forms, modals)
- Responsive design
- Layout patterns
- Animation & transitions
- Accessibility guidelines
- User experience best practices
- Dark mode support

**Use When**: Designing or implementing UI components and user interfaces

---

### 4. [System Analysis](./system_analysis.md)
**Covers**: Complete system architecture documentation

**Key Topics**:
- Backend architecture (34 models, 41 services, 29 controllers)
- Customer app structure (12 page modules)
- Admin app structure (27 page modules)
- Technology stack
- Module breakdown
- API standards

**Use When**: Understanding the overall system architecture or planning new features

---

## 🎯 Quick Reference

### Creating a New Feature

#### Backend
1. **Model** → Follow [Backend Rules - Model Structure](./backend_rules.md#model-structure)
2. **Service** → Follow [Backend Rules - Service Structure](./backend_rules.md#service-structure)
3. **Controller** → Follow [Backend Rules - Controller Structure](./backend_rules.md#controller-structure)
4. **Routes** → Follow [Backend Rules - Route Structure](./backend_rules.md#route-structure)
5. **Validator** → Follow [Backend Rules - Validator Structure](./backend_rules.md#validator-structure)

#### Frontend
1. **Types** → Define in `types/{feature}.types.ts`
2. **Service** → Follow [Frontend Rules - Service Layer](./frontend_rules.md#service-layer)
3. **Redux Slice** → Follow [Frontend Rules - Redux Slice Template](./frontend_rules.md#redux-slice-template)
4. **Components** → Follow [Frontend Rules - Component Structure](./frontend_rules.md#component-structure)
5. **Pages** → Follow [Frontend Rules - Page Structure](./frontend_rules.md#page-structure)
6. **Routes** → Add to `routes/routeConfig.ts`

### Common Patterns

#### API Endpoint
```
POST /api/v1/customer/{entity}/getAll
GET  /api/v1/customer/{entity}/:id
POST /api/v1/customer/{entity}
PUT  /api/v1/customer/{entity}/:id
DELETE /api/v1/customer/{entity}/deleteByFilter
```

#### Response Format
```typescript
{
  status: number,
  code: string,
  message: string,
  data?: any
}
```

#### Component File Structure
```
ComponentName/
├── ComponentName.tsx
├── ComponentName.types.ts (if complex)
└── index.ts (re-export)
```

---

## 🔍 Finding What You Need

### By Task Type

| Task | Document | Section |
|------|----------|---------|
| Create database model | Backend Rules | Model Structure |
| Create API endpoint | Backend Rules | Controller + Route Structure |
| Create React component | Frontend Rules | Component Structure |
| Design a form | Design Rules | Forms |
| Implement authentication | Backend Rules | Security Rules |
| Add state management | Frontend Rules | State Management |
| Style a component | Design Rules | Component Patterns |
| Make responsive layout | Design Rules | Responsive Design |
| Handle errors | Backend/Frontend Rules | Error Handling |
| Optimize performance | Frontend Rules | Performance Optimization |

### By Technology

| Technology | Document |
|------------|----------|
| MongoDB/Mongoose | Backend Rules |
| Express.js | Backend Rules |
| TypeScript | Backend/Frontend Rules |
| React | Frontend Rules |
| Redux | Frontend Rules |
| Tailwind CSS | Design Rules |
| Zod Validation | Backend Rules |
| Axios | Frontend Rules |

---

## 📋 Development Workflow

### 1. Planning Phase
- Review [System Analysis](./system_analysis.md) for existing architecture
- Check relevant rule documents for patterns
- Design data models and API contracts
- Plan component hierarchy

### 2. Backend Development
- Follow [Backend Rules](./backend_rules.md)
- Create models with proper validation
- Implement services with business logic
- Create controllers with error handling
- Define routes with authentication
- Write validators with Zod

### 3. Frontend Development
- Follow [Frontend Rules](./frontend_rules.md)
- Define TypeScript types
- Create API services
- Implement Redux slices
- Build reusable components
- Create page components
- Add routing

### 4. UI/UX Implementation
- Follow [Design Rules](./design_rules.md)
- Use design system colors and spacing
- Implement responsive layouts
- Add loading and error states
- Ensure accessibility
- Test on multiple devices

### 5. Testing & Review
- Test API endpoints
- Test UI components
- Check responsive design
- Verify accessibility
- Review code against rules
- Test user flows

---

## 🎨 Design System Quick Reference

### Colors
- Primary: `#3B82F6` (Blue)
- Success: `#10B981` (Green)
- Warning: `#F59E0B` (Amber)
- Error: `#EF4444` (Red)

### Spacing
- Small: `0.5rem` (8px)
- Medium: `1rem` (16px)
- Large: `1.5rem` (24px)
- XLarge: `2rem` (32px)

### Border Radius
- Small: `0.25rem` (4px)
- Medium: `0.5rem` (8px)
- Large: `0.75rem` (12px)
- XLarge: `1rem` (16px)

---

## 🔐 Security Checklist

- [ ] All routes use `jwtAuth()` middleware
- [ ] All inputs validated with Zod
- [ ] Passwords hashed with bcrypt
- [ ] Sensitive data not exposed in responses
- [ ] CORS configured properly
- [ ] Rate limiting enabled
- [ ] HTTPS in production
- [ ] Environment variables for secrets

---

## ♿ Accessibility Checklist

- [ ] Semantic HTML used
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation supported
- [ ] Focus states visible
- [ ] Alt text on images
- [ ] Color contrast meets WCAG AA
- [ ] Form labels associated with inputs
- [ ] Error messages accessible

---

## 📱 Responsive Design Checklist

- [ ] Mobile-first approach
- [ ] Tested on mobile (< 640px)
- [ ] Tested on tablet (768px - 1024px)
- [ ] Tested on desktop (> 1024px)
- [ ] Touch targets at least 44px
- [ ] Text readable without zoom
- [ ] No horizontal scrolling
- [ ] Images responsive

---

## 🚀 Performance Checklist

- [ ] Images optimized and lazy loaded
- [ ] Code splitting implemented
- [ ] API responses cached where appropriate
- [ ] Database queries optimized with indexes
- [ ] Pagination for large datasets
- [ ] Debouncing on search inputs
- [ ] Memoization for expensive computations
- [ ] Bundle size optimized

---

## 📝 Code Quality Checklist

- [ ] TypeScript strict mode enabled
- [ ] ESLint passing
- [ ] Prettier formatting applied
- [ ] No console.log in production
- [ ] Meaningful variable names
- [ ] Functions are single-purpose
- [ ] Comments for complex logic only
- [ ] DRY principle followed

---

## 🔄 Git Commit Conventions

```
feat: Add product search functionality
fix: Fix order calculation bug
refactor: Refactor user service
docs: Update API documentation
test: Add tests for cart service
chore: Update dependencies
style: Format code with prettier
perf: Optimize product query
```

---

## 📞 When to Use Each Document

### Backend Rules
- Creating new API endpoints
- Implementing business logic
- Database schema design
- Authentication/authorization
- Error handling

### Frontend Rules
- Building React components
- Managing application state
- Routing and navigation
- API integration
- Form handling

### Design Rules
- Designing user interfaces
- Implementing responsive layouts
- Choosing colors and typography
- Creating consistent components
- Ensuring accessibility

### System Analysis
- Understanding existing architecture
- Planning new features
- Onboarding new developers
- System documentation
- Architecture decisions

---

## 🎓 Learning Path for New Developers

1. **Week 1**: Read [System Analysis](./system_analysis.md)
   - Understand overall architecture
   - Explore codebase structure
   - Review technology stack

2. **Week 2**: Study [Backend Rules](./backend_rules.md)
   - Learn backend patterns
   - Practice creating models/services
   - Understand API design

3. **Week 3**: Study [Frontend Rules](./frontend_rules.md)
   - Learn React patterns
   - Understand state management
   - Practice component creation

4. **Week 4**: Study [Design Rules](./design_rules.md)
   - Learn design system
   - Practice UI implementation
   - Understand UX principles

5. **Ongoing**: Reference all documents as needed during development

---

## 📌 Important Notes

1. **These are guidelines, not strict rules** - Use judgment when exceptions make sense
2. **Keep documents updated** - As patterns evolve, update the rules
3. **Consistency is key** - Following these patterns makes the codebase maintainable
4. **Ask questions** - If unclear, discuss with the team
5. **Contribute improvements** - Suggest better patterns when you find them

---

## 🔗 Related Resources

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)

---

**Last Updated**: 2026-01-07

**Maintained By**: Development Team

**Questions?** Refer to the specific rule document or ask the team.
