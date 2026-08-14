/** 목록 페이지의 ?variant=download일 때 자료 일괄 다운로드 모달을 바로 띄운다. */
export function resolveAdminApplicantListVariant(variant?: string): 'download' | undefined {
  return variant === 'download' ? 'download' : undefined;
}

/** 상세 페이지의 ?variant=reject일 때 거부 사유 모달을 바로 띄운다. */
export function resolveAdminApplicantDetailVariant(variant?: string): 'reject' | undefined {
  return variant === 'reject' ? 'reject' : undefined;
}
