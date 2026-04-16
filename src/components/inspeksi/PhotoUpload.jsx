import { useState, useRef } from 'react';
import { Upload, Trash2, Image, Loader } from 'lucide-react';

export default function PhotoUpload({ value, onChange, onUpload, onDelete, getUrl, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const hasPhoto = !!value;

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setUploading(true);

    try {
      const fileId = await onUpload(file);
      onChange(fileId);
    } catch (err) {
      console.warn('[PhotoUpload] Upload failed:', err.message);
      setPreview(null);
    } finally {
      setUploading(false);
      URL.revokeObjectURL(objectUrl);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!value) return;
    setUploading(true);
    try {
      await onDelete(value);
      onChange('');
    } catch (err) {
      console.warn('[PhotoUpload] Delete failed:', err.message);
    } finally {
      setUploading(false);
    }
  };

  const imgSrc = preview || (hasPhoto ? getUrl(value) : null);

  if (hasPhoto || preview) {
    return (
      <div className="photo-upload photo-upload--has-photo">
        <div className="photo-upload-preview">
          <img src={imgSrc} alt="Preview foto" />
          {uploading && (
            <div className="photo-upload-overlay">
              <Loader size={24} className="spin" />
            </div>
          )}
        </div>
        {!disabled && !uploading && (
          <button
            type="button"
            className="btn photo-upload-delete"
            onClick={handleDelete}
            aria-label="Hapus foto"
          >
            <Trash2 size={16} strokeWidth={2} />
            <span>Hapus</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="photo-upload">
      <div className="photo-upload-placeholder">
        {uploading ? (
          <Loader size={24} className="spin" />
        ) : (
          <>
            <Image size={32} strokeWidth={1.5} />
            <span>Pilih foto</span>
          </>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="photo-upload-input"
        onChange={handleFileSelect}
        disabled={disabled || uploading}
        aria-label="Unggah foto"
      />
      {!disabled && !uploading && (
        <button
          type="button"
          className="btn photo-upload-btn"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={16} strokeWidth={2} />
          <span>Unggah</span>
        </button>
      )}
    </div>
  );
}
