const StepIndicator = ({
  headerText,
  firstStep,
  secondStep,
  thirdStep,
}: any) => {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <h1>{headerText}</h1>
        </div>
      </div>

      <div className="row step-indicator my-3 ">
        <div className="col-4">
          <span className={firstStep.default ? "" : "pending-step"}>
            1. {firstStep.title}
          </span>
        </div>
        <div className="col-4">
          <span className={secondStep.default ? "" : "pending-step"}>
            2. {secondStep.title}
          </span>
        </div>
        <div className="col-4">
          <span className={thirdStep.default ? "" : "pending-step"}>
            3. {thirdStep.title}
          </span>
        </div>
      </div>
    </>
  );
};

export default StepIndicator;
