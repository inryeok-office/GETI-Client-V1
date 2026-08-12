import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { InquiryRegistrationFlow } from './InquiryRegistrationFlow';

function renderFlow(
  mockSubmitResult: 'success' | 'error' = 'success',
  initialFeedback: 'success' | 'error' | null = null,
) {
  render(
    <InquiryRegistrationFlow
      initialFeedback={initialFeedback}
      mockSubmitResult={mockSubmitResult}
      list={<p>문의 목록</p>}
    >
      <h1>문의</h1>
    </InquiryRegistrationFlow>,
  );
}

describe('InquiryRegistrationFlow', () => {
  it('문의 등록 버튼으로 모달을 열고 취소할 수 있다', () => {
    renderFlow();

    const openButton = screen.getByRole('button', { name: '문의 등록' });
    openButton.focus();
    fireEvent.click(openButton);

    expect(screen.getByRole('dialog', { name: '문의 등록' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('dialog', { name: '문의 등록' })).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });

  it('필수값이 비어 있으면 각 입력에 오류를 연결한다', () => {
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(screen.getByLabelText('문의 유형')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('제목')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('문의 내용')).toHaveAttribute('aria-invalid', 'true');
  });

  it('피그마에 정의된 문의 유형을 드롭다운에 표시한다', () => {
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByLabelText('문의 유형'));

    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('option', { name: '서비스 이용' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '지원 문의' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '계정·프로필' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '공고 문의' })).toBeInTheDocument();
  });

  it('Mock 등록 성공 후 모달을 닫고 성공 알림을 표시한다', async () => {
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByLabelText('문의 유형'));
    fireEvent.click(screen.getByRole('option', { name: '서비스 이용' }));
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '서비스 문의' } });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '서비스 이용 방법이 궁금합니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled();
    await waitFor(() => {
      expect(screen.getByText('문의가 성공적으로 등록되었습니다.')).toBeInTheDocument();
    });
    expect(screen.queryByRole('dialog', { name: '문의 등록' })).not.toBeInTheDocument();
  });

  it('Mock 등록 실패 후 실패 알림을 표시한다', async () => {
    renderFlow('error');
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByLabelText('문의 유형'));
    fireEvent.click(screen.getByRole('option', { name: '서비스 이용' }));
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '서비스 문의' } });
    fireEvent.change(screen.getByLabelText('문의 내용'), {
      target: { value: '서비스 이용 방법이 궁금합니다.' },
    });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() => {
      expect(
        screen.getByText('문의를 등록하지 못했습니다. 다시 시도해 주세요.'),
      ).toBeInTheDocument();
    });
  });

  it('실패 미리보기 상태에서는 목록 상단에 실패 알림을 표시한다', () => {
    renderFlow('error', 'error');

    expect(screen.getByText('문의를 등록하지 못했습니다. 다시 시도해 주세요.')).toBeInTheDocument();
  });
});
