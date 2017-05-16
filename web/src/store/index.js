import UI from './ui';
import Data from './data';

export default class Store {
  constructor(options = {}) {
    this.ui = new UI(options, this);
    this.data = new Data(options, this);
  }
}
