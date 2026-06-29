# Guida completa per l'uso del find-skills skill su OpenCode e altri agenti

## 📦 Overview del Repository

**Repository**: [`alexgenovese/mcp-arxiv`](https://github.com/alexgenovese/mcp-arxiv)  
**URL**: https://github.com/alexgenovese/mcp-arxiv

Questo repository contiene il comando `find-skills`, una skill per l'ecosistema open agent skills che permette di **scoprire e installare skills** per estendere le capacità degli agenti AI.

---

## 🚀 Come Aggiungere la Skill a OpenCode

### Metodo 1: Installazione Diretta del Package (Consigliato)

1. **Installa la skill tramite Skills CLI**:

```bash
# Installa la skill globally
npx skills add alexgenovese/mcp-arxiv@find-skills -g -y
```

2. **Riavvia OpenCode** (se già in esecuzione)

3. **Configura OpenCode** in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "find-skills": {
      "type": "global",
      "command": ["npx", "skills"],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

### Metodo 2: Installazione da Source Locali

1. **Clona il repository**:

```bash
cd ~/projects
git clone https://github.com/alexgenovese/mcp-arxiv.git
cd mcp-arxiv
```

2. **Installa le dipendenze**:

```bash
npm install
```

3. **Esegui la build** (se necessario):

```bash
npm run build
```

4. **Aggiungi configurazione in `opencode.json`**:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "find-skills": {
      "type": "local",
      "command": ["node", "/absolute/path/to/mcp-arxiv/dist/index.js"],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

---

## 🤖 Compatibilità con Altri Agenti (MCP Client)

### Agenti Compatibili

La skill è compatibile con qualsiasi client MCP che supporti il protocollo stdio:

| Agent | Supporto | Configurazione |
|-------|----------|----------------|
| **OpenCode** | ✅ Nativo | `opencode.json` |
| **Claude Code** | ✅ Supported | MCP settings file |
| **Cursor AI** | ✅ Supported | `.cursorrules` |
| **Continue.dev** | ✅ Supported | `.vscode/extensions.json` |
| **Aider** | ✅ Supported | CLI flags |
| **AutoGen** | ⚠️ Partial | Custom integration needed |
| **LangChain Agents** | ⚠️ Partial | Custom protocol binding |

### Configurazione per Ogni Agent

#### 1. **OpenCode**

File: `~/.opencode/opencode.json`

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "find-skills": {
      "type": "local",
      "command": [
        "npx",
        "-y",
        "skills"
      ],
      "enabled": true,
      "timeout": 30000
    }
  }
}
```

#### 2. **Claude Code** (Anthropic)

Crea o modifica `.antcrip/mcp.json` o `.claude.jsonrc`:

```json
{
  "mcpServers": {
    "find-skills": {
      "command": "npx",
      "args": ["-y", "skills"],
      "env": {
        "SHELL_JOBS": "auto",
        "SHELL_PROCESS_CONCURRENCY": "auto"
      }
    }
  }
}
```

#### 3. **Cursor AI** (Visual Studio Code)

File: `.cursorrules` o `.cursor/mcp.json`

```json
{
  "mcpServers": {
    "find-skills": {
      "command": "npx",
      "args": ["-y", "skills"],
      "disabled": false
    }
  }
}
```

#### 4. **Continue.dev** (VS Code extension)

File: `.vscode/extensions.json`

```json
{
  "recommendations": ["Continue.dev"],
  "settings": {
    "[继续]recommendedPackages": [
      {
        "Id": "continue/override",
        "name": "MCP Configuration",
        "content": {
          "mcpServers": {
            "find-skills": {
              "command": "npx",
              "args": ["-y", "skills"]
            }
          }
        }
      }
    ]
  }
}
```

#### 5. **Aider**

Crea `aider.conf.yml`:

```yaml
[mcp]
find-skills = npx -y skills
```

---

## 🛠️ Uso della Skill find-skills

### Esempi di Interrogazione

```bash
# Permutations skill to find skills related to React performance optimization
npx skills find "react performance"

# Search for skills related to API authentication
npx skills find "api authentication"

# Find glassmorphism design skills
npx skills find glassmorphism
```

### Risposte Tipiche della Skill

La skill restituisce informazioni come:

```
I found a skill that might help! The "react-performance" skill provides
React and Next.js performance optimization guidelines. (18K installs)

To install it:
npx skills add vercel-labs/agent-skills@react-performance

Learn more: https://skills.sh/vercel-labs/agent-skills/react-performance
```

---

## 📋 Checklist di Installazione

- [ ] Repository clonato o package installato
- [ ] `npm install` eseguito
- [ ] Build completata (`npm run build`)
- [ ] Configuration JSON aggiornata
- [ ] Client MCP riavviato
- [ ] Skill abilitata nel configuration file
- [ ] Timeout configurato (≥30s per operazioni lunghe)

---

## 🔧 Troubleshooting

### Error: `command not found`

**Causa**: Skills CLI non installato globalmente  
**Soluzione**:

```bash
# Installare globalmente
npm install -g skills-cli
# O usare npx ogni volta
npx -y skills ...
```

### Error: `timeout`

**Causa**: Il client MCP ha timeout troppo breve  
**Soluzione**: Aumentare il timeout in `opencode.json` o altre config:

```json
"timeout": 60000  // 60 seconds instead of 30
```

### Error: Skill not found

**Causa**: Repo name o skill name non corretti  
**Soluzione**: Verificare il nome esatto

```bash
# Verificare repo names
npx skills find --help

# Verificare skill auf skills.sh
https://skills.sh/
```

### Error: Permission denied

**Causa**: Installazione locale vs global  
**Soluzione**: Usare flag `-g` per installazione utente-level

```bash
npx skills add owner/repo@skill-name -g -y
```

---

## 🌐 Link Utili

- **Skills CLI Documentation**: https://skills.sh/
- **Browse & Search Skills**: https://skills.sh/
- **Leaderboard**: https://skills.sh/leaderboard
- **GitHub Repo**: https://github.com/alexgenovese/mcp-arxiv
- **Skills.sh**: https://skills.sh/skills
- **Readme**: https://github.com/alexgenovese/mcp-arxiv/blob/main/README.md

---

## 📄 Licenza

Apache License 2.0

---

## 🤝 Contributing

1. Clone il repository: `git clone https://github.com/alexgenovese/mcp-arxiv.git`
2. Apri in un editor supportato (VS Code consigliato).
3. Modifica `README.md` per aggiungere nuove funzionalità
4. Commit: `git commit -m "feat: aggiunge nuove skill примеры"`
5. Push: `git push origin main`
6. Apri Pull Request su GitHub

---

**Nota**: Questa guida è mantenuta per aiutare gli utenti a integrare la skill `find-skills` nei loro workspace con AI agent.
