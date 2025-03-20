import React from 'react';

type FooterProps = {
  className?: string;
};

const Footer: React.FC<FooterProps> = ({ className = '' }) => {
  return (
    <footer className={`text-center text-xs text-gray-400 ${className}`}>
      <p>v1.0.0 • Made with ♥ for HireJobs users</p>
    </footer>
  );
};

export default Footer;