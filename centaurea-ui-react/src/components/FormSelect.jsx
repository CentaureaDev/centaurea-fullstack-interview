function FormSelect({ children, ...rest }) {
  return (
    <select className="form__select" {...rest}>
      {children}
    </select>
  );
}

export default FormSelect;
