import type {
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
