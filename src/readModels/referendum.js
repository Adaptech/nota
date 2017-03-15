export const filters = {
  eventType: ['ReferendumCreated']
};

export function reducer(referendumList, eventData) {
  const event = eventData.event;
  switch(eventData.typeId) {
    case 'ReferendumCreated':
      var referendumRecordIndex = referendumList.findIndex(isInListAlready, eventData.event.referendumId);
      if(referendumRecordIndex === -1) {
        referendumList.push({
          referendumId: event.referendumId,
          name: event.name,
          proposal: event.proposal,
          options: event.options, 
        });
      }
      break;
    case 'VoteCast':
      var referendumRecordIndex = referendumList.findIndex(isInListAlready, eventData.event.referendumId);
      if(referendumRecordIndex === -1) {
        throw new Error("Referendum " + event.referendumId + ": Referendum with referendumId " + event.referendumId + " not found.");
      }
      let referendum = referendumList[referendumRecordIndex];
      let currentTallyForOption = referendum.options[event.vote];
      referendum.options[event.vote] = currentTallyForOption + 1;
      referendumList = [
        ...referendumList.slice(0, referendumRecordIndex),
        referendum,
        ...referendumList.slice(referendumRecordIndex+1)
      ]
      break;
  }
  return referendumList;
}

function isInListAlready(referendum) {
    return referendum.referendumId === this;
}