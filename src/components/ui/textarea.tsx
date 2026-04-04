import * as React from 'react';
import TextareaAutosize from 'react-textarea-autosize';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<typeof TextareaAutosize>>(
  ({className, ...props}, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          'flex w-full rounded-md bg-background border border-border/15 px-3 py-2 text-body-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-60 md:text-body-md',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
