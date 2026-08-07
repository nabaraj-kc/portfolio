function getKathmanduTimeInfo() {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kathmandu",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(now);
  let hour = "00", minute = "00", year = "", month = "", day = "";
  parts.forEach(p => {
    if (p.type === "hour") hour = p.value;
    if (p.type === "minute") minute = p.value;
    if (p.type === "year") year = p.value;
    if (p.type === "month") month = p.value;
    if (p.type === "day") day = p.value;
  });
  
  // Handle 24-hour node 18/20 bug where hour is "24" instead of "00"
  if (hour === "24") hour = "00";

  const currentHHMM = `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
  const currentDateStr = `${year}-${month}-${day}`;
  console.log({ currentHHMM, currentDateStr });
}
getKathmanduTimeInfo();
