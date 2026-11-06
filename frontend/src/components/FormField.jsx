// Label + input (or textarea) + inline error message.
export default function FormField({ label, name, error, as = 'input', ...props }) {
  const Control = as;
  return (
    <div className={`field ${error ? 'field--error' : ''}`}>
      <label htmlFor={name}>{label}</label>
      <Control id={name} name={name} aria-invalid={Boolean(error)} {...props} />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
