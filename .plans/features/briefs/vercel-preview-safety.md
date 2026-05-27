# Feature Idea Brief: vercel-preview-safety

- **Epic**: `EPIC-20260527-001`
- **권장 시작점**: `/plan-prd`
- **idea/screen**: full

## 문제

웹사이트 전환은 배포 surface를 추가하므로 build, link, protected path, Preview 검증 기준이 없으면 기존 toolkit 기능에 영향을 줄 수 있다.

## 사용자 가치

maintainer는 Vercel Preview를 통해 문서 웹사이트를 확인하되, Production 배포나 core 기능 변경 없이 안전하게 검증할 수 있다.

## 범위

포함: local build, route smoke, link check, protected path diff, Vercel Preview 준비 기준.

제외: Production 배포, secret 설정, installer 변경.

## 리스크

package dependency 추가가 기존 `postinstall`과 package publishing에 영향을 줄 수 있어 별도 검증이 필요하다.

