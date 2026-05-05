function SectionHeader({ title, children }) {
  return (
    <div className="section__header">
      <h2 className="section__title">{title}</h2>
      {children && <div className="grid__buttons">{children}</div>}
    </div>
  );
}

export default SectionHeader;
