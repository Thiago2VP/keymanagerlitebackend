class ApiKey {
  async validate(req, res) {
    try {
      if (req.body.key === process.env.API_KEY) {
        res.status(200).send('Permissed');
      } else {
        res.status(200).send('Blocked');
      }
    } catch (err) {
      res.status(404).json(err);
    }
  }
}

export default new ApiKey();
