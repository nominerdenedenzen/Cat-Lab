interface StepBarType {
  number: number;
  label?: string;
}

export default function StepBar(props: StepBarType) {
  const { number, label } = props;
  return (
    <div style={{ width: "18px", height: "18px" }}>
      {number} {label}
    </div>
  );
}
