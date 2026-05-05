function StatusMessage({ variant, className = '', children }) {
  return (
    <div className={`message message--${variant}${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  );
}

export default StatusMessage;
