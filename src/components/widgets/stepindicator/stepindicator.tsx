export interface StepIndicatorStep {
  title: string;
  default: boolean;
}

export interface StepIndicatorProps {
  headerText?: string;
  firstStep: StepIndicatorStep;
  secondStep: StepIndicatorStep;
  thirdStep: StepIndicatorStep;
}

// Skeleton only — structure matches the selectors in ./stepindicator.scss
// (.step-indicator, .col-4, span.pending-step). Fill in the TODOs.
const StepIndicator = ({
  headerText,
  firstStep,
  secondStep,
  thirdStep,
}: StepIndicatorProps) => {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <h1>{/* TODO: render headerText */}</h1>
        </div>
      </div>

      <div className="row step-indicator my-3">
        <div className="col-4">
          <span>{/* TODO: render firstStep.title, "pending-step" class when !firstStep.default */}</span>
        </div>
        <div className="col-4">
          <span>{/* TODO: render secondStep.title, "pending-step" class when !secondStep.default */}</span>
        </div>
        <div className="col-4">
          <span>{/* TODO: render thirdStep.title, "pending-step" class when !thirdStep.default */}</span>
        </div>
      </div>
    </>
  );
};

export default StepIndicator;
