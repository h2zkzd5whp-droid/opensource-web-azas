// Map an apiRequest error to a user-facing message: prefer a known errorCode
// from the table, then the server message, then the fallback.
export function toUserMessage(err, table, fallback) {
  return table[err.errorCode] || err.message || fallback;
}
