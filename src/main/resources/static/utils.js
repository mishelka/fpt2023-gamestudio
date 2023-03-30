export class Random {
  next(max) {
    return Math.floor(Math.random()*(max+1));
  }
}