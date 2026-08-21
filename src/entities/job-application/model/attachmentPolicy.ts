/**
 * `app.file.policies.JOB_APPLICATION`(GETI-Server `src/main/resources/application.yaml`)의
 * 실제 제약을 그대로 옮겼다. 서버가 파일 내용까지 검사해 최종 판단하지만, 명백히 안 맞는 파일을
 * 업로드 요청 전에 걸러 사용자에게 바로 알려주기 위해 클라이언트에서도 같은 기준으로 미리 검사한다.
 */
export const ALLOWED_ATTACHMENT_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
export const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_ATTACHMENT_COUNT = 5;
