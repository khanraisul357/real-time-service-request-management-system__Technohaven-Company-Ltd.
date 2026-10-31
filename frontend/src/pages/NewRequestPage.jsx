import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import RequestForm from '../components/requests/RequestForm';

export default function NewRequestPage() {
  return (
    <div className="page page-narrow">
      <Link to="/" className="back-link">
        <Icon name="back" size={16} /> Back to dashboard
      </Link>
      <div className="page-head">
        <div>
          <h1>New repair request</h1>
          <p className="muted">
            Tell us about the equipment and the problem. The request is queued instantly and processed in the
            background.
          </p>
        </div>
      </div>
      <RequestForm />
    </div>
  );
}
