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

### OpenCode MCP 사용법

OpenCode 설정 파일 경로 예시: `~/.config/opencode/opencode.jsonc`  
해당 파일의 `mcp` 섹션에 아래처럼 추가합니다.

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "lamy-npm-mcp-server": {
      "type": "local",
      "command": ["npx", "-y", "@lamysolution/npm-mcp-server"],
      "enabled": true,
      "environment": {
        "NPM_ACCESS_TOKEN": "npm_xxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### 기능

- `npm_publish`: 실제 npm 배포 실행
- `npm_unpublish`: npm 버전 삭제 실행 (버전 지정 필수)
- `npm_view_package`: 배포된 패키지 정보 조회 (`field`, `json` 옵션 지원)

### 라이선스

이 프로젝트는 **GNU Affero General Public License v3.0 (AGPL-3.0-only)** 를 따릅니다.
자세한 내용은 `LICENSE` 파일을 확인하세요.

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

### OpenCode MCP Setup

OpenCode config path example: `~/.config/opencode/opencode.jsonc`  
Add this server under `mcp` in that file:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "lamy-npm-mcp-server": {
      "type": "local",
      "command": ["npx", "-y", "@lamysolution/npm-mcp-server"],
      "enabled": true,
      "environment": {
        "NPM_ACCESS_TOKEN": "npm_xxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Features

- `npm_publish`: Publish to npm
- `npm_unpublish`: Unpublish a specific npm version (version required)
- `npm_view_package`: View published package metadata (`field`, `json` supported)

### License

This project is licensed under **GNU Affero General Public License v3.0 (AGPL-3.0-only)**.
See the `LICENSE` file for details.
