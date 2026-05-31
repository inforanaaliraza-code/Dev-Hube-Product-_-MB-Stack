export function WpPageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="wp-page-header">
      <h1 className="wp-heading-inline">{title}</h1>
      {children ? <div className="wp-header-actions">{children}</div> : null}
      <hr className="wp-header-end" />
    </div>
  );
}
