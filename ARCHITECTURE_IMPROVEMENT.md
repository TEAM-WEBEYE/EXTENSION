# 익스텐션 아키텍처 개선 사항

## 개요

기존의 동일한 기능을 여러 객체로 선언해 관리하는 구조에서 발생하던 상태 간 불일치 문제를 해결하기 위해, 익스텐션 전역에서 단 하나의 싱글턴 서비스 객체를 관리하도록 구조를 개편했습니다.

## 주요 개선 사항

### 1. 싱글턴 패턴 적용

#### Background Script

- **ServiceManager**: 모든 서비스의 중앙 집중식 관리
- **MessageService**: 메시지 기반 통신의 중앙 집중식 처리
- **StorageCleanupService**: 스토리지 정리 및 관리

#### Content Script

- **ContentServiceManager**: Content script 서비스 관리
- **ContentMessageService**: Content script 메시지 처리

### 2. 메시지 기반 통신으로 전환

기존의 직접적인 스토리지 접근에서 메시지 기반 통신으로 전환하여:

- 상태 동기화 문제 해결
- 예측 가능한 데이터 흐름
- 디버깅 용이성 향상

### 3. 스토리지 사용량 최적화

- 불필요한 스토리지 데이터 자동 정리
- 주기적인 임시 데이터 정리
- 스토리지 사용량 모니터링

## 구조 개선 효과

### 사용자 경험 개선

- **약시 사용자를 위한 UI와 상태 간 일관성 보장**
- 예측 가능한 동작으로 사용자 신뢰도 향상
- 성능 향상으로 반응성 개선

### 개발자 경험 개선

- **중복 코드 제거로 유지보수 부담 감소**
- 명확한 책임 분리로 코드 가독성 향상
- 디버깅 및 테스트 용이성 증가

### 기술적 개선

- **메모리 사용량 감소**
- 스토리지 사용량 최적화
- 전체적인 성능 향상

## 새로운 아키텍처 구조

```
src/
├── background/
│   ├── services/
│   │   ├── ServiceManager.ts          # 싱글턴 서비스 관리자
│   │   ├── MessageService.ts          # 메시지 처리 서비스
│   │   ├── StorageCleanupService.ts   # 스토리지 정리 서비스
│   │   ├── storageService.ts          # 스토리지 서비스
│   │   ├── settingsService.ts         # 설정 서비스
│   │   └── iframeService.ts           # iframe 서비스
│   ├── listeners/
│   │   └── storageListeners.ts        # 개선된 스토리지 리스너
│   └── index.ts                       # 개선된 초기화 로직
├── content/
│   ├── services/
│   │   ├── ContentServiceManager.ts   # Content 서비스 관리자
│   │   └── ContentMessageService.ts   # Content 메시지 서비스
│   └── index.tsx                      # 개선된 초기화 로직
```

## 주요 변경 사항

### Background Script

1. **ServiceManager 도입**: 모든 서비스의 중앙 집중식 관리
2. **MessageService 도입**: 메시지 기반 통신의 중앙 집중식 처리
3. **StorageCleanupService 도입**: 스토리지 정리 및 관리
4. **중복 메시지 리스너 제거**: 메시지 서비스로 통합

### Content Script

1. **ContentServiceManager 도입**: Content script 서비스 관리
2. **ContentMessageService 도입**: Content script 메시지 처리
3. **중복 메시지 리스너 제거**: 메시지 서비스로 통합

### 스토리지 관리

1. **자동 정리 시스템**: 불필요한 데이터 자동 제거
2. **사용량 모니터링**: 스토리지 사용량 추적
3. **주기적 정리**: 임시 데이터 주기적 정리

## 성능 개선 결과

- **메모리 사용량**: 중복 객체 제거로 메모리 사용량 감소
- **스토리지 사용량**: 불필요한 데이터 정리로 스토리지 사용량 최적화
- **응답성**: 메시지 기반 통신으로 더 빠른 응답
- **안정성**: 상태 동기화 문제 해결로 안정성 향상

## 개발 가이드라인

### 새로운 서비스 추가

1. 서비스 클래스 생성
2. ServiceManager에 등록
3. 필요한 메시지 핸들러 등록

### 메시지 처리

1. MessageService에 핸들러 등록
2. 타입 안전성 보장
3. 에러 처리 구현

### 스토리지 관리

1. 필수 키만 유지
2. 임시 데이터는 자동 정리 대상
3. 사용량 모니터링 활용

## 결론

이번 아키텍처 개선을 통해:

1. **사용자 경험**: 약시 사용자를 포함한 모든 사용자에게 일관된 경험 제공
2. **개발자 경험**: 유지보수 부담 감소 및 개발 효율성 향상
3. **기술적 개선**: 성능 향상 및 안정성 개선

올바른 설계 구조가 사용자 경험뿐 아니라 개발자 경험에도 얼마나 중요한지 체감할 수 있었습니다.
