import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { repairRequestsApi } from '../../api/repairRequestsApi';
import { useRequests } from '../../context/RequestsContext';
import { useToast } from '../../context/ToastContext';
import { CATEGORIES } from '../../utils/constants';
import { addMyId } from '../../utils/myRequests';
import { LIMITS, validateRepairRequest } from '../../utils/validation';
import Icon from '../common/Icon';

const EXAMPLES = {
  LAPTOP: 'Laptop overheats and shuts down after about ten minutes of use.',
  DESKTOP: 'Desktop does not boot and beeps three times when powered on.',
  SERVER: 'Disk array reports a degraded drive and the fan is unusually loud.',
  NETWORK_DEVICE: 'Switch ports drop randomly and the uplink keeps flapping.',
};

const INITIAL = { equipmentCategory: 'LAPTOP', deviceModel: '', deviceIdentifier: '', issueDescription: '' };

export default function RequestForm() {
  const [values, setValues] = useState(INITIAL);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const { upsert } = useRequests();
  const toast = useToast();

  const errors = validateRepairRequest(values);
  const show = (field) => (touched[field] ? errors[field] : undefined);

  const update = (field) => (e) => {
    setValues((v) => ({ ...v, [field]: e.target.value }));
    setServerError('');
  };
  const blur = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  const submit = async (e) => {
    e.preventDefault();
    setTouched({ equipmentCategory: true, deviceModel: true, deviceIdentifier: true, issueDescription: true });
    if (Object.keys(errors).length) return;

    setSubmitting(true);
    setServerError('');
    try {
      const created = await repairRequestsApi.create({
        equipmentCategory: values.equipmentCategory,
        deviceModel: values.deviceModel.trim(),
        deviceIdentifier: values.deviceIdentifier.trim() || undefined,
        issueDescription: values.issueDescription.trim(),
      });
      addMyId(created.id);
      upsert([created]);
      toast.push('success', `${created.requestCode} is queued for processing.`, 'Request submitted');
      navigate(`/requests/${created.id}`);
    } catch (error) {
      setServerError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card form" onSubmit={submit} noValidate>
      {serverError && (
        <div className="alert alert-danger" role="alert">
          <Icon name="alert" size={18} /> {serverError}
        </div>
      )}

      <fieldset className="field-group">
        <legend>Equipment category</legend>
        <div className="category-grid">
          {CATEGORIES.map((c) => (
            <label key={c.value} className={`category ${values.equipmentCategory === c.value ? 'selected' : ''}`}>
              <input
                type="radio"
                name="equipmentCategory"
                value={c.value}
                checked={values.equipmentCategory === c.value}
                onChange={update('equipmentCategory')}
              />
              <Icon name={c.icon} size={24} />
              <strong>{c.label}</strong>
              <span>{c.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="form-row">
        <label className={`field ${show('deviceModel') ? 'has-error' : ''}`}>
          <span className="field-label">Device model *</span>
          <input
            type="text"
            value={values.deviceModel}
            onChange={update('deviceModel')}
            onBlur={blur('deviceModel')}
            placeholder="e.g. Dell Latitude 5420"
            maxLength={LIMITS.model.max + 20}
          />
          {show('deviceModel') && <span className="field-error">{show('deviceModel')}</span>}
        </label>

        <label className={`field ${show('deviceIdentifier') ? 'has-error' : ''}`}>
          <span className="field-label">Asset tag / serial number (optional)</span>
          <input
            type="text"
            value={values.deviceIdentifier}
            onChange={update('deviceIdentifier')}
            onBlur={blur('deviceIdentifier')}
            placeholder="e.g. DL-5420-01"
          />
          {show('deviceIdentifier') && <span className="field-error">{show('deviceIdentifier')}</span>}
        </label>
      </div>

      <label className={`field ${show('issueDescription') ? 'has-error' : ''}`}>
        <span className="field-label">Reported issue *</span>
        <textarea
          rows={5}
          value={values.issueDescription}
          onChange={update('issueDescription')}
          onBlur={blur('issueDescription')}
          placeholder="Describe what is wrong, when it happens and anything you already tried."
        />
        <span className="field-foot">
          {show('issueDescription') ? <span className="field-error">{show('issueDescription')}</span> : <span />}
          <span className={`counter ${values.issueDescription.length > LIMITS.issue.max ? 'over' : ''}`}>
            {values.issueDescription.length}/{LIMITS.issue.max}
          </span>
        </span>
      </label>

      <button
        type="button"
        className="link-btn"
        onClick={() => setValues((v) => ({ ...v, issueDescription: EXAMPLES[v.equipmentCategory] }))}
      >
        Use an example description
      </button>

      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={() => navigate('/')} disabled={submitting}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit repair request'}
        </button>
      </div>
    </form>
  );
}
