const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

export function getDateDifferenceString(date1: Date, date2: Date) {
  const msDiff = Math.abs(Math.floor(date1.getTime() - date2.getTime()));
  
  if (msDiff >= WEEK) {
    return date2.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
  }

  let diff: number;
  let diffUnit: string;

  if (msDiff >= DAY) {
    diff = Math.floor(msDiff / DAY);
    diffUnit = 'day';
  } else if (msDiff >= HOUR) {
    diff = Math.floor(msDiff / HOUR);
    diffUnit = 'hour';
  } else if (msDiff >= MINUTE) {
    diff = Math.floor(msDiff / MINUTE);
    diffUnit = 'minute';
  } else {
    diff = Math.floor(msDiff / SECOND);
    diffUnit = 'second';
  }

  if (diff !== 1) {
    diffUnit += 's';
  }

  return `${diff} ${diffUnit} ago`;
}