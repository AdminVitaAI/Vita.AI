# Contributing to Vita.AI

Thank you for your interest in contributing to Vita.AI! We welcome contributions from the community and are excited to see what you'll bring to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.8+
- Git
- OpenAI API key (for AI features)

### Setting Up Your Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Vita.AI.git
   cd Vita.AI
   ```

3. **Set up the backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   export OPENAI_API_KEY="your-api-key"
   python src/main.py
   ```

4. **Set up the frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🛠️ Development Workflow

### Branch Naming Convention

- `feature/feature-name` - for new features
- `bugfix/bug-description` - for bug fixes
- `docs/documentation-update` - for documentation updates
- `refactor/component-name` - for code refactoring

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

Examples:
- `feat(auth): add user registration with email verification`
- `fix(api): resolve nutrition calculation error`
- `docs(readme): update installation instructions`

### Pull Request Process

1. **Create a new branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit them:
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

3. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Screenshots (if UI changes)
   - Testing instructions
   - Link to related issues

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Manual Testing
- Test all new features thoroughly
- Verify responsive design on different screen sizes
- Test Arabic language support
- Ensure AI features work correctly

## 📝 Code Style

### Frontend (React/JavaScript)
- Use **ESLint** and **Prettier** for code formatting
- Follow **React Hooks** patterns
- Use **functional components** over class components
- Write **meaningful component names** and **prop types**

### Backend (Python/Flask)
- Follow **PEP 8** style guidelines
- Use **type hints** where appropriate
- Write **docstrings** for functions and classes
- Keep **functions small** and **focused**

### General Guidelines
- Write **clear, self-documenting code**
- Add **comments** for complex logic
- Use **meaningful variable names**
- Keep **files organized** and **modular**

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Bug description** - What happened?
2. **Expected behavior** - What should have happened?
3. **Steps to reproduce** - How can we reproduce the issue?
4. **Environment details** - OS, browser, versions
5. **Screenshots** - If applicable
6. **Error messages** - Full error logs

Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).

## 💡 Suggesting Features

We love feature suggestions! Please include:

1. **Feature description** - What do you want to see?
2. **Use case** - Why is this feature needed?
3. **Proposed solution** - How should it work?
4. **Alternatives considered** - Other approaches you've thought of
5. **Additional context** - Screenshots, mockups, etc.

Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

## 🎯 Areas for Contribution

### High Priority
- **Mobile responsiveness** improvements
- **Performance optimizations**
- **Accessibility** enhancements
- **Test coverage** expansion
- **Documentation** improvements

### Features We'd Love
- **Meal planning** functionality
- **Recipe suggestions**
- **Social features** (sharing, challenges)
- **Data export/import**
- **Integration** with fitness trackers
- **Multi-language** support

### Technical Improvements
- **Code refactoring**
- **Database optimizations**
- **API improvements**
- **Security enhancements**
- **CI/CD pipeline** setup

## 📚 Resources

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Design Resources
- [Figma Design System](link-to-figma) (if available)
- [Brand Guidelines](docs/brand-guidelines.md)
- [UI Component Library](docs/components.md)

## 🤝 Community

### Communication Channels
- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Email** - contact@vita-ai.app for private matters

### Code of Conduct
We are committed to providing a welcoming and inclusive environment. Please read our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🏆 Recognition

Contributors will be:
- **Listed** in our README
- **Mentioned** in release notes
- **Invited** to our contributors' Discord (if available)
- **Eligible** for contributor swag (when available)

## ❓ Questions?

Don't hesitate to ask! You can:
- **Open an issue** with the "question" label
- **Start a discussion** on GitHub
- **Email us** at developers@vita-ai.app

Thank you for contributing to Vita.AI! 🙏

