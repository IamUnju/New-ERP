import React from "react";

export default function FormStepper({ steps = [], activeStep = 1 }) {
  return (
    <div className="wizard-stepper">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === activeStep;
        const isComplete = stepNumber < activeStep;

        return (
          <div key={step.title} className={`wizard-step ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}>
            <div className="wizard-step-circle">{String(stepNumber).padStart(2, "0")}</div>
            <div className="wizard-step-text">
              <div className="wizard-step-title">{step.title}</div>
              {step.subtitle && <div className="wizard-step-subtitle">{step.subtitle}</div>}
            </div>
            {index < steps.length - 1 && <div className="wizard-step-arrow">→</div>}
          </div>
        );
      })}
    </div>
  );
}
