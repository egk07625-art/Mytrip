#!/usr/bin/env node

/**
 * @file verify-env.ts
 * @description 환경변수 보안 검증 스크립트
 *
 * 검증 항목:
 * 1. 필수 환경변수 존재 확인
 * 2. 환경변수 형식 검증 (API 키 길이, 접두사 등)
 * 3. 보안 취약점 점검 (공개 저장소 노출 방지)
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface EnvVarConfig {
  name: string;
  required: boolean;
  description: string;
  validator?: (value: string) => { valid: boolean; error?: string };
  isPublic?: boolean; // NEXT_PUBLIC_ 접두사 여부
}

// 환경변수 설정 정의
const ENV_VAR_CONFIGS: EnvVarConfig[] = [
  {
    name: 'TOUR_API_KEY',
    required: false, // NEXT_PUBLIC_TOUR_API_KEY와 둘 중 하나만 있으면 됨
    description: '한국관광공사 API 키 (서버 전용)',
    validator: (value) => {
      if (value.length < 10) {
        return { valid: false, error: 'API 키가 너무 짧습니다 (최소 10자)' };
      }
      return { valid: true };
    },
  },
  {
    name: 'NEXT_PUBLIC_TOUR_API_KEY',
    required: false, // TOUR_API_KEY와 둘 중 하나만 있으면 됨
    description: '한국관광공사 API 키 (클라이언트 접근 가능)',
    validator: (value) => {
      if (value.length < 10) {
        return { valid: false, error: 'API 키가 너무 짧습니다 (최소 10자)' };
      }
      return { valid: true };
    },
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    required: true,
    description: 'Clerk 인증 Publishable Key',
    validator: (value) => {
      if (!value.startsWith('pk_')) {
        return { valid: false, error: 'Clerk Publishable Key는 "pk_"로 시작해야 합니다' };
      }
      if (value.length < 20) {
        return { valid: false, error: 'Clerk Publishable Key가 너무 짧습니다' };
      }
      return { valid: true };
    },
    isPublic: true,
  },
  {
    name: 'CLERK_SECRET_KEY',
    required: true,
    description: 'Clerk 인증 Secret Key',
    validator: (value) => {
      if (!value.startsWith('sk_')) {
        return { valid: false, error: 'Clerk Secret Key는 "sk_"로 시작해야 합니다' };
      }
      if (value.length < 20) {
        return { valid: false, error: 'Clerk Secret Key가 너무 짧습니다' };
      }
      return { valid: true };
    },
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_URL',
    required: true,
    description: 'Supabase 프로젝트 URL',
    validator: (value) => {
      try {
        const url = new URL(value);
        if (!url.hostname.includes('supabase.co')) {
          return { valid: false, error: 'Supabase URL 형식이 올바르지 않습니다' };
        }
        return { valid: true };
      } catch {
        return { valid: false, error: '유효한 URL 형식이 아닙니다' };
      }
    },
    isPublic: true,
  },
  {
    name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    required: true,
    description: 'Supabase Anon Key',
    validator: (value) => {
      if (value.length < 50) {
        return { valid: false, error: 'Supabase Anon Key가 너무 짧습니다' };
      }
      return { valid: true };
    },
    isPublic: true,
  },
  {
    name: 'SUPABASE_SERVICE_ROLE_KEY',
    required: true,
    description: 'Supabase Service Role Key',
    validator: (value) => {
      if (value.length < 50) {
        return { valid: false, error: 'Supabase Service Role Key가 너무 짧습니다' };
      }
      return { valid: true };
    },
  },
  {
    name: 'NEXT_PUBLIC_STORAGE_BUCKET',
    required: false,
    description: 'Supabase Storage 버킷 이름',
    validator: (value) => {
      if (value.length < 1) {
        return { valid: false, error: 'Storage 버킷 이름이 비어있습니다' };
      }
      return { valid: true };
    },
    isPublic: true,
  },
];

interface VerificationResult {
  envVar: string;
  exists: boolean;
  valid: boolean;
  error?: string;
  warning?: string;
}

interface VerificationSummary {
  total: number;
  passed: number;
  failed: number;
  warnings: number;
  results: VerificationResult[];
}

/**
 * .env.local 파일에서 환경변수 읽기
 */
function loadEnvFile(): Record<string, string> {
  const envPath = join(process.cwd(), '.env.local');
  const env: Record<string, string> = {};

  if (!existsSync(envPath)) {
    return env;
  }

  try {
    const content = readFileSync(envPath, 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      // 주석 제외
      if (trimmed.startsWith('#') || !trimmed) {
        continue;
      }

      // KEY=VALUE 형식 파싱
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^["']|["']$/g, ''); // 따옴표 제거
        env[key] = value;
      }
    }
  } catch (error) {
    console.error('환경변수 파일 읽기 실패:', error);
  }

  return env;
}

/**
 * .gitignore 파일에서 .env.local이 포함되어 있는지 확인
 */
function verifyGitignore(): { valid: boolean; error?: string } {
  const gitignorePath = join(process.cwd(), '.gitignore');

  if (!existsSync(gitignorePath)) {
    return { valid: false, error: '.gitignore 파일이 없습니다' };
  }

  try {
    const content = readFileSync(gitignorePath, 'utf-8');
    const lines = content.split('\n').map((line) => line.trim());

    // .env.local 또는 .env* 패턴 확인
    const hasEnvIgnore =
      lines.includes('.env.local') ||
      lines.includes('.env*') ||
      lines.some((line) => line.startsWith('.env'));

    if (!hasEnvIgnore) {
      return {
        valid: false,
        error: '.gitignore에 .env.local이 포함되어 있지 않습니다 (보안 위험)',
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: `.gitignore 파일 읽기 실패: ${error}` };
  }
}

/**
 * 환경변수 검증
 */
function verifyEnvVars(): VerificationSummary {
  const env = loadEnvFile();
  const processEnv = process.env;
  const results: VerificationResult[] = [];

  // TOUR_API_KEY와 NEXT_PUBLIC_TOUR_API_KEY 중 하나는 있어야 함
  const hasTourApiKey = Boolean(env.TOUR_API_KEY || processEnv.TOUR_API_KEY);
  const hasPublicTourApiKey = Boolean(
    env.NEXT_PUBLIC_TOUR_API_KEY || processEnv.NEXT_PUBLIC_TOUR_API_KEY,
  );

  for (const config of ENV_VAR_CONFIGS) {
    const value = env[config.name] || processEnv[config.name];
    const exists = Boolean(value);

    // TOUR_API_KEY와 NEXT_PUBLIC_TOUR_API_KEY는 둘 중 하나만 있으면 됨
    if (config.name === 'TOUR_API_KEY' || config.name === 'NEXT_PUBLIC_TOUR_API_KEY') {
      if (!hasTourApiKey && !hasPublicTourApiKey) {
        results.push({
          envVar: config.name,
          exists: false,
          valid: false,
          error: 'TOUR_API_KEY 또는 NEXT_PUBLIC_TOUR_API_KEY 중 하나는 필수입니다',
        });
        continue;
      } else if (exists) {
        // 값이 있으면 형식 검증
        if (config.validator) {
          const validation = config.validator(value);
          results.push({
            envVar: config.name,
            exists: true,
            valid: validation.valid,
            error: validation.error,
          });
        } else {
          results.push({
            envVar: config.name,
            exists: true,
            valid: true,
          });
        }
        continue;
      } else {
        // 다른 하나가 있으면 이건 선택 사항
        results.push({
          envVar: config.name,
          exists: false,
          valid: true, // 다른 하나가 있으면 통과
        });
        continue;
      }
    }

    // 필수 환경변수 확인
    if (config.required && !exists) {
      results.push({
        envVar: config.name,
        exists: false,
        valid: false,
        error: `필수 환경변수가 설정되지 않았습니다: ${config.description}`,
      });
      continue;
    }

    // 값이 있으면 형식 검증
    if (exists && config.validator) {
      const validation = config.validator(value);
      results.push({
        envVar: config.name,
        exists: true,
        valid: validation.valid,
        error: validation.error,
      });
    } else if (exists) {
      results.push({
        envVar: config.name,
        exists: true,
        valid: true,
      });
    } else {
      // 선택적 환경변수는 없어도 통과
      results.push({
        envVar: config.name,
        exists: false,
        valid: true,
      });
    }
  }

  // .gitignore 검증
  const gitignoreCheck = verifyGitignore();
  if (!gitignoreCheck.valid) {
    results.push({
      envVar: '.gitignore',
      exists: true,
      valid: false,
      error: gitignoreCheck.error,
    });
  }

  // 요약 통계
  const passed = results.filter((r) => r.valid).length;
  const failed = results.filter((r) => !r.valid).length;
  const warnings = results.filter((r) => r.warning).length;

  return {
    total: results.length,
    passed,
    failed,
    warnings,
    results,
  };
}

/**
 * 리포트 생성
 */
function generateReport(summary: VerificationSummary): string {
  let report = '# 환경변수 보안 검증 리포트\n\n';
  report += `생성일: ${new Date().toLocaleString('ko-KR')}\n\n`;
  report += `## 전체 요약\n\n`;
  report += `- 총 검증 항목: ${summary.total}\n`;
  report += `- 통과: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)\n`;
  report += `- 실패: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)\n\n`;

  // 실패한 항목들
  const failedResults = summary.results.filter((r) => !r.valid);
  if (failedResults.length > 0) {
    report += `## 실패한 항목 (${failedResults.length}개)\n\n`;
    failedResults.forEach((result) => {
      report += `### ${result.envVar}\n\n`;
      if (result.error) {
        report += `**에러:** ${result.error}\n\n`;
      }
      if (result.warning) {
        report += `**경고:** ${result.warning}\n\n`;
      }
    });
  }

  // 통과한 항목들
  const passedResults = summary.results.filter((r) => r.valid);
  if (passedResults.length > 0) {
    report += `## 통과한 항목 (${passedResults.length}개)\n\n`;
    passedResults.forEach((result) => {
      const config = ENV_VAR_CONFIGS.find((c) => c.name === result.envVar);
      const status = result.exists ? '✅ 설정됨' : '⚠️ 선택 사항 (설정 안 됨)';
      report += `- **${result.envVar}**: ${status}${config ? ` - ${config.description}` : ''}\n`;
    });
  }

  return report;
}

// 메인 실행
console.log('환경변수 보안 검증을 시작합니다...\n');

const summary = verifyEnvVars();

// 콘솔 출력
console.log('=== 검증 결과 ===\n');
console.log(`총 검증 항목: ${summary.total}`);
if (summary.total > 0) {
  console.log(`통과: ${summary.passed} (${((summary.passed / summary.total) * 100).toFixed(1)}%)`);
  console.log(`실패: ${summary.failed} (${((summary.failed / summary.total) * 100).toFixed(1)}%)\n`);
} else {
  console.log('검증할 항목이 없습니다.\n');
}

// 실패한 항목 상세 정보
const failedResults = summary.results.filter((r) => !r.valid);
if (failedResults.length > 0) {
  console.log('=== 실패한 항목 ===\n');
  failedResults.forEach((result) => {
    console.log(`\n${result.envVar}:`);
    if (result.error) {
      console.log(`  ❌ ${result.error}`);
    }
    if (result.warning) {
      console.log(`  ⚠️ ${result.warning}`);
    }
  });
}

// 통과한 항목 요약
const passedResults = summary.results.filter((r) => r.valid);
if (passedResults.length > 0) {
  console.log('\n=== 통과한 항목 ===\n');
  passedResults.forEach((result) => {
    const config = ENV_VAR_CONFIGS.find((c) => c.name === result.envVar);
    const status = result.exists ? '✅' : '⚠️';
    const description = config ? ` - ${config.description}` : '';
    console.log(`${status} ${result.envVar}${description}`);
  });
}

// 리포트 파일 생성
const report = generateReport(summary);
const reportPath = join(process.cwd(), 'docs', 'env-verification-report.md');

try {
  const { writeFileSync } = require('fs');
  writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n📄 리포트가 생성되었습니다: ${reportPath}`);
} catch (error) {
  console.error('리포트 파일 생성 실패:', error);
}

// 실패가 있으면 종료 코드 1
process.exit(summary.failed > 0 ? 1 : 0);

export { verifyEnvVars, generateReport };
export type { VerificationResult, VerificationSummary };

