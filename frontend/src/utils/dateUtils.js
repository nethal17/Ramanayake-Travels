/**
 * Formats a date string to a readable format.
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
};

/**
 * Calculates the number of days between two date strings.
 * @param {string} startDateString - The start date string
 * @param {string} endDateString - The end date string
 * @returns {number} - The number of days
 */
export const calculateDaysBetween = (startDateString, endDateString) => {
  if (!startDateString || !endDateString) return 0;
  
  const startDate = new Date(startDateString);
  const endDate = new Date(endDateString);
  const diffTime = Math.abs(endDate - startDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Formats a date to ISO string format (YYYY-MM-DD).
 * @param {Date} date - The date to format
 * @returns {string} - The formatted date string
 */
export const formatDateToISO = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

/**
 * Checks if a date is in the past.
 * @param {string} dateString - The date string to check
 * @returns {boolean} - True if the date is in the past
 */
export const isDateInPast = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Gets the current date as a formatted string.
 * @returns {string} - The current date string in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return formatDateToISO(new Date());
};

/**
 * Adds days to a date and returns the new date.
 * @param {Date} date - The original date
 * @param {number} days - Number of days to add
 * @returns {Date} - The new date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
