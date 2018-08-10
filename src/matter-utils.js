// Get the root body of a compound Matter body
export function getRootBody(body) {
  while (body.parent !== body) body = body.parent;
  return body;
}

// Duck type to check if the given object is a Matter body (because there isn't a prototype)
export function isMatterBody(obj) {
  return (
    obj.hasOwnProperty("collisionFilter") &&
    obj.hasOwnProperty("parts") &&
    obj.hasOwnProperty("slop")
  );
}
