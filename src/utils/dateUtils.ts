export function getDateDifferenceString(date1: Date, date2: Date) {
  const msDiff = Math.abs(Math.floor(date1.getTime() - date2.getTime()));
  let diff: number;
  let diffUnit: string;

  if (msDiff >= 1000 * 60 * 60 * 24) {
    diff = Math.floor(msDiff / (1000 * 60 * 60 * 24));
    diffUnit = 'day';
  } else if (msDiff >= 1000 * 60 * 60) {
    diff = Math.floor(msDiff / (1000 * 60 * 60));
    diffUnit = 'hour';
  } else if (msDiff >= 1000 * 60) {
    diff = Math.floor(msDiff / (1000 * 60));
    diffUnit = 'minute';
  } else {
    diff = Math.floor(msDiff / 1000);
    diffUnit = 'second';
  }

  if (diff !== 1) {
    diffUnit += 's';
  }

  return `${diff} ${diffUnit} ago`;
}