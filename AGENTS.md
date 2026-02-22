# AGENTS.md

## 목적
이 저장소는 **Lamy NPM MCP Server**를 유지보수합니다.  
원칙은 **초경량화 + 필수 기능만 제공**입니다.

## 현재 제품 범위
- MCP 도구는 아래 3개만 유지합니다.
- `npm_publish`
- `npm_unpublish` (특정 버전만 삭제, `version` 필수)
- `npm_view_package`

## 제외/금지 정책
- `npm_publish_dry_run` 도구는 제공하지 않습니다.
- `npm_unpublish --force`(패키지 전체 삭제)는 허용하지 않습니다.
- 기능 추가 시 "필수 기능인지" 먼저 검증합니다.

## 문서 정책
- `README.md`는 **한국어 + 영어**를 함께 유지합니다.
- 설정 예제는 최소 아래 2가지를 유지합니다.
- Codex MCP 설정
- OpenCode MCP 설정

## 인코딩 정책 (중요)
- 한글 깨짐 방지를 위해 텍스트 파일은 **UTF-8**로 저장합니다.
- PowerShell에서 파일 조작 시 인코딩을 명시합니다.
- 예: `Get-Content -Raw -Encoding utf8 README.md`
- 예: `Set-Content -Encoding utf8 README.md`

## 라이선스 정책
- SPDX: `AGPL-3.0-only`
- 루트 `LICENSE`는 GNU AGPL v3 공식 전문을 유지합니다.
- `README.md`의 KR/EN 섹션에 라이선스 안내를 명시합니다.

## npm 메타데이터 정책
`package.json`에 아래 항목을 유지합니다.
- `repository`
- `homepage`
- `bugs`
- `license`

## 배포 절차
1. 변경 반영
2. 버전 상승 (`npm version <patch> --no-git-tag-version`)
3. 빌드 (`npm run build`)
4. 배포 (`npm publish --access public` 또는 MCP publish)
5. 검증
- `npm dist-tag ls @lamysolution/npm-mcp-server`
- `npm view @lamysolution/npm-mcp-server version versions dist-tags --json --prefer-online`

## 반영 지연 대응
- npm 레지스트리 전파 지연이 있을 수 있습니다.
- 즉시 조회가 실패하면 잠시 대기 후 재조회합니다.

## Git 작업 규칙
- 기본 브랜치: `main`
- 문서/메타데이터 변경도 커밋 후 푸시합니다.
- 커밋 메시지는 목적이 드러나게 작성합니다.

