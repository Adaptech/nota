import Referendums from './referendums';

export default class DataStore {
  constructor(options = {}, store) {
    this.referendums = new Referendums(options, store);
  }
}
