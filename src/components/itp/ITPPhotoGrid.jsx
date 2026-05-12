import { Plus, Image as ImageIcon } from 'lucide-react';

export default function ITPPhotoGrid({ photos, onAdd }) {
  return (
    <div className="itp-photo-grid">
      <button type="button" className="itp-photo-slot itp-photo-slot--add" onClick={onAdd}>
        <Plus size={24} strokeWidth={2} />
        <span>Ambil Foto /<br />Pilih Galeri</span>
      </button>

      {photos.map((photo) => (
        <div key={photo.id} className="itp-photo-slot">
          {photo.url ? (
            <img src={photo.url} alt={`Foto Lapangan ${photo.id}`} />
          ) : (
            <ImageIcon size={28} strokeWidth={1.5} />
          )}
          <span className="itp-photo-slot-label">
            Foto Lapangan {photo.id}<br />(Timestamp)
          </span>
        </div>
      ))}
    </div>
  );
}
