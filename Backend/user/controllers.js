const handleUser = (req, res) => {
  if(!req.user) {
    return res.status(401).json({"error": "User not found"})
  }

  return res.status(200).json({
    name: req.user.name,
    email: req.user.email
  })
}

module.exports = {handleUser}