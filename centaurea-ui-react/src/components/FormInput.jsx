function FormInput({ as: Tag = 'input', ...rest }) {
  const isTextarea = Tag === 'textarea';

  return (
    <Tag
      className={`form__input${isTextarea ? ' form__textarea' : ''}`}
      {...rest}
    />
  );
}

export default FormInput;
