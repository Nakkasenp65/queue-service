import QueueListItem from "./QueueListItem";

export default function QueueListSection({ title, appointments }) {
  return (
    <div className="flex flex-col">
      <header className="border-b-2 border-neutral-700 px-[60px] py-[24px]">
        <h3 className={`text-[88px] font-bold text-white`}>{title}</h3>
      </header>
      <div className="flex flex-col pt-[16px]">
        {appointments.map((apt) => (
          <QueueListItem key={apt.id} queueNumber={apt.queueNumber} channel={apt.channel} />
        ))}
      </div>
    </div>
  );
}
