/** `GET /me/profile` 응답. 다른 회원의 프로필 조회와 같은 스키마를 쓰지만, 현재 로그인한 사용자 조회용이다. */
export interface MyProfile {
  memberId: number;
  name: string;
  profileImageUrl: string | null;
  cohort: number | null;
  department: 'SW_DEVELOPMENT' | 'SMART_IOT' | 'AI' | null;
  majors: string[];
  techStacks: string[];
  desiredJob: string | null;
  bio: string | null;
  profileRestricted: boolean;
  public: boolean;
}
