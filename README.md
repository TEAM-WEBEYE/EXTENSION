
# 👓 KUSITMS 31th MEETUP PROJECT VOIM
시각장애인이 온라인 쇼핑 시 이미지 정보를 쉽게 파악하고 개인 맞춤형 접근성을 제공하는 크롬 확장 프로그램

*보이지 않아도,보임이니까.*

![웹 썸네일](https://github.com/user-attachments/assets/5c37db71-5f40-4a85-b3e3-d88694f8b260)

🔧 크롬 익스텐션 다운로드 : https://chromewebstore.google.com/detail/voim/iofbhhcbidmfcmpjndglaignlfdojpcm


## 👸 팀 소개

📍 《호공주와 일곱 프린세스》

우리팀의 청일점인 최호를 위해 모두가 공주가 되었다…

유일한 청일점 '호와 각자의 개성과 실력을 가진 **일곱 명의 프린세스들**이 함께 만들어가는 **조화롭고 유쾌한 팀워크** 를 상징합니다.

![팀소개](https://github.com/user-attachments/assets/6b7b13ab-d90c-4712-9347-811c972593a0)

# VOIM 소개

## 💽 ERD
![erd](https://github.com/user-attachments/assets/61ff16b0-7b29-4b45-b4a6-6e5c6f6cd0e7)
## 📁 System Architecture
![KakaoTalk_Photo_2025-05-29-21-49-52](https://github.com/user-attachments/assets/dcda7b30-0e83-4f84-b03b-6b66e1824fcd)
## 📁 API 명세서 
[Swagger](https://voim.store/api/swagger-ui/index.html#/)
## 🧩 주요 기능

| **기능 명**             | **설명** |
|--------------------------|----------|
| 초기 온보딩 팝업        | 사용자가 확장 프로그램을 처음 설치했을 때, 주요 기능을 단계별로 안내합니다. |
| 내 정보 설정            | 사용자의 출생 연도와 성별, 알러지 정보를 입력하여 개인화된 정보 제공의 기반을 마련합니다. |
| 고대비 모드             | 배경색과 글자색을 설정하여 가독성을 높이고 눈의 피로를 줄이는 모드입니다. <br>검은색 배경에 흰색 글자를 제공합니다. |
| 글자 크기 및 두께 바꾸기 | 텍스트 크기를 5단계(아주 작게, 작게, 기본, 크게, 아주 크게)로 조절하여 시각 보조 기능을 제공합니다. <br>텍스트의 두께를 '얇게', '기본', '두껍게' 중 선택하여 가독성을 조절할 수 있습니다. |
| 이미지 분석하기 (모든 도메인) | 이미지 위에 마우스를 올릴 시, 이미지 분석 버튼이 나타나 이미지 분석을 실행합니다. <br>AI가 이미지를 분석한 후 해당 내용을 텍스트로 보여줍니다. |
| 단축키 안내             | 서비스에서 사용 가능한 단축키 정보를 안내합니다. |
| 상세정보 요약           | 제품 페이지에 접속 시, 상세페이지에 있는 이미지 정보를 자동으로 분석하여 텍스트로 요약해 보여줍니다. <br>4가지 카테고리로 구조화해 핵심정보만 전달합니다. |
| 성분 안내 기능          | 성분이 중요한 식품, 화장품, 건강기능식품에 한하여 다음과 같은 정보를 제공합니다: <br><br>**[식품]**<br>- 상품의 특정 영양성분(하루 권장치 기준 40% 이상)이 포함되어 있을 경우 주의표시를 제공합니다.<br>- 상품에 사용자가 입력한 알레르기가 있을 경우 강조해 제공합니다.<br><br>**[화장품]**<br>- 상품에 20가지 주의성분 및 알레르기 유발 성분이 포함되어 있을 경우 안내합니다.<br><br>**[건강기능식품]**<br>- 해당 건강기능식품의 성분이 제공하는 효능에 대한 정보를 제공합니다. |
| 장바구니 요약           | 장바구니에 담긴 상품의 이름, 수량, 가격 등 핵심 정보를 요약하여 정리해 보여줍니다. |

## 🛠️ 기술 스택

### Frontend
| 기술 스택               | 설명 |
|------------------------|------|
|React    | - 복잡한 UI와 상태 관리를 효율적으로 처리 가능<br> - 크롬 익스텐션을 웹 개발하듯이 구현 가능 |
|Typescirpt         | - 버그를 줄이고, 협업과 유지보수 쉽게 가능|
| Tailwind| - 빠른 디자인 토큰 설정을 통해 디자인 시스템 구현 가능 |
| webpack         | - 다양한 설정을 통해 커스터마이징이 가능한, 자유도가 높은 모듈 번들러 |

### Backend
| 기술 스택               | 설명 |
|------------------------|------|
| Spring Boot 3.X    | - 최신 기술 적용 가능 (새로운 기능 및 성능 개선)<br>- 유지보수성과 확장성 고려<br>- Java 21 지원으로 성능 최적화 및 최신 기능 활용 가능 |
| Spring AI          | - Spring 기반 프로젝트에서 OpenAI의 호출을 손쉽게 구현하기 위해 도입<br>- 기존 여러 DTO를 작성해야 했던 것과 달리, 간단하고 가독성있는 구현 가능 |
| GitHub Actions + Docker | - CI/CD 자동화를 통한 배포 효율성 증가<br>- 컨테이너화를 통한 환경 일관성 유지 및 배포 용이 |
| Open API           | - 공공 데이터 OPEN API를 활용하여 식품 영양 성분 및 비율, 레시피 데이터 활용 |
| Open AI            | - Open AI를 활용한 제품 정보 이미지 분석 |
| CLOVA X            | - CLOVA X를 활용한 리뷰 데이터 요약 및 긍부정 분석<br>- 한국어 특화 모델 기반의 고정확도 요약 및 의미 추출 |
| MySQL              | - 안정성과 성능이 검증된 오픈소스 관계형 데이터베이스<br>- Spring Boot와의 호환성이 뛰어나고 운영 환경에 적합 |
| JPA                | - 객체 지향적인 방식으로 데이터베이스 접근 로직 구현 가능<br>- 반복적인 SQL 작성 없이 생산성과 유지보수성 향상 |

### 협업 및 기타 도구
- Git, GitHub, Notion, Figma

## 📁 폴더 구조
### frontend
```
src/
├── 📂 assets/ #img 저장 폴더
├── 📂 background/ #크롬 익스텐션의 background.js 관련 로직 폴더
├── 📂 components/
├── 📂 constants/ # enum 등 상수값 저장 폴더
├── 📂 content/ # 크롬 익스텐션의 content.js 관련 로직 폴더 
├── 📂 contexts/ # 테마 적용 context 저장 폴더
├── 📂 css/
├── 📂 hooks/ # 커스텀 훅(useXXX)을 정의하는 폴더
├── 📂 iframe/  # 크롬 익스텐션을 통해 페이지 DOM에 삽입되는 iframe관련 코드
├── 📂 tabs/
│   └── 📂 myInfo/ # 내 정보 관련 UI 및 기능을 담당하는 폴더
├── 📂 types/ # 모듈 관련 전역 타입 정의 폴더
└── 📂 utils/ # 범용 유틸 함수들을 모아둔 폴더
```
### backend
```
📦 VOIM
┗━ 📦 backend
    ┣━ 📂 domain
    ┃   ┣━ 📂 application         # 비즈니스 로직 서비스 계층
    ┃   ┣━ 📂 domain              # 엔티티, VO, 도메인 모델
    ┃   ┣━ 📂 dto
    ┃   ┃   ┣━ 📂 request         # 클라이언트 요청 DTO
    ┃   ┃   ┗━ 📂 response        # 클라이언트 응답 DTO
    ┃   ┣━ 📂 infrastructure      # AI Client, 전처리 등 외부 시스템 연동
    ┃   ┃   ┗━ 📂 mapper          # DB 매핑, 엔티티 ↔ DTO 변환 등
    ┃   ┣━ 📂 persistent          # Repository 등 DB 접근 계층
    ┃   ┗━ 📂 presentation        # Controller 계층 (API 요청 처리)
    ┃       ┗━ 📂 swagger         # Swagger API 문서 설정
    ┣━ 📂 global                  # 공통 유틸리티, 예외, 설정 등
    ┗━ 📄 BackendApplication.java # Spring Boot 메인 클래스 (앱 진입점)
```
## 🖥️ Developer Members
  
  | **박수민** | **최호** | **임연지** | **주정빈** |
  | :--------: | :------: | :--------: | :--------: |
  | <a href="https://github.com/psm1st"><img src="https://avatars.githubusercontent.com/u/145013061?v=4" width="150"> | <a href="https://github.com/choihooo"><img src="https://avatars.githubusercontent.com/u/67588757?v=4" width="150"> | <a href="https://github.com/yeonjy"><img src="https://avatars.githubusercontent.com/u/81320703?v=4" width="150"> | <a href="https://github.com/zyovn"><img src="https://avatars.githubusercontent.com/u/166782961?v=4" width="150"> | 
  | frontend | frontend | backend | backend` |
