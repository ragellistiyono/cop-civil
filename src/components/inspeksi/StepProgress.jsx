import { Check } from 'lucide-react';

export default function StepProgress({ steps, currentStep, onStepClick }) {
  return (
    <div className="step-progress" role="navigation" aria-label="Langkah form">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        let className = 'step-progress-item';
        if (isActive) className += ' step-progress-item--active';
        if (isCompleted) className += ' step-progress-item--completed';

        return (
          <div key={step.id} className={className}>
            {index > 0 && <div className="step-progress-line" />}
            <button
              type="button"
              className="step-progress-circle"
              onClick={() => onStepClick && isCompleted && onStepClick(index)}
              disabled={!isCompleted || !onStepClick}
              aria-current={isActive ? 'step' : undefined}
              aria-label={`Langkah ${index + 1}: ${step.label}`}
            >
              {isCompleted ? <Check size={14} strokeWidth={3} /> : index + 1}
            </button>
            <span className="step-progress-label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
