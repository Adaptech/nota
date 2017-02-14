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
  }
  return referendumList;
}

function isInListAlready(referendum) {
    return referendum.referendumId === this;
}