function Button({ variant = 'primary', className = '', children, ...rest }) {
  const variantClass = variant ? ` button--${variant}` : '';

  return (
    <button className={`button${variantClass}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </button>
  );
}

export default Button;
