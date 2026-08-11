export interface StudentListItem {
  cohort: number;
  id: string;
  major: string;
  name: string;
}

export interface StudentProfile extends StudentListItem {
  introduction: string;
  links: StudentProfileLink[];
  skills: string[];
}

export interface StudentProfileLink {
  href?: string;
  icon: 'blog' | 'github' | 'portfolio';
  isPrivate?: boolean;
  label: string;
}
