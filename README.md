# Lamy NPM MCP Server

## 한국어

주식회사 라미솔루션의 철학에 맞춰, `NPM_ACCESS_TOKEN`으로 npm 패키지 배포/삭제/조회에 필요한
필수 기능만 초경량으로 제공하는 MCP 서버입니다.

### Codex MCP 사용법

`~/.codex/config.toml`에 아래처럼 MCP 서버를 등록할 수 있습니다.

```toml
[mcp_servers.lamy-npm-mcp-server]
command = "npx"
args = ["-y", "@lamysolution/npm-mcp-server"]

[mcp_servers.lamy-npm-mcp-server.env]
NPM_ACCESS_TOKEN = "npm_xxxxxxxxxxxxxxxxx"
```

### 기능

- `npm_publish`: 실제 npm 배포 실행
- `npm_unpublish`: npm 버전 삭제 실행 (버전 지정 필수)
- `npm_view_package`: 배포된 패키지 정보 조회 (`field`, `json` 옵션 지원)

## English

Built to match Lamy Solution's philosophy, this is an ultra-lightweight MCP server that provides only the
essential npm package publish/unpublish/view workflows using `NPM_ACCESS_TOKEN`.

### Codex MCP Setup

Add this MCP server to your `~/.codex/config.toml`:

```toml
[mcp_servers.lamy-npm-mcp-server]
command = "npx"
args = ["-y", "@lamysolution/npm-mcp-server"]

[mcp_servers.lamy-npm-mcp-server.env]
NPM_ACCESS_TOKEN = "npm_xxxxxxxxxxxxxxxxx"
```

### Features

- `npm_publish`: Publish to npm
- `npm_unpublish`: Unpublish a specific npm version (version required)
- `npm_view_package`: View published package metadata (`field`, `json` supported)
