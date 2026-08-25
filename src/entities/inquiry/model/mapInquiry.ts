import type {
  AdminInquiryDetail,
  AdminInquiryListApiItem,
  AdminInquiryListItem,
  InquiryDetail,
  InquiryDetailApiResponse,
  InquiryFile,
  InquiryFileApiResponse,
  InquiryListApiItem,
  InquiryListItem,
} from './types';

function mapInquiryFile(file: InquiryFileApiResponse): InquiryFile {
  return {
    fileId: String(file.fileId),
    originalName: file.originalName,
    contentType: file.contentType,
    size: file.size,
    downloadUrl: file.downloadUrl,
  };
}

export function mapInquiryListItem(item: InquiryListApiItem): InquiryListItem {
  return {
    inquiryId: String(item.inquiryId),
    inquiryType: item.inquiryType,
    title: item.title,
    status: item.status,
    createdAt: item.createdAt,
  };
}

export function mapInquiryDetail(detail: InquiryDetailApiResponse): InquiryDetail {
  return {
    inquiryId: String(detail.inquiryId),
    inquiryType: detail.inquiryType,
    title: detail.title,
    content: detail.content,
    status: detail.status,
    createdAt: detail.createdAt,
    files: detail.files.map(mapInquiryFile),
    answers: detail.answers.map((answer) => ({
      answerId: String(answer.answerId),
      content: answer.content,
      createdAt: answer.createdAt,
      files: answer.files.map(mapInquiryFile),
    })),
  };
}

export function mapAdminInquiryListItem(item: AdminInquiryListApiItem): AdminInquiryListItem {
  return {
    inquiryId: String(item.inquiryId),
    inquiryType: item.inquiryType,
    title: item.title,
    status: item.status,
    author: {
      memberId: String(item.author.memberId),
      name: item.author.name ?? '이름 없음',
    },
    assignee: item.assignee
      ? { memberId: String(item.assignee.memberId), name: item.assignee.name }
      : null,
    createdAt: item.createdAt,
    answeredAt: item.answeredAt,
  };
}

export function mapAdminInquiryDetail(detail: InquiryDetailApiResponse): AdminInquiryDetail {
  return {
    ...mapInquiryDetail(detail),
    author: {
      memberId: String(detail.author.memberId),
      name: detail.author.name ?? '이름 없음',
      profileImageUrl: detail.author.profileImageUrl,
      cohort: detail.author.cohort,
      department: detail.author.department,
      isPublic: detail.author.isPublic,
    },
    assignee: detail.assignee
      ? { memberId: String(detail.assignee.memberId), name: detail.assignee.name }
      : null,
  };
}
