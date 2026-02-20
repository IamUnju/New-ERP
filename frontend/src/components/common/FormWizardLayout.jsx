import React from "react";
import FormStepper from "./FormStepper.jsx";

export default function FormWizardLayout({
  title,
  subtitle,
  crumbs = [],
  steps = [],
  activeStep = 1,
  onBack,
  primaryAction,
  children,
}) {
  return (
    <section className="wizard-page">
      {crumbs.length > 0 && (
        <div className="wizard-tabs">
          {crumbs.map((crumb, index) => (
            <div
              key={`${crumb.label}-${index}`}
              className={`wizard-tab ${crumb.active ? "active" : ""}`}
            >
              {crumb.label}
            </div>
          ))}
        </div>
      )}

      <div className="wizard-header">
        <div className="wizard-title-group">
          {onBack && (
            <button type="button" className="wizard-back" onClick={onBack}>
              ←
            </button>
          )}
          <div>
            <div className="wizard-title">{title}</div>
            {subtitle && <div className="wizard-subtitle">{subtitle}</div>}
          </div>
        </div>

        {primaryAction && (
          <button
            type={primaryAction.type || "button"}
            className="wizard-next"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled}
          >
            {primaryAction.label}
          </button>
        )}
      </div>

      {steps.length > 0 && <FormStepper steps={steps} activeStep={activeStep} />}

      <div className="wizard-body">{children}</div>
    </section>
  );
}
