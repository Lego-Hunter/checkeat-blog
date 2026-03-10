# 글감 시드: Railway에서 AWS로 — 1인 개발자의 프리티어 마이그레이션 실전기

> 날짜: 2026-03-10
> 상태: 시드
> 소스: checkeat-infra Railway→AWS 마이그레이션 작업

## 소재 요약

Railway 무료 크레딧 만료 D-7, AWS 프리티어 6개월을 활용한 서비스 마이그레이션. EC2(t3.micro) + RDS(db.t3.micro)로 Terraform IaC 구성, DB 마이그레이션(PG17→PG16), Docker 배포, Let's Encrypt SSL까지 Claude와 페어로 하루 만에 완수. 월 비용 $0 달성.

이후 같은 날 RDS 전체 데이터 적재(5.2GB, 17테이블 무손실), ETL cron EC2 이전(6단계 파이프라인 수동 테스트 성공), Vercel Git 자동배포 연결(GitHub org→개인 이전 + author email 수정)까지 완료. 인프라→데이터→배포 파이프라인 전체가 하루 만에 프로덕션 레디 상태로 전환.

## OSMU 활용

### tech/infra — 01화 후보

**관점**: 1인 개발자가 PaaS에서 IaaS로 넘어가는 실전 과정. 비용 $0 유지 전략.

- EC2+RDS vs ECS vs Lightsail 아키텍처 3안 비교, 프리티어 최적 조합 선택 과정
- Terraform으로 인프라 코드화: SSH 키 자동 생성, Security Group 한글 에러, RDS 백업 프리티어 제한
- PG17→PG16 DB 마이그레이션: pg_dump 버전 불일치 삽질, transaction_timeout 호환성
- Route53($0.5/월) 대신 가비아 DNS 무료 운영, Let's Encrypt SSL 자동 갱신
- AWS 프리티어 정책 12개월→6개월 변경 대응, 만료 후 RDS→Docker PG 전환 계획
- RDS 전체 데이터 적재: pg_dump 커스텀 포맷 (5.2GB→922MB 압축), scp→pg_restore, 17테이블 row count 100% 검증
- ETL cron 이전: PowerShell→Bash 변환, Docker exec 방식, 오디터 리뷰 반영 (보안/로깅/권한)
- Vercel Git 연동: GitHub Organization→개인 이전, Hobby 플랜 제약, git author email 매칭

**연결 글**: story 21화(여기까지), 프리퀄 시리즈(인프라 고민)

### story — 23화 후보

**관점**: "서버 이사" 라는 인생 첫 경험. AI와 함께라서 가능했던 하루짜리 마이그레이션.

- Railway가 편했지만 떠나야 했던 이유 (무료 크레딧 만료, DB 500MB 한도)
- AWS 계정 만들기부터 막막했던 순간 (IAM? MFA? Security Group?)
- Claude가 "킵고잉해주세요" 한마디에 8단계를 밀어붙인 과정
- "새우깡" 검색이 되는 순간의 감동
- 5.2GB 데이터를 옮기면서 "덤프가 뭐에요?"라고 물었던 순간
- ETL을 서버에 심고, 오디터가 검증해주는 과정
- 프리티어 6개월 후의 걱정과 계획

## 글감 판단 근거

- [x] 인프라 설계 결정 — EC2+RDS C안 선택, 프리티어 활용 전략, 가비아 DNS
- [x] 운영 노하우 — Terraform IaC, Docker 배포, Nginx+Certbot, DB 백업/복원
- [x] 장애/삽질 경험 — PG 버전 불일치, RDS 프리티어 제한, SG 한글 에러, Windows CRLF
- [x] AI 협업 사례 — Claude와 8단계 마이그레이션 하루 완수
- [x] 비용 최적화 — 프리티어 $0 운영, Route53 절약, 만료 후 전환 계획
- [x] 데이터 무결성 — pg_dump/restore 후 17테이블 row count 전수 비교 검증
- [x] 자동화 — ETL cron 이전, 오디터 리뷰 기반 보안/로깅 개선
