export const LIMITS = {
  model: { min: 2, max: 100 },
  identifier: { max: 50 },
  issue: { min: 10, max: 1000 },
};

// Client-side form validation. The backend validates again (never trust the client).
export function validateRepairRequest(values) {
  const errors = {};

  if (!values.equipmentCategory) errors.equipmentCategory = 'Choose an equipment category.';

  const model = values.deviceModel.trim();
  if (!model) errors.deviceModel = 'Enter the device model.';
  else if (model.length < LIMITS.model.min) errors.deviceModel = 'Model name is too short.';
  else if (model.length > LIMITS.model.max) errors.deviceModel = `Keep the model under ${LIMITS.model.max} characters.`;

  if (values.deviceIdentifier.trim().length > LIMITS.identifier.max) {
    errors.deviceIdentifier = `Keep the identifier under ${LIMITS.identifier.max} characters.`;
  }

  const issue = values.issueDescription.trim();
  if (!issue) errors.issueDescription = 'Describe the problem so a technician can help.';
  else if (issue.length < LIMITS.issue.min) errors.issueDescription = `Add a little more detail (at least ${LIMITS.issue.min} characters).`;
  else if (issue.length > LIMITS.issue.max) errors.issueDescription = `Keep the description under ${LIMITS.issue.max} characters.`;

  return errors;
}
