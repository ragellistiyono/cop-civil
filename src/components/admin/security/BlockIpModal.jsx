import { useState } from 'react';

export default function BlockIpModal({ open, onClose, onSubmit }) {
  const [ipAddress, setIpAddress] = useState('');
  const [reason, setReason] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit({
        ip_address: ipAddress.trim(),
        reason: reason.trim(),
        expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      });
      setIpAddress('');
      setReason('');
      setExpiresAt('');
      onClose();
    } catch {
      // error handled by hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="security-modal-overlay" onClick={onClose}>
      <div className="security-modal" onClick={(e) => e.stopPropagation()}>
        <h3 className="security-modal-title">Blokir IP Address</h3>
        <form onSubmit={handleSubmit}>
          <div className="security-form-group">
            <label htmlFor="block-ip">IP Address *</label>
            <input
              id="block-ip"
              type="text"
              placeholder="Contoh: 192.168.1.100"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              required
            />
          </div>

          <div className="security-form-group">
            <label htmlFor="block-reason">Alasan *</label>
            <textarea
              id="block-reason"
              placeholder="Alasan pemblokiran..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <div className="security-form-group">
            <label htmlFor="block-expires">Kadaluarsa (opsional)</label>
            <input
              id="block-expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
            <span className="security-form-helper">
              Kosongkan untuk blokir permanen.
            </span>
          </div>

          <div className="security-modal-actions">
            <button
              type="button"
              className="security-btn security-btn--secondary"
              onClick={onClose}
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="security-btn security-btn--danger"
              disabled={submitting}
            >
              {submitting ? 'Memblokir...' : 'Blokir'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
