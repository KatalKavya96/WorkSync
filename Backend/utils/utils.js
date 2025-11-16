const verifyEmail = (str) => {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str)
}

module.exports = {verifyEmail}