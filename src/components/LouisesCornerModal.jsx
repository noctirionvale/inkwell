import LouisesCorner from './LouisesCorner';

export default function LouisesCornerModal({ onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="louises-modal-container" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <LouisesCorner />
      </div>
    </div>
  );
}