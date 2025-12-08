export const getWeekdayIndex = (dateString: string): number => {
  const date = new Date(dateString);
  const day = date.getDay();
  return day === 0 ? 7 : day;
};

export const isInCurrentWeek = (dateString: string): boolean => {
  const targetDate = new Date(dateString);
  const now = new Date();

  // Reset time to midnight for both to ensure fair comparison
  targetDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  // Get current day of week (0=Sun, 1=Mon, ..., 6=Sat)
  const currentDay = now.getDay();

  // Calculate Monday of this week
  // If today is Sunday (0), we go back 6 days. If Mon (1), go back 0 days.
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;

  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  // Calculate Sunday of this week
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // Check if target date is between Monday and Sunday (inclusive)
  return targetDate >= monday && targetDate <= sunday;
};

export const isInCurrentMonth = (dateString: string): boolean => {
  const d = new Date(dateString);
  const now = new Date();
  return (
    d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  );
};
// src/lib/dataHelper.ts

// Generate Month Options (e.g., "2025-01")
export const generateMonthOptions = () => {
  const options = [];
  const startYear = 2024;
  const endYear = 2030;
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  for (let year = startYear; year <= endYear; year++) {
    for (let i = 0; i < 12; i++) {
      const monthStr = (i + 1).toString().padStart(2, "0");
      options.push({
        value: `${year}-${monthStr}`,
        label: `${months[i]} ${year}`,
      });
    }
  }
  return options;
};

// Get current ISO week number
export const getCurrentWeekNumber = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
  const week1 = new Date(date.getFullYear(), 0, 4);
  return (
    1 +
    Math.round(
      ((date.getTime() - week1.getTime()) / 86400000 -
        3 +
        ((week1.getDay() + 6) % 7)) /
        7
    )
  );
};

// src/lib/dataHelper.ts

// Returns 1, 2, 3, or 4 based on the day of the month
// Days 1-7 = Week 1, 8-14 = Week 2, 15-21 = Week 3, 22+ = Week 4
export const getMonthWeekNumber = (dateString: string): number => {
  const date = new Date(dateString);
  const day = date.getDate();
  const week = Math.ceil(day / 7);
  return week > 4 ? 4 : week;
};

export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  return [
    currentYear - 1,
    currentYear,
    currentYear + 1,
    currentYear + 2,
    currentYear + 3,
    currentYear + 4,
    currentYear + 5,
  ];
};

export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
