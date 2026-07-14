import React from 'react'
import { Label } from '../ui/label';

const Field = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => {
 
    return (
      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">
          {label}
        </Label>
        {children}
      </div>
    );
}

export default Field