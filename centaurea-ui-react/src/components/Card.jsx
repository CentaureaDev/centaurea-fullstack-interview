function Card({ variant, as: Tag = 'div', className = '', children, ...rest }) {
  const variantClass = variant ? ` card--${variant}` : '';

  return (
    <Tag className={`card${variantClass}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </Tag>
  );
}

export default Card;
