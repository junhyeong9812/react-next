#!/usr/bin/env bash
# 04-isr/react — 수동 재빌드 트리거
#
# 목적:
#   React 의 SSG 결과물(dist/)은 빌드 시점의 데이터로 박제된다.
#   백엔드 posts 데이터가 PATCH 등으로 바뀌어도 HTML 은 자동 갱신되지 않는다.
#   → 데이터 변경 후 이 스크립트로 react 컨테이너를 재빌드해야 반영된다.
#
# 사용법 (04-isr/ 디렉토리에서 실행):
#   ./react/scripts/rebuild.sh
#
# 내부 동작:
#   1. docker compose build react   # 빌드 타임 fetch 로 새 데이터 스냅샷 획득
#   2. docker compose up -d react   # serve 컨테이너 재기동
#
# 대조군:
#   next 컨테이너는 재빌드 없이 revalidate: 10 이 알아서 갱신한다.
#   이 차이가 이 phase 의 핵심.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$COMPOSE_DIR"

echo "[rebuild] docker compose build react (pwd=$COMPOSE_DIR)"
docker compose build react

echo "[rebuild] docker compose up -d react"
docker compose up -d react

echo "[rebuild] done. 이제 curl -s http://localhost:3301/posts/1 로 새 데이터 확인."
