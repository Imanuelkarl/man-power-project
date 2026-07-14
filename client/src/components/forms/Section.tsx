import React from 'react'
import { Card } from '../ui/card';

const Section = ({
      title,
      children,
    }: {
      title: string;
      children: React.ReactNode;
    }) => {
      return (
        <Card className="p-6 space-y-5">
          <h2 className="font-display font-semibold text-lg text-primary">
            {title}
          </h2>
          {children}
        </Card>
      );
    
}

export default Section