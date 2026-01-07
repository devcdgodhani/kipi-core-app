# Kipi Core App - Development Rules

This directory contains comprehensive development rules and guidelines for the Kipi Core App project.

## 📁 Rule Files Location

Each application has its own `.rules` directory containing relevant development standards:

### Backend (`backend/.rules/`)
- `README.md` - Master index
- `backend_rules.md` - Backend development standards

### Customer App (`customer/.rules/`)
- `README.md` - Master index
- `frontend_rules.md` - React/TypeScript frontend standards
- `design_rules.md` - UI/UX design system

### Admin App (`admin/.rules/`)
- `README.md` - Master index
- `frontend_rules.md` - React/TypeScript frontend standards
- `design_rules.md` - UI/UX design system

### Root (`.rules/`)
- `system_analysis.md` - Complete system architecture documentation

## 🎯 Quick Start

1. **New to the project?** Start with `system_analysis.md` in the root `.rules` directory
2. **Backend development?** Read `backend/.rules/backend_rules.md`
3. **Frontend development?** Read `customer/.rules/frontend_rules.md` or `admin/.rules/frontend_rules.md`
4. **UI/UX design?** Read `customer/.rules/design_rules.md` or `admin/.rules/design_rules.md`

## 📋 What's Covered

### Backend Rules
- Project structure and file organization
- Model/Service/Controller/Route patterns
- API design standards
- Validation with Zod
- Security best practices
- Database best practices

### Frontend Rules
- Component architecture
- State management (Redux & Context)
- Service layer and API integration
- Form handling
- Performance optimization
- TypeScript best practices

### Design Rules
- Design system (colors, typography, spacing)
- Component patterns
- Responsive design
- Theme management (light/dark mode)
- Accessibility guidelines
- User experience best practices

## 🔑 Key Principles

1. **Consistency** - Follow established patterns
2. **Type Safety** - Use TypeScript strictly
3. **Validation** - Validate all inputs
4. **Security** - Never expose sensitive data
5. **Accessibility** - Design for all users
6. **Performance** - Optimize for speed
7. **Theme Support** - All colors must work in light and dark mode

## 💡 Usage

When creating new features, always reference the relevant rule files to ensure consistency with the existing codebase.

**Example Workflow**:
1. Check `backend_rules.md` for backend patterns
2. Check `frontend_rules.md` for component patterns
3. Check `design_rules.md` for UI implementation
4. Follow the templates and conventions

## 📞 Questions?

Refer to the `README.md` in each `.rules` directory for detailed navigation and quick references.
