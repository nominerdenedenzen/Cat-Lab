interface StepBarType {
  number: number;
  label?: string;
}

export default function StepBar(props: StepBarType) {
  const { number, label } = props;
  return (
    <div className="flex flex-col gap-7">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#3b5bdb] text-white border-2 border-[#3b5bdb] font-['Nunito'] font-bold text-[15px]">
        {number}
      </div>
      <div className="font-['Nunito'] font-normal text-[17px] leading-[1.55] text-[#868e96]">
        {label}
      </div>
    </div>
  );
}
