export function showFormattedDate(date, locale = 'en-US', options = {}) {
  if (!date) return 'No date available';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return 'Invalid date';
    }
    return dateObj.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options,
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
