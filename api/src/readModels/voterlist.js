export const filters = {
  eventType: ['VoterRegistered']
};

export function reducer(voterList, eventData) {
  const event = eventData.event;
  switch(eventData.typeId) {
    case 'VoterRegistered':
      var voterListEntryIndex = voterList.findIndex(isInListAlready, eventData.event.voterId);
      if(voterListEntryIndex === -1) {
        voterList.push({
          voterId: event.voterId,
          organizationId: event.organizationId,
          firstname: event.firstname,
          lastname: event.lastname,
          address: event.address, 
        });
      }
      break;
  }
  return voterList;
}

function isInListAlready(voter) {
    return voter.voterId === this;
}