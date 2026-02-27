# CLAUDE.md - Claude Code Project Configuration

## Project
ORBIT - Personal Emotional Operating System (감정 구조화 모바일 앱)

## Stack
- **Mobile**: React Native + Expo SDK 52+, TypeScript strict
- **UI**: Tamagui + react-native-reanimated + @shopify/react-native-skia
- **Charts**: Victory Native v41+ (Skia-based)
- **State**: Zustand + TanStack Query
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **AI**: OpenAI GPT-4o-mini (Mirror Engine), Claude Haiku (fallback)
- **Infra**: AWS Seoul (S3, CloudFront) + Supabase + Firebase (FCM)
- **CI/CD**: GitHub Actions + EAS Build/Submit

## Conventions
- Korean UI text throughout the app (한국어)
- File-based routing via Expo Router (app/ directory)
- Zustand stores in stores/ directory
- Supabase Edge Functions in supabase/functions/
- DB migrations in supabase/migrations/
- Components organized by feature domain (emotion/, mirror/, insights/, archive/, canvas/, ui/)

## Commands
- `npx expo start` - 개발 서버 시작
- `npx expo start --clear` - 캐시 초기화 후 시작
- `eas build --platform ios --profile preview` - iOS 프리뷰 빌드
- `eas build --platform android --profile preview` - Android 프리뷰 빌드
- `npx supabase db push` - DB 마이그레이션 적용
- `npx supabase functions deploy` - Edge Functions 배포
- `npm test` - Jest 테스트 실행
- `npm run lint` - ESLint 실행
- `npm run typecheck` - TypeScript 타입 체크

## Architecture Decisions
- Mirror Card UI: 고정 3단 구조 (이해/구조/제안), 채팅 UI 금지
- Pattern Engine: 순수 SQL/규칙 기반 (LLM 사용 안 함)
- Emotion input: 최대 3개 감정 다중 선택, 강도 1-5
- Theme: Deep navy/midnight blue, cosmic but subtle
- Animation: 절제된 glow 효과, 과하지 않게
- No gamification: 포인트/배지/레벨 없음

## Code Style
- TypeScript strict mode
- Functional components with hooks
- Named exports preferred
- Pretendard font family for Korean text
- Color tokens defined in theme/tokens.ts
