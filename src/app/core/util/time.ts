export function transformMinutes(minutes: number): string {
  const durationHours = Math.floor(minutes / 60);
  const durationMinutes = minutes % 60;
  const hoursStr = durationHours < 10 ? `0${durationHours}` : `${durationHours}`;
  const minutesStr = durationMinutes < 10 ? `0${durationMinutes}` : `${durationMinutes}`;

  return `${hoursStr}:${minutesStr}`;
}
