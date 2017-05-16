import { observable } from 'mobx';
import fetch from 'isomorphic-fetch';
import Referendum from './referendum';

export default class ReferendumStore {
  @observable referendums = [];
  @observable isLoading = true;

  constructor() {
    this.loadReferendums();
  }

  async loadReferendums() {
    this.isLoading = true;
    try {
      const res = await fetch(`${process.env.API_URL}/r/referendum`);
      if (!res.ok) throw new Error('Failed request');
      const json = await res.json();
      json.forEach(x => this.updateReferendumFromServer(x));
    } catch (err) { /* */ }
    this.isLoading = false;
  }

  updateReferendumFromServer(json) {
    let referendum = this.referendums.find(x => x.referendumId === json.referendumId);
    if (!referendum) { referendum = new Referendum(this, json.referendumId); this.referendums.push(referendum); }
    referendum.updateFromJson(json);
  }

  createReferendum() {
    const referendum = new Referendum(this);
    this.referendums.push(referendum);
    return referendum;
  }

  removeReferendum(referendum) {
    this.referendums.splice(this.referendums.indexOf(referendum), 1);
    // referendum.dispose();
  }
}
