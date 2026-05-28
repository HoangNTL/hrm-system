export function validate(validator) {
  return (req, res, next) => validator(req, res, next);
}
