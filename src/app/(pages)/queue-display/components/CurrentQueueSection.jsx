export default function CurrentQueueSection({ appointment }) {
  return (
    <div className="flex flex-col items-center gap-[82px]">
      <div className="flex w-full items-center gap-[82px]">
        <div className="size-[300px] flex-shrink-0 rounded-full bg-white/90"></div>
        <div className="flex flex-col">
          <h2 className="text-[96px] leading-tight font-semibold text-white">
            {appointment.customerName}
          </h2>
          <p className="text-[96px] text-white">{appointment.serviceName}</p>
        </div>
      </div>
      <div className="mt-[16px] flex w-full items-baseline justify-between gap-[24px] text-green-500">
        <span className="text-[232px] leading-none font-bold">{appointment.queueNumber}</span>
        <span className="text-[232px] leading-none font-bold">ช่อง {appointment.channel}</span>
      </div>
    </div>
  );
}
