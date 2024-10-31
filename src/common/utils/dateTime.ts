function parseToUTC(dateString) {
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute, secondAndMillis] = timePart.split(':');
    const [second, millis] = secondAndMillis.split('.').map(Number);
  
    // Constructs the date in UTC as milliseconds since the epoch
    return Date.UTC(year, month - 1, day, hour, minute, second, millis || 0);
  }

  export {parseToUTC}