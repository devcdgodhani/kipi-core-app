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

## 📝 Module Documentation Rule

### **CRITICAL: All Modules Must Have Implementation Plan Flows**

When developing any new module or feature, you MUST create a directory inside `implementation_plan_flows/` with the module name and document all flows.

**Structure**:
```
implementation_plan_flows/
└── {module-name}/
    ├── README.md                    # Module overview
    ├── implementation-plan.md       # Detailed implementation plan
    ├── api-flows.md                 # API endpoint flows
    ├── ui-flows.md                  # User interface flows
    ├── database-schema.md           # Database models and relationships
    └── testing-plan.md              # Testing strategy
```

**Example**:
```
implementation_plan_flows/
└── product-management/
    ├── README.md
    ├── implementation-plan.md
    ├── api-flows.md
    ├── ui-flows.md
    ├── database-schema.md
    └── testing-plan.md
```

**What to Document**:
1. **Module Overview** - Purpose, scope, and requirements
2. **Implementation Plan** - Step-by-step development plan
3. **API Flows** - All endpoints, request/response formats, authentication
4. **UI Flows** - User journeys, component hierarchy, state management
5. **Database Schema** - Models, relationships, indexes, migrations
6. **Testing Plan** - Unit tests, integration tests, E2E tests

**When to Create**:
- Before starting development on any new module
- When adding major features to existing modules
- When refactoring significant portions of code

**Benefits**:
- Clear documentation for future developers
- Easy onboarding for new team members
- Reference for debugging and maintenance
- Historical record of design decisions
- Facilitates code reviews

**Template Files**:
See `implementation_plan_flows/_template/` for starter templates.

---

## 💡 Usage

When creating new features, always reference the relevant rule files to ensure consistency with the existing codebase.

**Example Workflow**:
1. Check `backend_rules.md` for backend patterns
2. Check `frontend_rules.md` for component patterns
3. Check `design_rules.md` for UI implementation
4. Follow the templates and conventions

## 📞 Questions?

Refer to the `README.md` in each `.rules` directory for detailed navigation and quick references.
