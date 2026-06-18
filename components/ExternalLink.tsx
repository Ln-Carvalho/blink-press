interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
}

export default function ExternalLink({ href, children, ...rest }: Props) {
  const isExternal = href?.startsWith('http://') || href?.startsWith('https://');
  return (
    <a
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      {...rest}
    >
      {children}
    </a>
  );
}
