# GitHub IA Agent — MCP Server

Un **MCP Server** (Model Context Protocol) en Node.js + TypeScript que expone herramientas (*tools*) para automatizar operaciones comunes en GitHub. Diseñado para conectarse a un host como **Antigravity**, permite que un agente de IA (Gemini, Claude u otro LLM) ejecute acciones reales en GitHub a partir de comandos en lenguaje natural.

---

## ¿Qué hace?

Este servidor traduce pedidos en lenguaje natural del usuario en llamadas verificables a la API de GitHub. En lugar de entrar a la web de GitHub y hacer las cosas a mano, el usuario le pide al agente algo como *"creá un repo llamado mi-proyecto"* y el agente ejecuta la acción real, devolviendo evidencia (URLs, números de issue, SHAs de commit).

### Casos de uso

- Automatizar la creación de repositorios de trabajo para nuevos proyectos.
- Abrir issues para registrar tareas o reportar bugs sin salir del IDE.
- Consultar el estado de repositorios e issues (backlog).
- Agregar o modificar archivos y commitearlos de forma programática.
- Integrar la gestión de GitHub dentro de un flujo asistido por IA.

---

## Requisitos del sistema

- **Node.js 18+**
- **npm**
- Una cuenta de GitHub con un **Personal Access Token (classic)**
- Opcional: **Antigravity** (u otro host MCP) para el uso con lenguaje natural

---

## Instalación paso a paso

```bash
# 1. Clonar el repositorio
git clone https://github.com/juampxarnez-ctrl/github-ia-agent-m5.git
cd github-ia-agent-m5

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno (ver sección siguiente)
cp .env.example .env
# Editar .env y pegar tu GITHUB_TOKEN

# 4. Compilar TypeScript a JavaScript
npm run build
```

---

## Configuración

### 1. Obtener un GitHub Personal Access Token

1. Ir a GitHub → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)**.
2. Hacer clic en **"Generate new token (classic)"**.
3. Darle un nombre descriptivo, por ejemplo `mcp-github-agent`.
4. Seleccionar una fecha de expiración.
5. Marcar los scopes necesarios (ver siguiente punto).
6. Generar y **copiar el token inmediatamente** (GitHub no lo vuelve a mostrar).

### 2. Scopes necesarios

El token debe tener los siguientes scopes:

- **`repo`** — control total de repositorios (necesario para crear repos, issues y commits).
- **`user`** — acceso a datos del usuario autenticado.
- **`admin:org`** — para operar sobre organizaciones.

> Se aplica el **principio de mínimo privilegio**: se otorgan solo los permisos que las tools necesitan, para reducir el riesgo en caso de que el token se filtre.

### 3. Configurar el archivo `.env`

Crear un archivo `.env` en la raíz del proyecto (basado en `.env.example`):

```
GITHUB_TOKEN=ghp_tuTokenAqui
```

> **Importante:** el archivo `.env` está en `.gitignore` y nunca debe subirse al repositorio. Un token filtrado debe considerarse comprometido y regenerarse.

### 4. Configurar el MCP Server en Antigravity

1. Abrir Antigravity → **MCP Servers** → **Manage** → **View raw config**.
2. Confirmar cuál es el archivo de configuración efectivo (normalmente `mcp_config.json`).
3. Agregar el siguiente bloque:

```json
{
  "mcpServers": {
    "github-ia-agent": {
      "command": "node",
      "args": ["/ruta/absoluta/a/github-ia-agent-m5/dist/index.js"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

4. Guardar y verificar que el servidor aparezca listado en el panel de MCP Servers.

> Reemplazar `/ruta/absoluta/...` por la ruta real del proyecto en tu máquina. Para desarrollo, se puede usar `"command": "npx"` con `"args": ["tsx", "/ruta/a/src/index.ts"]`.

---

## Documentación de las tools

El servidor expone **5 tools** para operar sobre GitHub, más una tool `ping` de health-check.

### `create_repository`

Crea un nuevo repositorio en la cuenta autenticada.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `name` | string | Sí | Nombre del repo (3-100 caracteres; letras, números, `-`, `_`, `.`) |
| `description` | string | No | Descripción breve |
| `private` | boolean | No | Si el repo es privado (default: `false`) |

**Prompt de ejemplo:** *"Creá un repositorio llamado mi-nuevo-proyecto con la descripción 'proyecto de prueba'."*

---

### `list_repositories`

Lista los repositorios de la cuenta autenticada.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `visibility` | enum (`all`, `public`, `private`) | No | Filtrar por visibilidad (default: `all`) |
| `sort` | enum (`created`, `updated`, `pushed`, `full_name`) | No | Criterio de orden (default: `updated`) |
| `per_page` | number | No | Cantidad a traer, máx 100 (default: 30) |

**Prompt de ejemplo:** *"Listame mis repositorios públicos ordenados por fecha de actualización."*

---

### `create_issue`

Crea un nuevo issue en un repositorio.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Dueño del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `title` | string | Sí | Título del issue |
| `body` | string | No | Cuerpo/descripción del issue |

**Prompt de ejemplo:** *"Abrí un issue en juampxarnez-ctrl/test-mcp-repo-1 con el título 'Actualizar dependencias' y el cuerpo 'Revisar versiones de producción'."*

---

### `list_issues`

Lista los issues de un repositorio.

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Dueño del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `state` | enum (`open`, `closed`, `all`) | No | Filtrar por estado (default: `open`) |

**Prompt de ejemplo:** *"Mostrame los issues abiertos de juampxarnez-ctrl/test-mcp-repo-1."*

---

### `create_commit`

Crea un commit agregando o modificando un archivo en un repositorio. Ejecuta el flujo completo de bajo nivel de Git (obtener ref → obtener commit base → crear blob → crear tree → crear commit → actualizar ref).

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `owner` | string | Sí | Dueño del repositorio |
| `repo` | string | Sí | Nombre del repositorio |
| `branch` | string | No | Rama destino (default: `main`) |
| `path` | string | Sí | Ruta del archivo dentro del repo |
| `content` | string | Sí | Contenido del archivo en texto plano |
| `message` | string | Sí | Mensaje del commit |

**Prompt de ejemplo:** *"Agregá el archivo docs/notas.md con el contenido '# Notas' al repo juampxarnez-ctrl/test-mcp-repo-1 y commiteá con el mensaje 'Agregar notas'."*

> **Nota:** el repositorio destino debe estar inicializado (tener al menos un commit). Un repo vacío devuelve un error 409.

---

## Diagrama de arquitectura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│  Antigravity │────▶│  LLM Client  │────▶│   MCP Server     │────▶│  GitHub API  │
│    (Host)    │     │ (Gemini/etc) │     │ (github-ia-agent)│     │   (Octokit)  │
└──────────────┘     └──────────────┘     └──────────────────┘     └──────────────┘
      │                     │                      │                       │
  El usuario          Decide qué tool         Valida inputs (Zod),    Ejecuta la
  escribe en          llamar y con qué        ejecuta la operación    acción real y
  lenguaje natural    parámetros              y traduce errores       devuelve datos
```

La comunicación entre el Host y el MCP Server se realiza vía **stdio** usando el protocolo **JSON-RPC 2.0**.

### Estructura del proyecto

```
src/
├── index.ts                 # Entry point: registra las tools y conecta el transport stdio
├── types.ts                 # Tipos e interfaces compartidos (DTOs)
├── config/
│   └── env.ts               # Carga de variables de entorno
├── errors/
│   ├── app-errors.ts        # Jerarquía de errores custom
│   └── map-github-error.ts  # Traducción de errores de GitHub a lenguaje natural
├── github/
│   ├── client.ts            # Configuración de Octokit
│   └── operations.ts        # Funciones que llaman a la API de GitHub
├── schemas/                 # Schemas de Zod (uno por tool)
└── handlers/                # Handlers que orquestan validación + operación + errores
```

---

## Cómo ejecutar los tests

El proyecto usa **Vitest** con Octokit mockeado (los tests nunca tocan la red ni la API real).

```bash
npm test          # Ejecuta todos los tests una vez
npm run test:watch  # Modo watch (re-ejecuta al cambiar archivos)
```

Los tests cubren:

- **Validación de schemas:** inputs válidos pasan, inválidos fallan.
- **Transformación de errores:** cada código HTTP (401, 403, 404, red) se traduce al error tipado correcto con mensaje en lenguaje natural.
- **Operations con Octokit mockeado:** se verifica que las funciones llaman a la API con los argumentos correctos y mapean la respuesta al DTO esperado.

---

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run build` | Compila TypeScript a JavaScript (`dist/`) |
| `npm run dev` | Ejecuta el servidor en modo desarrollo (con `tsx`) |
| `npm start` | Ejecuta el servidor compilado (`dist/index.js`) |
| `npm test` | Ejecuta los tests con Vitest |

---

## Troubleshooting

| Error | Causa probable | Solución |
|-------|----------------|----------|
| **AUTH_ERROR** / "token inválido" | `GITHUB_TOKEN` ausente, expirado o mal configurado | Verificar el token en `.env` y sus scopes |
| **"No tenés permisos suficientes"** (403) | El token no tiene el scope `repo` | Regenerar el token con los scopes correctos |
| **"El recurso no fue encontrado"** (404) | Owner/repo mal escrito o inexistente | Verificar el nombre del repositorio |
| **Error 409 en create_commit** | El repositorio está vacío (sin commits) | Inicializar el repo con un README antes de commitear |
| **"Rate limit alcanzado"** | Se superó el límite de peticiones de GitHub | Esperar unos minutos y reintentar |
| El servidor no aparece en Antigravity | Ruta incorrecta en `mcp_config.json` o build no generado | Verificar la ruta absoluta y correr `npm run build` |

---

## Licencia

Este proyecto está licenciado bajo la **Licencia MIT**. Ver el archivo [LICENSE](./LICENSE) para más detalles.
