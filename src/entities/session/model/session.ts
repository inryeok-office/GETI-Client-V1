export type SessionRole = 'DEVELOPER' | 'STUDENT' | 'TEACHER';

export interface Session {
  memberId: number;
  roles: SessionRole[];
}
