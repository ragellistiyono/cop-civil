import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Save, Send, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useInspeksi } from '../hooks/useInspeksi.js';
import { useNotifikasi } from '../hooks/useNotifikasi.js';
import { useKontrakList } from '../hooks/useKontrak.js';
import { INSPEKSI_SCHEMA, JENIS_PEKERJAAN, buildEmptyFormData } from '../data/inspeksiSchema.js';
import StepProgress from '../components/inspeksi/StepProgress';
import StepInfoUmum from '../components/inspeksi/StepInfoUmum';
import StepPekerjaan from '../components/inspeksi/StepPekerjaan';
import StepRingkasan from '../components/inspeksi/StepRingkasan';

export default function InspeksiFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    fetchInspeksiById, createInspeksi, updateInspeksi, submitInspeksi,
    uploadPhoto, deletePhoto, getPhotoUrl, loading: inspeksiLoading,
  } = useInspeksi();
  const { createNotifikasi } = useNotifikasi();
  const { kontrakList } = useKontrakList();

  const isEditMode = !!id;

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    tanggalInspeksi: '',
    lokasi: '',
    kontrakId: '',
    jenisPekerjaan: [],
    beton: {},
    baja: {},
    kayu: {},
  });
  const [fotoIds, setFotoIds] = useState([]);
  const [docId, setDocId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loadingDoc, setLoadingDoc] = useState(isEditMode);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isEditMode) return;
    let cancelled = false;

    async function loadDraft() {
      setLoadingDoc(true);
      const doc = await fetchInspeksiById(id);
      if (cancelled || !doc) {
        setLoadingDoc(false);
        return;
      }
      if (doc.status !== 'draft') {
        navigate(`/inspeksi/${id}`, { replace: true });
        return;
      }

      const jenisPekerjaan = doc.jenisPekerjaan ? doc.jenisPekerjaan.split(',') : [];
      let parsedData = {};
      try { parsedData = JSON.parse(doc.data || '{}'); } catch { /* empty */ }
      let parsedFotoIds = [];
      try { parsedFotoIds = JSON.parse(doc.fotoIds || '[]'); } catch { /* empty */ }

      setFormData({
        tanggalInspeksi: doc.tanggalInspeksi || '',
        lokasi: doc.lokasi || '',
        kontrakId: doc.kontrakId || '',
        jenisPekerjaan,
        ...buildEmptyFormData(jenisPekerjaan),
        ...parsedData,
      });
      setFotoIds(parsedFotoIds);
      setDocId(doc.$id);
      setLoadingDoc(false);
    }

    loadDraft();
    return () => { cancelled = true; };
  }, [id, isEditMode, fetchInspeksiById, navigate]);

  const steps = useMemo(() => {
    const result = [{ id: 'info-umum', label: 'Info Umum' }];
    for (const jenisId of formData.jenisPekerjaan) {
      const schema = INSPEKSI_SCHEMA[jenisId];
      if (schema) result.push({ id: jenisId, label: schema.label });
    }
    result.push({ id: 'ringkasan', label: 'Ringkasan' });
    return result;
  }, [formData.jenisPekerjaan]);

  const handlePhotoUpload = useCallback(async (file) => {
    const fileId = await uploadPhoto(file);
    setFotoIds((prev) => [...prev, fileId]);
    return fileId;
  }, [uploadPhoto]);

  const handlePhotoDelete = useCallback(async (fileId) => {
    await deletePhoto(fileId);
    setFotoIds((prev) => prev.filter((fid) => fid !== fileId));
  }, [deletePhoto]);

  const validateStep = (stepIndex) => {
    const step = steps[stepIndex];
    if (!step) return true;

    if (step.id === 'info-umum') {
      if (!formData.tanggalInspeksi) return 'Tanggal inspeksi wajib diisi.';
      if (!formData.lokasi?.trim()) return 'Lokasi / Nama GI wajib diisi.';
      if (!formData.jenisPekerjaan || formData.jenisPekerjaan.length === 0) {
        return 'Pilih minimal 1 jenis pekerjaan.';
      }
    }
    return true;
  };

  const handleNext = () => {
    const result = validateStep(currentStep);
    if (result !== true) {
      setError(result);
      return;
    }
    setError('');

    if (steps[currentStep]?.id === 'info-umum') {
      const emptyData = buildEmptyFormData(formData.jenisPekerjaan);
      setFormData((prev) => {
        const merged = { ...prev };
        for (const jenisId of formData.jenisPekerjaan) {
          if (!merged[jenisId] || Object.keys(merged[jenisId]).length === 0) {
            merged[jenisId] = emptyData[jenisId] || {};
          }
        }
        return merged;
      });
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrev = () => {
    setError('');
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (index) => {
    setError('');
    setCurrentStep(index);
  };

  const buildPayload = () => ({
    userId: user?.$id,
    userName: user?.name || 'Unknown',
    tanggalInspeksi: formData.tanggalInspeksi,
    lokasi: formData.lokasi,
    kontrakId: formData.kontrakId,
    jenisPekerjaan: formData.jenisPekerjaan,
    data: (() => {
      const d = {};
      for (const jenisId of formData.jenisPekerjaan) {
        d[jenisId] = formData[jenisId] || {};
      }
      return d;
    })(),
    fotoIds,
  });

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = buildPayload();
      if (docId) {
        await updateInspeksi(docId, payload);
      } else {
        const doc = await createInspeksi(payload);
        setDocId(doc.$id);
        if (!isEditMode) {
          window.history.replaceState(null, '', `/inspeksi/${doc.$id}/edit`);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(0)) { setCurrentStep(0); return; }
    setSubmitting(true);
    setError('');
    try {
      const payload = buildPayload();
      let inspeksiId = docId;

      if (!inspeksiId) {
        const doc = await createInspeksi(payload);
        inspeksiId = doc.$id;
      }

      await submitInspeksi(inspeksiId, payload);

      await createNotifikasi({
        type: 'inspeksi_submitted',
        message: `${user?.name || 'User'} mengirim laporan inspeksi untuk ${formData.lokasi}`,
        referenceId: inspeksiId,
        userId: user?.$id,
        userName: user?.name || 'Unknown',
      });

      navigate(`/inspeksi/${inspeksiId}`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setShowConfirm(false);
    }
  };

  if (loadingDoc) {
    return (
      <section className="section">
        <div className="container">
          <div className="auth-loading">
            <div className="auth-loading-spinner" />
            <p>Memuat data inspeksi...</p>
          </div>
        </div>
      </section>
    );
  }

  const currentStepDef = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <section className="section inspeksi-wizard">
      <div className="container">
        <div className="inspeksi-wizard-header">
          <Link to="/inspeksi" className="kontrak-breadcrumb-link">
            <ChevronLeft size={16} /> Kembali ke Riwayat
          </Link>
          <h1>{isEditMode ? 'Edit Draft Inspeksi' : 'Laporan Inspeksi Baru'}</h1>
        </div>

        <StepProgress
          steps={steps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="inspeksi-wizard-body card">
          {currentStepDef?.id === 'info-umum' && (
            <StepInfoUmum
              formData={formData}
              onChange={setFormData}
              kontrakList={kontrakList}
            />
          )}

          {currentStepDef && currentStepDef.id !== 'info-umum' && currentStepDef.id !== 'ringkasan' && (
            <StepPekerjaan
              jenisPekerjaanId={currentStepDef.id}
              formData={formData}
              onChange={setFormData}
              onPhotoUpload={handlePhotoUpload}
              onPhotoDelete={handlePhotoDelete}
              getPhotoUrl={getPhotoUrl}
              disabled={false}
            />
          )}

          {currentStepDef?.id === 'ringkasan' && (
            <StepRingkasan formData={formData} getPhotoUrl={getPhotoUrl} />
          )}

          {error && (
            <div className="login-error" role="alert" style={{ marginTop: '1rem' }}>
              <AlertCircle size={16} strokeWidth={2.5} />
              <span>{error}</span>
            </div>
          )}

          <div className="step-navigation">
            <div className="step-navigation-left">
              {!isFirstStep && (
                <button type="button" className="btn btn-secondary" onClick={handlePrev}>
                  <ChevronLeft size={18} />
                  <span>Sebelumnya</span>
                </button>
              )}
            </div>

            <div className="step-navigation-right">
              <button
                type="button"
                className="btn"
                onClick={handleSaveDraft}
                disabled={saving || submitting}
              >
                <Save size={16} />
                <span>{saving ? 'Menyimpan...' : 'Simpan Draft'}</span>
              </button>

              {isLastStep ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowConfirm(true)}
                  disabled={saving || submitting}
                >
                  <Send size={16} />
                  <span>Kirim Laporan</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={saving || submitting}
                >
                  <span>Selanjutnya</span>
                  <ChevronRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {showConfirm && (
          <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
            <div
              className="modal-content card"
              role="dialog"
              aria-modal="true"
              aria-labelledby="confirm-submit-title"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.key === 'Escape' && setShowConfirm(false)}
            >
              <div className="modal-header">
                <h2 id="confirm-submit-title" className="modal-title">Kirim Laporan?</h2>
              </div>
              <div className="modal-body">
                <p style={{ fontSize: '0.9rem', color: 'var(--color-secondary)' }}>
                  Setelah dikirim, laporan tidak dapat diedit lagi. Pastikan semua data sudah benar.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn modal-btn-cancel"
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                >
                  Batal
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? 'Mengirim...' : 'Ya, Kirim'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
