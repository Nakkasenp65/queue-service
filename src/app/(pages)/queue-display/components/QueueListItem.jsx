export default function QueueListItem({ queueNumber, channel }) {
  const firstLetter = queueNumber.charAt(0);
  const restOfNumber = queueNumber.substring(1);
  const getFirstLetterColor = (letter) => {
    switch (letter.toUpperCase()) {
      case "R":
        return "text-yellow-400";
      case "F":
        return "text-red-500";
      case "G":
        return "text-blue-400";
      default:
        return "text-white";
    }
  };
  const colorClass = getFirstLetterColor(firstLetter);
  return (
    <div className="flex items-baseline justify-between">
      <div className="text-[144px] font-bold text-white">
        <span className={colorClass}>{firstLetter}</span>
        <span>{restOfNumber}</span>
      </div>
      <span className="text-[144px] font-bold text-neutral-300">ช่อง {channel}</span>
    </div>
  );
}
