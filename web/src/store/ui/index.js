import { observable, computed } from 'mobx';

export default class UIStore {
  @observable pendingRequestCount = 0;

  @computed get appIsInSync() { return this.pendingRequestCount === 0; }
}
