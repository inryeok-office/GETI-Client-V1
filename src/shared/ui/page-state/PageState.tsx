import { Icon, type IconName } from '@/shared/ui/icon';

type PageStateVariant = 'empty' | 'error' | 'forbidden' | 'loading';

interface PageStateProps {
  description: string;
  title: string;
  variant: PageStateVariant;
}

const ICON_BY_VARIANT: Record<PageStateVariant, IconName> = {
  empty: 'searchOff',
  error: 'alertCircleLarge',
  forbidden: 'alertCircleLarge',
  loading: 'spinner',
};

export function PageState({ description, title, variant }: PageStateProps) {
  const iconName = ICON_BY_VARIANT[variant];

  return (
    <section
      className="flex min-h-60 flex-col items-center justify-center px-6 py-12 text-center"
      aria-live={variant === 'loading' ? 'polite' : undefined}
    >
      <Icon
        name={iconName}
        className={`mb-4 size-12 ${variant === 'loading' ? 'text-primary-700 animate-spin' : 'text-neutral-400'}`}
      />
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        {title}
      </h2>
      <p className="mt-2 max-w-md text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
        {description}
      </p>
    </section>
  );
}
