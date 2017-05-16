import { observable, computed } from 'mobx';
import uuid from 'node-uuid';

export default class Vote {
  store = null;
  referendumId = null;

  @observable name = '';
  @observable proposal = '';
  @observable options = [];

  constructor(store, referendumId = uuid.v4()) {
    this.store = store;
    this.referendumId = referendumId;
  }

  @computed get asJson() {
    return {
      referendumId: this.referendumId,
      name: this.name,
      proposal: this.proposal,
      options: this.options,
    };
  }

  updateFromJson(json) {
    this.name = json.name;
    this.proposal = json.proposal;
    this.options = json.options;
  }
}
