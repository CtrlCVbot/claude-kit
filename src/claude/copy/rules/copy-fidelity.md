# Copy Fidelity Standards

> 레퍼런스 대비 구현물의 충실도를 측정하는 기준. 주관적 판단이 아닌 객관적 증거 기반으로 평가한다.

## Visual Fidelity 기준

레퍼런스 스크린샷과 현재 구현을 pixel 단위로 비교한다.

| 항목 | 검증 대상 | 판정 기준 |
|------|----------|----------|
| Layout | 섹션 순서, 그리드 구조, 컨테이너 배치 | 구조 불일치 = P0 |
| Typography | font-family, font-size, font-weight, line-height | 2px 이상 차이 = P1 |
| Spacing | margin, padding, gap | 4px 이상 차이 = P1 |
| Color | background, text, border, shadow | hex 불일치 = P1 |
| CTA | 버튼 텍스트, 위치, 크기, 색상 | 텍스트 불일치 = P0 |

## Interaction Fidelity 기준

동적 상태 전환을 레퍼런스와 비교한다.

| 항목 | 검증 대상 | 판정 기준 |
|------|----------|----------|
| Hover | 색상 변화, 커서, 트랜지션 | 상태 누락 = P1 |
| Sticky | 헤더/네비게이션 고정 동작 | 고정 누락 = P0 |
| Scroll | 스크롤 연동 애니메이션, 패럴랙스 | 동작 부재 = P1 |
| Menu | 열기/닫기, 활성 상태, 드롭다운 | 상태 전환 오류 = P0 |
| Responsive | 뷰포트별 레이아웃 전환 | 브레이크포인트 누락 = P0 |

## Viewport 기준

모든 fidelity 검증은 다음 5개 뷰포트에서 수행한다:

| 뷰포트 | 너비 | 대상 기기 |
|--------|------|----------|
| Desktop XL | 1440px | 대형 모니터 |
| Desktop | 1280px | 일반 모니터 |
| Tablet L | 1024px | 태블릿 가로 |
| Tablet P | 768px | 태블릿 세로 |
| Mobile | 390px | 모바일 |

## 시나리오 정의

| 시나리오 | 설명 | 진입 조건 |
|---------|------|----------|
| A (Greenfield) | 신규 페이지/섹션 구현 | 기존 구현 없음 |
| B (Partial) | 부분 구현 상태에서 완성 | 일부 섹션만 존재 |
| C (Fidelity Correction) | 기존 구현의 충실도 보정 | 레퍼런스 대비 갭 존재 |

## 금지 사항

- fidelity 분석 중 코드 수정 금지 (분석과 구현은 별도 Phase)
- 주관적 판단 금지 ("이 정도면 괜찮다" 불허 -- 측정값 기반 판정만 허용)
- 레퍼런스 없는 fidelity 주장 금지 (evidence 미첨부 = 미검증)

## Priority 정의

| 레벨 | 의미 | 처리 기한 |
|------|------|----------|
| P0 (Blocking) | 사용자 경험 차단, 레이아웃 파괴 | 현재 Phase 내 필수 해결 |
| P1 (Should Fix) | 시각적/상호작용 품질 저하 | 현재 Round 내 권장 해결 |
| P2 (Nice to Have) | 미세 차이, 개선 여지 | 백로그 등록 |

P0 이슈가 1건이라도 열려 있으면 Phase 완료를 선언할 수 없다.
