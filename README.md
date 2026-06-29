# npx skills CLI

The Skills CLI (`npx skills`) is the package manager for the open agent skills ecosystem. Skills are modular packages that extend agent capabilities with specialized knowledge, workflows, and tools.

## What is the Skills CLI?

Skills are installable, modular extensions that you can add to your agent to give it new capabilities. Think of them as plugins or tools that your agent can use to help you accomplish specific tasks.

### Key Features

- **Modular**: Each skill is a self-contained package with specific functionality
- **Open Ecosystem**: Skills are community-driven and shareable
- **Easy Installation**: Install skills directly from the command line
- **Browse & Search**: Discover new skills through an interactive UI

## Quick Start

```bash
# Search for skills
npx skills find [query]

# Install a skill from GitHub
npx skills add owner/repo@skill-name

# Check for updates
npx skills check

# Update all installed skills
npx skills update
```

## Common Commands

### Search for Skills

Use the find command to discover skills by keyword or domain:

```bash
# Search for React-related skills
npx skills find react

# Search for testing skills
npx skills find testing

# Search for deployment skills
npx skills find deploy
```

### Install Skills

Install skills globally (user-level):

```bash
# Install from GitHub repository
npx skills add @owner/skill-package@skill-name

# Install globally and skip confirmation
npx skills add @owner/skill-package@skill-name -g -y
```

### Manage Skills

```bash
# Check for available updates
npx skills check

# Update all installed skills
npx skills update

# View installed skills
npx skills
```

## How to Use Skills

Once installed, your agent will have access to the newly added skill capabilities. The skill defines which tools or workflows become available to the agent.

### Example Workflow

1. **Identify your need**: "I need help with React performance optimization"
2. **Search for skills**: `npx skills find react performance`
3. **Review options**: Check install count, source reputation, and GitHub stars
4. **Install**: `npx skills add vercel-labs/agent-skills@react-performance`
5. **Agent access**: The skill is now available to your agent

## Finding Skills

### Option 1: Browse the Leaderboard

Visit [skills.sh](https://skills.sh/) to browse the leaderboard, which ranks skills by total installs. Top skills include:

- `vercel-labs/agent-skills` — React, Next.js, web design (100K+ installs)
- `anthropics/skills` — Frontend design, document processing (100K+ installs)

### Option 2: Search by Keywords

Use targeted search queries for better results:

```bash
# Be specific: "react testing" is better than just "testing"
npx skills find "react testing"

# Try alternative terms
npx skills find deploy
npx skills find deployment
npx skills find "ci-cd"
```

### Quality Verification

Before installing a skill, verify:

1. **Install count**: Prefer skills with 1K+ installs
2. **Source reputation**: Official sources (`vercel-labs`, `anthropics`, `microsoft`) are more trustworthy
3. **GitHub stars**: Check the source repository for <100 stars, proceed with caution

## Common Skill Categories

| Category | Example Queries |
|----------|-----------------|
| Web Development | react, nextjs, typescript, css, tailwind |
| Testing | testing, jest, playwright, e2e |
| DevOps | deploy, docker, kubernetes, ci-cd |
| Documentation | docs, readme, changelog, api-docs |
| Code Quality | review, lint, refactor, best-practices |
| Design | ui, ux, design-system, accessibility |
| Productivity | workflow, automation, git |

## Examples

### Find and Install a Skill

```bash
# Find skills for a specific task
npx skills find changelog

# Install the best match
npx skills add @username/changelog-skill@changelog
```

### Verify Before Installing

```bash
# View skill details on skills.sh
# https://skills.sh/{owner}/{repo}/{skill-name}
```

### When No Skills Are Found

If no relevant skills exist:

1. Acknowledge no match was found
2. The agent can still help with the task using general capabilities
3. Consider creating your own skill with `npx skills init`

## Installation Guide

### Prerequisites

- Node.js (recommended)
- npm or yarn

### Installing the CLI

The Skills CLI is available via npx (no installation required):

```bash
# Use without installing
npx skills find ...
```

Or install globally:

```bash
# Install globally
npm install -g skills-cli

# Use from anywhere
skills find ...
```

## Creating Your Own Skill

If you need a specific capability but don't find an existing skill:

```bash
# Initialize a new skill project
npx skills init my-skill-name

# Follow the prompts to define your skill
```

## Restoring a Previous Chat Session

## Popular Sources

Many popular skills come from these reputable sources:

- `vercel-labs/agent-skills` — Vercel Library, with official Vercel Engineering standards. The skill `react-best-practices` provides React best practices curated by Vercel.

- `anthropics/skills` — Anthropic's official skill collection, with `frontend-design` and `document-processing` available.

- `microsoft` — Microsoft's AI and productivity skills.

- `ComposioHQ/awesome-claude-skills` — Community-curated tools and workflows.

## Resources

- **Browse Skills**: https://skills.sh/
- **Documentation**: Available at https://skills.sh/docs
- **GitHub**: Check each skill's repository for additional details

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `npx skills` not found | Ensure Node.js is installed and in your PATH |
| Permission denied errors | Use `-g -y` flags for global installation |
| Skill not found | Verify the repo name and skill name are correct |
| Slow install | Check your network connection; use a CDN |

### Tips

1. Use specific keywords in search queries
2. Try alternative terms if one doesn't work
3. Check popular sources first before exploring options
4. Verify skill quality before installing

---

For more information, visit [skills.sh](https://skills.sh/).
