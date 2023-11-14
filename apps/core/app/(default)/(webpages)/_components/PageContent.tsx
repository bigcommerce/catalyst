import { cn } from '~/lib/utils';

interface Props {
  className?: string;
  title: string;
  content: string;
}

export const PageContent = ({ className, content, title }: Props) => {
  return (
    <div className={cn('mx-auto mb-10 flex flex-col justify-center gap-8 lg:w-2/3', className)}>
      <h1 className="text-h3 lg:text-h2">{title}</h1>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};
