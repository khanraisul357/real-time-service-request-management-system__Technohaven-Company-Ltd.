import { useState } from 'react';
import { repairRequestsApi } from '../../api/repairRequestsApi';
import { useRequests } from '../../context/RequestsContext';
import { useToast } from '../../context/ToastContext';
import { canCancel } from '../../utils/constants';
import ConfirmDialog from '../common/ConfirmDialog';

// Cancel action shared by the table and the details page (FR-07). The server remains the authority:
// if the status changed in the meantime, the API rejects the call and we surface its message.
export default function CancelButton({ request, size = 'sm' }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { upsert, syncOne } = useRequests();
  const toast = useToast();

  if (!canCancel(request.status)) return null;

  const confirm = async () => {
    setBusy(true);
    try {
      const updated = await repairRequestsApi.cancel(request.id);
      upsert([updated]);
    } catch (error) {
      toast.push('error', error.message, 'Could not cancel');
      syncOne(request.id);
    } finally {
      setBusy(false);
      setOpen(false);
    }
  };

  return (
    <>
      <button
        className={`btn btn-outline-danger btn-${size}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
      >
        Cancel
      </button>
      <ConfirmDialog
        open={open}
        danger
        busy={busy}
        title={`Cancel ${request.requestCode}?`}
        message={
          request.status === 'PROCESSING'
            ? 'This repair is already being processed. It will stop at the next safe point.'
            : 'This request will be removed from the processing queue.'
        }
        confirmLabel="Cancel request"
        onConfirm={confirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
