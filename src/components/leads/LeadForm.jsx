import { useState } from 'react';
import { User, Briefcase, Mail, Phone, AlertCircle } from 'lucide-react';

const STATUS_OPTIONS = ['New', 'Contacted', 'Meeting Scheduled', 'Proposal Sent', 'Won', 'Lost'];
const SOURCE_OPTIONS = ['Website', 'Referral', 'LinkedIn', 'Cold Call', 'Email Campaign', 'Other'];

/**
 * @typedef {Object} LeadData
 * @property {string} name - Lead Contact name
 * @property {string} company - Company Name
 * @property {string} email - Email Address
 * @property {string} phone - Phone Number
 * @property {string} status - Deal status stage
 * @property {string} source - Lead Channel Source
 * @property {number} [value] - Deal value
 * @property {string} [notes] - Additional details
 */

/**
 * @typedef {Object} LeadFormProps
 * @property {LeadData|null} [initialData] - Existing lead data to pre-populate (if editing)
 * @property {function(LeadData): void} onSubmit - Callback function triggered on form validation success
 * @property {function(): void} onCancel - Callback function triggered when cancel is clicked
 */

/**
 * LeadForm handles inputs validation and gathers data inputs for lead
 * creation or modification.
 *
 * @param {LeadFormProps} props - The props for the component
 * @returns {React.JSX.Element} The rendered lead form
 */
export default function LeadForm({ initialData = null, onSubmit, onCancel }) {
  // Sync state values directly from props
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    company: initialData?.company || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    value: initialData?.value !== undefined ? initialData.value : '',
    status: initialData?.status || 'New',
    source: initialData?.source || 'Website',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /**
   * Performs real-time field validation
   */
  const validateField = (name, val) => {
    let error = '';
    if (name === 'name' && !val.trim()) {
      error = 'Lead Name is required';
    } else if (name === 'company' && !val.trim()) {
      error = 'Company Name is required';
    } else if (name === 'email') {
      if (!val.trim()) {
        error = 'Email address is required';
      } else if (!/\S+@\S+\.\S+/.test(val)) {
        error = 'Please enter a valid email address';
      }
    }
    return error;
  };

  /**
   * Listens to change event and validates field values
   */
  const handleInputChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
    
    if (touched[field]) {
      const error = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  /**
   * Form submit validation execution
   */
  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validate all required fields
    const newErrors = {
      name: validateField('name', formData.name),
      company: validateField('company', formData.company),
      email: validateField('email', formData.email),
    };

    setErrors(newErrors);
    setTouched({ name: true, company: true, email: true });

    // Stop submit if errors exist
    if (newErrors.name || newErrors.company || newErrors.email) {
      return;
    }

    // Pass valid payload to page onSubmit handler
    onSubmit({
      ...formData,
      value: formData.value !== '' ? Number(formData.value) : 0,
    });
  };

  const isEditMode = !!initialData;

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name field */}
        <div className="col-span-1">
          <label
            htmlFor="lead-name"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Lead Name <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/70">
              <User className="h-4 w-4" />
            </span>
            <input
              id="lead-name"
              type="text"
              placeholder="e.g. Clark Kent"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-bg-base/30 text-text-main focus-ring ${
                errors.name ? 'border-danger focus:border-danger' : 'border-border-subtle'
              }`}
              required
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
          </div>
          {errors.name && (
            <p
              id="name-error"
              className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-danger"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        {/* Company Name field */}
        <div className="col-span-1">
          <label
            htmlFor="lead-company"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Company <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/70">
              <Briefcase className="h-4 w-4" />
            </span>
            <input
              id="lead-company"
              type="text"
              placeholder="e.g. Planet Media Group"
              value={formData.company}
              onChange={(e) => handleInputChange('company', e.target.value)}
              onBlur={() => handleBlur('company')}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-bg-base/30 text-text-main focus-ring ${
                errors.company ? 'border-danger focus:border-danger' : 'border-border-subtle'
              }`}
              required
              aria-invalid={!!errors.company}
              aria-describedby={errors.company ? 'company-error' : undefined}
            />
          </div>
          {errors.company && (
            <p
              id="company-error"
              className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-danger"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{errors.company}</span>
            </p>
          )}
        </div>

        {/* Email Address field */}
        <div className="col-span-1">
          <label
            htmlFor="lead-email"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Email Address <span className="text-danger">*</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/70">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="lead-email"
              type="email"
              placeholder="c.kent@dailyplanet.co"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              className={`w-full pl-9 pr-3 py-2 text-xs rounded-lg border bg-bg-base/30 text-text-main focus-ring ${
                errors.email ? 'border-danger focus:border-danger' : 'border-border-subtle'
              }`}
              required
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </div>
          {errors.email && (
            <p
              id="email-error"
              className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-danger"
              role="alert"
            >
              <AlertCircle className="h-3 w-3 shrink-0" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Phone Number field */}
        <div className="col-span-1">
          <label
            htmlFor="lead-phone"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Phone Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted/70">
              <Phone className="h-4 w-4" />
            </span>
            <input
              id="lead-phone"
              type="tel"
              placeholder="+1 (555) 012-3456"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-border-subtle bg-bg-base/30 text-text-main focus-ring"
            />
          </div>
        </div>

        {/* Deal Value field */}
        <div className="col-span-1">
          <label
            htmlFor="lead-value"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Deal Value ($)
          </label>
          <input
            id="lead-value"
            type="number"
            placeholder="e.g. 50000"
            value={formData.value}
            onChange={(e) => handleInputChange('value', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-bg-base/30 text-text-main focus-ring"
            min="0"
          />
        </div>

        {/* Lead Status Dropdown */}
        <div className="col-span-1">
          <label
            htmlFor="lead-status"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Status
          </label>
          <select
            id="lead-status"
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-bg-base text-text-main focus:border-primary focus:outline-none focus-ring"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Lead Source Dropdown */}
        <div className="col-span-1 sm:col-span-2">
          <label
            htmlFor="lead-source"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Source
          </label>
          <select
            id="lead-source"
            value={formData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border-subtle bg-bg-base text-text-main focus:border-primary focus:outline-none focus-ring"
          >
            {SOURCE_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        {/* Notes Textarea */}
        <div className="col-span-1 sm:col-span-2">
          <label
            htmlFor="lead-notes"
            className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1"
          >
            Notes
          </label>
          <textarea
            id="lead-notes"
            rows="3"
            placeholder="Add lead context, background or key follow-up logs..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full p-3 text-xs rounded-lg border border-border-subtle bg-bg-base/30 text-text-main focus-ring"
          />
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-subtle/50 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold rounded-lg border border-border-subtle bg-bg-surface text-text-main hover:bg-bg-surface-hover transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer shadow-subtle"
        >
          {isEditMode ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
