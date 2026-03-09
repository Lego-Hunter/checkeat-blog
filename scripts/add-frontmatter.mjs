/**
 * 마크다운 파일에 frontmatter를 추가하고 src/content/로 복사하는 스크립트
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';

const ROOT = 'c:/Users/almig/projects/checkeat-blog';

// story 메타데이터
const storyMeta = [
  { file: '00_prologue.md', title: '프롤로그: 이런 앱, 정말 만들 수 있을까요?', episode: 0, description: '호빵 성분표에서 시작된 의문, 그리고 첵잇의 시작' },
  { file: '01_label.md', title: '1화: 성분표라는 외국어', episode: 1, description: '마트에서 제품을 뒤집어보기 시작한 이유' },
  { file: '02_benchmark.md', title: '2화: 이미 누군가 만들었을 텐데', episode: 2, description: '기존 식품 앱들을 써보고 느낀 것' },
  { file: '03_scope.md', title: '3화: 전부 다 만들 수는 없으니까', episode: 3, description: '기능 범위를 줄이는 용기' },
  { file: '04_opendata.md', title: '4화: 정부가 데이터를 공개한다는 것', episode: 4, description: '공공데이터의 가능성과 현실의 괴리' },
  { file: '05_api.md', title: '5화: 식약처 API 11종과의 첫 만남', episode: 5, description: 'API 연동의 시작, 예상과 다른 응답들' },
  { file: '06_database.md', title: '6화: 제품 100만 개를 담을 그릇', episode: 6, description: '데이터베이스 설계와 기술 스택 선택' },
  { file: '07_haccp.md', title: '7화: 포장지에 답이 있었습니다', episode: 7, description: 'HACCP 포장지에서 누락 데이터를 발견하다' },
  { file: '08_parsing.md', title: '8화: "정제수, 설탕, 산도조절제(구연산)"', episode: 8, description: '원재료 텍스트를 기계가 이해하게 만드는 과정' },
  { file: '09_bracket.md', title: '9화: 괄호 안의 괄호 안의 괄호', episode: 9, description: '중첩 괄호 파싱이라는 예상 밖의 난관' },
  { file: '10_synonym.md', title: '10화: 이 성분이 저 성분이랑 같은 건가요', episode: 10, description: '동의어와 이명 처리의 복잡함' },
  { file: '11_matching.md', title: '11화: 700만 번의 대조작업', episode: 11, description: '원재료를 표준 사전에 연결하는 매칭 엔진' },
  { file: '12_shrimp.md', title: '12화: 새우깡 사건', episode: 12, description: 'AI가 만든 매칭이 2,434건 전부 틀렸던 사건' },
  { file: '13_integrity.md', title: '13화: 다시는 틀리지 않겠다는 약속', episode: 13, description: '데이터 무결성 3원칙의 탄생' },
  { file: '14_nutrition.md', title: '14화: 영양정보가 0.1%만 채워져 있다면', episode: 14, description: '다중 소스 영양정보 병합 전략' },
  { file: '15_additive.md', title: '15화: 감칠맛 조미료의 정체', episode: 15, description: '첨가물 번역과 분류의 세계' },
  { file: '16_regulation.md', title: '16화: 법이 바뀌면 앱도 바뀌어야 한다', episode: 16, description: '규제 변경 모니터링 자동화' },
  { file: '17_stop.md', title: '17화: AI 두 명이 동시에 말했다', episode: 17, description: '99.5%에서 멈추라는 두 AI의 권고' },
  { file: '18_deploy.md', title: '18화: 만든 걸 세상에 내놓기', episode: 18, description: '배포와 프라이버시 설계' },
  { file: '19_business.md', title: '19화: 이걸로 사업을 할 수 있을까', episode: 19, description: '예비창업패키지와 사업화 고민' },
  { file: '20_letter.md', title: '20화: 이 앱을 쓸 사람에게 보내는 편지', episode: 20, description: '미래의 사용자에게' },
  { file: '21_here.md', title: '21화: 여기까지, 그리고 여기부터', episode: 21, description: '지금까지의 여정과 앞으로의 방향' },
];

// tech 메타데이터 (README.md TOC 기반)
const techMeta = [
  // Phase 1: 데이터 수집
  { file: 'public-data/01_api-response-4types.md', title: '식약처 API 11종 연동기: 응답 구조가 4개나 되는 이유', phase: 1, phaseName: '데이터 수집', series: 'public-data', order: 1, storyRef: '5화' },
  { file: 'public-data/02_info200-not-success.md', title: 'INFO-200은 "성공"이 아닙니다', phase: 1, phaseName: '데이터 수집', series: 'public-data', order: 2, storyRef: '5화' },
  { file: 'public-data/03_etl-million-rows.md', title: '104만 건, 매번 전부 다시 받아야 할 때의 ETL 전략', phase: 1, phaseName: '데이터 수집', series: 'public-data', order: 3, storyRef: '5화, 20화' },
  { file: 'public-data/04_haccp-discovery.md', title: 'C002에 없는 데이터를 HACCP 포장지에서 찾다', phase: 1, phaseName: '데이터 수집', series: 'public-data', order: 4, storyRef: '7화' },
  // Phase 2: 파싱
  { file: 'public-data/05_parsing-4steps.md', title: '구분자가 5종류일 때: 원재료 텍스트 파싱 4단계 전략', phase: 2, phaseName: '파싱', series: 'public-data', order: 5, storyRef: '8화' },
  { file: 'public-data/06_bracket-parser.md', title: '괄호 깊이 3단계 파싱기 만들기', phase: 2, phaseName: '파싱', series: 'public-data', order: 6, storyRef: '9화' },
  { file: 'public-data/07_skip-patterns.md', title: '걸러내야 할 것들 — skip_patterns 설계기', phase: 2, phaseName: '파싱', series: 'public-data', order: 7, storyRef: '8화' },
  { file: 'public-data/08_haccp-nutrient-parser.md', title: 'HACCP 포장지 영양성분 파싱: "1g미만"과 "less than 1g"', phase: 2, phaseName: '파싱', series: 'public-data', order: 8, storyRef: '14화' },
  // Phase 3: 매칭
  { file: 'public-data/09_deterministic-matching.md', title: '결정성 매칭 엔진 설계: 퍼지 매칭을 버린 이유', phase: 3, phaseName: '매칭', series: 'public-data', order: 9, storyRef: '10화, 11화' },
  { file: 'public-data/10_alias-hijacking.md', title: '2-Pass Alias 정제: 데이터가 데이터를 하이재킹할 때', phase: 3, phaseName: '매칭', series: 'public-data', order: 10, storyRef: '10화' },
  { file: 'ai-dev/01_shrimp-incident.md', title: 'AI가 만든 매칭 엔진, 2,434건이 전부 틀렸다', phase: 3, phaseName: '매칭', series: 'ai-dev', order: 11, storyRef: '12화' },
  { file: 'ai-dev/02_integrity-principles.md', title: '다시는 틀리지 않겠다는 약속 — 데이터 무결성 3원칙', phase: 3, phaseName: '매칭', series: 'ai-dev', order: 12, storyRef: '13화' },
  // Phase 4: 보강
  { file: 'public-data/11_nutrition-merge.md', title: '영양정보 완전도 0.1% — 다중 소스 병합 전략', phase: 4, phaseName: '보강', series: 'public-data', order: 13, storyRef: '14화' },
  { file: 'public-data/12_hwpx-parsing.md', title: '첨가물 고시를 코드로 읽다: PDF 정규식 vs hwpx 파싱', phase: 4, phaseName: '보강', series: 'public-data', order: 14, storyRef: '15화' },
  { file: 'ai-dev/03_llm-translation.md', title: '3,800종 첨가물 번역: 수작업 100개에서 LLM 421개까지', phase: 4, phaseName: '보강', series: 'ai-dev', order: 15, storyRef: '15화' },
  { file: 'public-data/13_rss-monitoring.md', title: '식약처 고시가 바뀌면 코드도 바뀌어야 한다 — RSS 모니터링', phase: 4, phaseName: '보강', series: 'public-data', order: 16, storyRef: '16화' },
  // Phase 5: 표현
  { file: 'public-data/14_risk-4levels.md', title: '기피성분 4단계 분류: 법정 알레르겐에서 윤리적 선호까지', phase: 5, phaseName: '안전한 표현', series: 'public-data', order: 17, storyRef: '15화, 16화' },
  { file: 'public-data/15_expression-guide.md', title: '"유해합니다"를 쓰면 안 되는 이유 — 표현 가이드라인의 기술적 구현', phase: 5, phaseName: '안전한 표현', series: 'public-data', order: 18, storyRef: '15화' },
  { file: 'public-data/16_privacy-localstorage.md', title: '대체 제안을 서버가 아닌 브라우저에서 계산하는 이유', phase: 5, phaseName: '안전한 표현', series: 'public-data', order: 19, storyRef: '18화' },
  // Phase 6: 아키텍처
  { file: 'ai-dev/04_stack-choice.md', title: '비개발자가 Django+Next.js를 선택한 과정', phase: 6, phaseName: '아키텍처', series: 'ai-dev', order: 20, storyRef: '6화' },
  { file: 'public-data/17_base-etl-command.md', title: 'ETL 45개 커맨드를 하나의 패턴으로: BaseEtlCommand 설계', phase: 6, phaseName: '아키텍처', series: 'public-data', order: 21, storyRef: '5화, 6화' },
  { file: 'public-data/18_data-model.md', title: '19개 테이블, 원본은 절대 건드리지 않는다 — 데이터 모델 설계 원칙', phase: 6, phaseName: '아키텍처', series: 'public-data', order: 22, storyRef: '6화' },
  // Phase 7: AI 협업
  { file: 'ai-dev/05_cross-review.md', title: 'Claude와 Gemini 크로스 리뷰 워크플로우', phase: 7, phaseName: 'AI 협업', series: 'ai-dev', order: 23, storyRef: '17화, 21화' },
  { file: 'ai-dev/06_stop-at-995.md', title: '"이제 그만하세요" — 99.5%에서 멈추는 용기', phase: 7, phaseName: 'AI 협업', series: 'ai-dev', order: 24, storyRef: '17화' },
  { file: 'ai-dev/07_verification-needed.md', title: '검증 체계가 없으면 AI는 위험하다', phase: 7, phaseName: 'AI 협업', series: 'ai-dev', order: 25, storyRef: '12화, 13화' },
];

function addFrontmatter(content, frontmatter) {
  // 이미 frontmatter가 있으면 건너뜀
  if (content.startsWith('---')) return content;

  // 첫 줄이 # 제목이면 제거 (frontmatter에 title이 있으므로)
  const lines = content.split('\n');
  let startIdx = 0;
  if (lines[0].startsWith('# ')) {
    startIdx = 1;
    // 제목 다음 빈 줄도 제거
    while (startIdx < lines.length && lines[startIdx].trim() === '') startIdx++;
  }

  const fm = ['---'];
  for (const [key, value] of Object.entries(frontmatter)) {
    if (typeof value === 'string') {
      fm.push(`${key}: "${value.replace(/"/g, '\\"')}"`);
    } else {
      fm.push(`${key}: ${value}`);
    }
  }
  fm.push('---');
  fm.push('');

  return fm.join('\n') + lines.slice(startIdx).join('\n');
}

// story 처리
console.log('=== Story 파일 처리 ===');
for (const meta of storyMeta) {
  const srcPath = join(ROOT, 'story', meta.file);
  const destPath = join(ROOT, 'src/content/story', meta.file);
  const content = readFileSync(srcPath, 'utf-8');

  const frontmatter = {
    title: meta.title,
    episode: meta.episode,
    description: meta.description,
    series: 'story',
  };

  const newContent = addFrontmatter(content, frontmatter);
  writeFileSync(destPath, newContent, 'utf-8');
  console.log(`  ${meta.file} -> OK`);
}

// tech 처리
console.log('\n=== Tech 파일 처리 ===');
for (const meta of techMeta) {
  const srcPath = join(ROOT, 'tech', meta.file);
  const destDir = join(ROOT, 'src/content/tech', meta.series);
  const destPath = join(ROOT, 'src/content/tech', meta.file);

  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

  const content = readFileSync(srcPath, 'utf-8');

  const frontmatter = {
    title: meta.title,
    phase: meta.phase,
    phaseName: meta.phaseName,
    series: meta.series,
    order: meta.order,
    storyRef: meta.storyRef,
  };

  const newContent = addFrontmatter(content, frontmatter);
  writeFileSync(destPath, newContent, 'utf-8');
  console.log(`  ${meta.file} -> OK`);
}

console.log('\n완료!');
