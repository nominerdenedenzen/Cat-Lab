interface StepCardProps {
  number: number;
  description: string;
}

const StepCard = (props: StepCardProps) => {
  const { number, description } = props;

  return (
    <div className="p-7 border rounded-[16px] border-[#dfe4ee] flex flex-col gap-[20px] bg-white">
      <h2 className="font-['Nunito'] font-bold text-[22px] text-[#212529]">
        Step {number}: {description}
      </h2>
    </div>
  );
};

export default StepCard;
