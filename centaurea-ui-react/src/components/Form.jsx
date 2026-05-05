function Form({ variant, className = '', children, ...rest }) {
  const variantClass = variant ? ` form--${variant}` : '';

  return (
    <form className={`form${variantClass}${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </form>
  );
}

export default Form;
