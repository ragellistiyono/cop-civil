import { useITP } from '../../hooks/useITP.js';
import ITPGeneralInfo from '../../components/itp/ITPGeneralInfo';
import ITPTahapanGrid from '../../components/itp/ITPTahapanGrid';
import ITPSignaturePanel from '../../components/itp/ITPSignaturePanel';
import ITPActionsBar from '../../components/itp/ITPActionsBar';

export default function UserITPDashboard() {
  const { itp, loading, updateField, saveDraft, submitITP, deleteITP, requestSignature } = useITP();

  const handleDelete = async () => {
    if (window.confirm('Hapus ITP ini? Tindakan tidak bisa dibatalkan.')) {
      await deleteITP(itp.id);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="itp-dashboard">
      <h1 className="itp-dashboard-title">
        QTRACK - INSPECTION AND TEST PLAN (ITP) DASHBOARD
      </h1>

      <ITPGeneralInfo itp={itp} onChange={updateField} />

      <ITPTahapanGrid itp={itp} onChange={updateField} />

      <ITPSignaturePanel
        signatures={itp.signatures}
        onRequest={requestSignature}
      />

      <ITPActionsBar
        onDelete={handleDelete}
        onPrint={handlePrint}
        onDraft={() => saveDraft(itp)}
        onSubmit={() => submitITP(itp)}
        disabled={loading}
      />
    </div>
  );
}
