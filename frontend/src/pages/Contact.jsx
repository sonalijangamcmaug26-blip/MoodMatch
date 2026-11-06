import { useState } from 'react';
import Alert from '../components/Alert';
import FormField from '../components/FormField';
import SectionHeading from '../components/SectionHeading';
import { getErrorMessage, getFieldErrors } from '../services/api';
import { sendContactMessage } from '../services/contactService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY = { name: '', email: '', subject: '', message: '' };

function validate(values) {
  const errors = {};
  if (values.name.trim().length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Please enter a valid email address.';
  if (values.subject.trim().length < 3) errors.subject = 'Subject must be at least 3 characters.';
  if (values.message.trim().length < 10) errors.message = 'Message must be at least 10 characters.';
  return errors;
}

export default function Contact() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
    setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');
    setSuccess('');
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const response = await sendContactMessage(values);
      setSuccess(response.message);
      setValues(EMPTY);
    } catch (error) {
      setErrors(getFieldErrors(error));
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="section">
      <div className="container container--narrow">
        <SectionHeading eyebrow="Get in touch" title="Contact us" subtitle="Questions, feedback or ideas? We would love to hear from you." />
        <form className="card-form" onSubmit={handleSubmit} noValidate>
          <Alert type="success">{success}</Alert>
          <Alert type="error">{formError}</Alert>

          <div className="form-row">
            <FormField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} autoComplete="name" />
            <FormField label="Email" name="email" type="email" value={values.email} onChange={handleChange} error={errors.email} autoComplete="email" />
          </div>
          <FormField label="Subject" name="subject" value={values.subject} onChange={handleChange} error={errors.subject} />
          <FormField label="Message" name="message" as="textarea" rows="6" value={values.message} onChange={handleChange} error={errors.message} />

          <button type="submit" className="btn btn--primary btn--large" disabled={submitting}>
            {submitting ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </div>
    </section>
  );
}
