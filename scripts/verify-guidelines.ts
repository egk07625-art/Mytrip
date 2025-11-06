#!/usr/bin/env node

/**
 * @file verify-guidelines.ts
 * @description 가이드라인 준수 여부를 검증하는 스크립트
 *
 * 검증 항목:
 * 1. 컴포넌트 네이밍 규칙 (PascalCase, kebab-case 파일명, 금지어)
 * 2. Export 규칙 (단일: default, 다중: named)
 * 3. Spacing-First 정책 (margin 금지, padding + gap 사용)
 * 4. Tailwind CSS 우선 (인라인 style 금지)
 * 5. 불필요한 추상화 (단순 래퍼 컴포넌트)
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, basename } from 'path';

interface VerificationResult {
  file: string;
  errors: string[];
  warnings: string[];
  passed: boolean;
}

interface VerificationSummary {
  total: number;
  passed: number;
  failed: number;
  results: VerificationResult[];
}

// 금지어 목록
const FORBIDDEN_NAMES = ['Common', 'Base', 'Util', 'Index', 'Test', 'Tmp', 'Styled'];

// Margin 예외 목록 (허용되는 margin 클래스)
const ALLOWED_MARGIN_CLASSES = ['mx-auto', 'my-auto', 'm-auto'];

/**
 * 파일이 TSX/TS 컴포넌트 파일인지 확인
 */
function isComponentFile(filePath: string): boolean {
  const ext = extname(filePath);
  return ext === '.tsx' || ext === '.ts';
}

/**
 * 디렉토리에서 모든 컴포넌트 파일을 재귀적으로 찾기
 */
function findComponentFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // node_modules, .next 등 제외
      if (!file.startsWith('.') && file !== 'node_modules' && file !== '.next') {
        findComponentFiles(filePath, fileList);
      }
    } else if (isComponentFile(filePath)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * 컴포넌트 네이밍 규칙 검증
 */
function verifyNaming(filePath: string, content: string): string[] {
  const errors: string[] = [];
  const fileName = basename(filePath, extname(filePath));

  // 1. 파일명이 kebab-case인지 확인
  const kebabCasePattern = /^[a-z][a-z0-9-]*$/;
  if (!kebabCasePattern.test(fileName)) {
    errors.push(`파일명이 kebab-case가 아닙니다: "${fileName}" (예: ${fileName.toLowerCase().replace(/([A-Z])/g, '-$1').toLowerCase()})`);
  }

  // 2. 컴포넌트명이 PascalCase인지 확인
  const componentNamePattern = /(?:export\s+default\s+function|const|function)\s+([A-Z][a-zA-Z0-9]*)/g;
  const componentMatches = Array.from(content.matchAll(componentNamePattern));
  
  // Test 파일은 금지어 검사 제외
  const isTestFile = filePath.includes('-test') || filePath.includes('.test.') || filePath.includes('.spec.');
  
  componentMatches.forEach((match) => {
    const componentName = match[1];
    
    // Test 파일은 금지어 검사 제외
    if (!isTestFile) {
      // 금지어 체크
      if (FORBIDDEN_NAMES.some(forbidden => componentName.includes(forbidden))) {
        errors.push(`금지어를 사용한 컴포넌트명: "${componentName}" (금지어: ${FORBIDDEN_NAMES.join(', ')})`);
      }
    }
    
    // PascalCase 체크
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(componentName)) {
      errors.push(`컴포넌트명이 PascalCase가 아닙니다: "${componentName}"`);
    }
  });

  return errors;
}

/**
 * Export 규칙 검증
 */
function verifyExport(filePath: string, content: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 컴포넌트 함수 개수 확인 (React 컴포넌트만)
  // export default function ComponentName 또는 function ComponentName 또는 const ComponentName = 
  const componentPattern = /(?:export\s+default\s+function|^export\s+default|^const\s+|^function\s+)([A-Z][a-zA-Z0-9]*)\s*[=:]/gm;
  const components = Array.from(content.matchAll(componentPattern));
  
  // Named export 개수 확인
  const namedExportPattern = /export\s+(?:const|function|type|interface)\s+[a-zA-Z]/g;
  const namedExports = Array.from(content.matchAll(namedExportPattern));

  // UI 라이브러리 컴포넌트는 예외 (components/ui/)
  const isUIComponent = filePath.includes('components/ui/');
  
  // API route는 예외 (app/api/)
  const isAPIRoute = filePath.includes('app/api/');
  
  // Test 파일은 예외 (test, spec, auth-test, storage-test 등)
  const isTestFile = filePath.includes('-test') || filePath.includes('.test.') || filePath.includes('.spec.');
  
  // 단일 컴포넌트인 경우 default export 확인 (UI 컴포넌트, API route, Test 파일 제외)
  if (!isUIComponent && !isAPIRoute && !isTestFile && components.length === 1 && namedExports.length === 0) {
    if (!content.includes('export default')) {
      errors.push('단일 컴포넌트는 export default를 사용해야 합니다');
    }
  }

  // 다중 export인 경우 named export 확인
  if (components.length > 1 || namedExports.length > 0) {
    // UI 라이브러리 컴포넌트는 예외 (components/ui/)
    // API route는 예외 (app/api/)
    // Test 파일은 예외
    if (!isUIComponent && !isAPIRoute && !isTestFile) {
      if (content.includes('export default') && components.length > 1) {
        warnings.push('다중 컴포넌트는 named export를 사용하는 것이 좋습니다');
      }
    }
  }

  return { errors, warnings };
}

/**
 * Spacing-First 정책 검증
 */
function verifySpacing(filePath: string, content: string): string[] {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Margin 클래스 검사 (className 속성 내에서)
  const classNamePattern = /className=["']([^"']+)["']/g;
  const classNameMatches = Array.from(content.matchAll(classNamePattern));
  
  classNameMatches.forEach((match) => {
    const classNameValue = match[1];
    // margin 클래스 추출 (예외 제외)
    const marginClasses = classNameValue.match(/\b(mt-|mb-|mx-|my-|m-)[a-z0-9-]+/g);
    
    if (marginClasses) {
      marginClasses.forEach((marginClass) => {
        // 예외 목록에 없는 경우만 에러
        if (!ALLOWED_MARGIN_CLASSES.includes(marginClass)) {
          errors.push(`margin 사용 금지: "${marginClass}" (padding + gap 사용 권장)`);
        }
      });
    }
  });

  // Gap 사용 여부 확인 (권장)
  const hasGap = /className.*gap-/.test(content);
  const hasPadding = /className.*p-/.test(content);
  const hasFlexOrGrid = /className.*(flex|grid)/.test(content);
  const hasMargin = /className.*\b(mt-|mb-|mx-|my-|m-)/.test(content);

  if (hasFlexOrGrid && !hasGap && hasMargin) {
    warnings.push('flex/grid 레이아웃에서 gap 사용을 권장합니다');
  }

  return errors;
}

/**
 * Tailwind CSS 우선 사용 검증
 */
function verifyTailwind(filePath: string, content: string): string[] {
  const errors: string[] = [];

  // 인라인 style 검사
  const inlineStylePattern = /style=\{\{/g;
  const inlineStyleMatches = Array.from(content.matchAll(inlineStylePattern));

  inlineStyleMatches.forEach((match, index) => {
    // 예외: globals.css나 설정 파일은 허용
    if (!filePath.includes('globals.css') && !filePath.includes('config')) {
      errors.push(`인라인 style 사용 금지: ${match[0]} (Tailwind CSS 클래스 사용 권장)`);
    }
  });

  // 하드코딩된 hex 컬러 검사
  const hexColorPattern = /(?:bg-|text-|border-)\[#([0-9a-fA-F]{3,6})\]/g;
  const hexMatches = Array.from(content.matchAll(hexColorPattern));
  
  if (hexMatches.length > 0) {
    errors.push(`하드코딩된 hex 컬러 사용: ${hexMatches.map(m => m[0]).join(', ')} (디자인 시스템 컬러 사용 권장)`);
  }

  return errors;
}

/**
 * 불필요한 추상화 검증
 */
function verifyAbstraction(filePath: string, content: string): string[] {
  const warnings: string[] = [];

  // 단순 래퍼 컴포넌트 패턴 감지
  // div + className만 있고 children만 받는 경우
  const simpleWrapperPattern = /(?:export\s+default\s+function|const|function)\s+([A-Z][a-zA-Z0-9]*)\s*\([^)]*children[^)]*\)\s*\{[\s\S]*?return\s*<div\s+className[^>]*>[\s\S]*?\{children\}[\s\S]*?<\/div>[\s\S]*?\}/g;
  
  const wrapperMatches = Array.from(content.matchAll(simpleWrapperPattern));
  
  wrapperMatches.forEach((match) => {
    const componentName = match[1];
    // 로직이 있는지 확인 (상태 관리, 이벤트 핸들러 등)
    const hasLogic = /(?:useState|useEffect|useCallback|useMemo|onClick|onChange|onSubmit)/.test(content);
    
    if (!hasLogic) {
      warnings.push(`불필요한 추상화 가능성: "${componentName}" - 단순 스타일링만 하는 래퍼 컴포넌트일 수 있습니다`);
    }
  });

  return warnings;
}

/**
 * 단일 파일 검증
 */
function verifyFile(filePath: string): VerificationResult {
  let content: string;
  try {
    content = readFileSync(filePath, 'utf-8');
  } catch (error) {
    return {
      file: filePath,
      errors: [`파일을 읽을 수 없습니다: ${error}`],
      warnings: [],
      passed: false,
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // 각 검증 항목 실행
  errors.push(...verifyNaming(filePath, content));
  const exportResult = verifyExport(filePath, content);
  errors.push(...exportResult.errors);
  warnings.push(...exportResult.warnings);
  errors.push(...verifySpacing(filePath, content));
  errors.push(...verifyTailwind(filePath, content));
  warnings.push(...verifyAbstraction(filePath, content));

  // 상대 경로로 변환
  const relativePath = filePath.replace(process.cwd() + '\\', '').replace(process.cwd() + '/', '');

  return {
    file: relativePath,
    errors,
    warnings,
    passed: errors.length === 0,
  };
}

/**
 * 메인 검증 함수
 */
function verifyGuidelines(targetDirs: string[] = ['components', 'app']): VerificationSummary {
  const results: VerificationResult[] = [];
  const allFiles: string[] = [];

  // 대상 디렉토리에서 파일 찾기
  targetDirs.forEach((dir) => {
    try {
      const files = findComponentFiles(dir);
      allFiles.push(...files);
    } catch (error) {
      console.error(`디렉토리를 읽을 수 없습니다: ${dir}`, error);
    }
  });

  // 각 파일 검증
  allFiles.forEach((file) => {
    try {
      const result = verifyFile(file);
      results.push(result);
    } catch (error) {
      console.error(`파일 검증 실패: ${file}`, error);
    }
  });

  // 요약 통계
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  return {
    total: results.length,
    passed,
    failed,
    results,
  };
}

/**
 * 리포트 생성
 */
function generateReport(summary: VerificationSummary): string {
  let report = '# 가이드라인 준수 검증 리포트\n\n';
  report += `생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;
  report += `## 전체 요약\n\n`;
  report += `- 총 파일 수: ${summary.total}\n`;
  report += `- 통과: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)\n`;
  report += `- 실패: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)\n\n`;

  // 실패한 파일들
  const failedResults = summary.results.filter((r) => !r.passed);
  if (failedResults.length > 0) {
    report += `## 실패한 파일 (${failedResults.length}개)\n\n`;
    failedResults.forEach((result) => {
      report += `### ${result.file}\n\n`;
      if (result.errors.length > 0) {
        report += `**에러:**\n`;
        result.errors.forEach((error) => {
          report += `- ❌ ${error}\n`;
        });
        report += `\n`;
      }
      if (result.warnings.length > 0) {
        report += `**경고:**\n`;
        result.warnings.forEach((warning) => {
          report += `- ⚠️ ${warning}\n`;
        });
        report += `\n`;
      }
    });
  }

  // 경고만 있는 파일들
  const warningOnlyResults = summary.results.filter((r) => r.passed && r.warnings.length > 0);
  if (warningOnlyResults.length > 0) {
    report += `## 경고가 있는 파일 (${warningOnlyResults.length}개)\n\n`;
    warningOnlyResults.forEach((result) => {
      report += `### ${result.file}\n\n`;
      result.warnings.forEach((warning) => {
        report += `- ⚠️ ${warning}\n`;
      });
      report += `\n`;
    });
  }

  // 통과한 파일들
  const passedResults = summary.results.filter((r) => r.passed && r.warnings.length === 0);
  if (passedResults.length > 0) {
    report += `## 통과한 파일 (${passedResults.length}개)\n\n`;
    passedResults.forEach((result) => {
      report += `- ✅ ${result.file}\n`;
    });
  }

  return report;
}

// 메인 실행
const args = process.argv.slice(2);
const targetDirs = args.length > 0 ? args : ['components', 'app'];

console.log('가이드라인 검증을 시작합니다...\n');
console.log(`대상 디렉토리: ${targetDirs.join(', ')}\n`);

const summary = verifyGuidelines(targetDirs);

// 콘솔 출력
console.log('=== 검증 결과 ===\n');
console.log(`총 파일 수: ${summary.total}`);
if (summary.total > 0) {
  console.log(`통과: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
  console.log(`실패: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)\n`);
} else {
  console.log('검증할 파일이 없습니다.\n');
}

// 실패한 파일 상세 정보
const failedResults = summary.results.filter((r) => !r.passed);
if (failedResults.length > 0) {
  console.log('=== 실패한 파일 ===\n');
  failedResults.forEach((result) => {
    console.log(`\n${result.file}:`);
    result.errors.forEach((error) => {
      console.log(`  ❌ ${error}`);
    });
    result.warnings.forEach((warning) => {
      console.log(`  ⚠️ ${warning}`);
    });
  });
}

// 리포트 파일 생성
const report = generateReport(summary);
const reportPath = join(process.cwd(), 'docs', 'guideline-verification-report.md');

try {
  const { writeFileSync } = require('fs');
  writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 리포트가 생성되었습니다: ${reportPath}`);
} catch (error) {
  console.error('리포트 파일 생성 실패:', error);
}

// 실패가 있으면 종료 코드 1
process.exit(summary.failed > 0 ? 1 : 0);

export { verifyGuidelines, generateReport, VerificationResult, VerificationSummary };

