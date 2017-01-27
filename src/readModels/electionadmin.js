export const filters = {
  eventType: ['ElectionAdminCreated']
};

export function reducer(electionAdminList, eventData) {
  const event = eventData.event;
  switch(eventData.typeId) {
    case 'ElectionAdminCreated':
      var electionAdminRecordIndex = electionAdminList.findIndex(isInListAlready, eventData.event.electionAdminId);
      if(electionAdminRecordIndex === -1) {
        electionAdminList.push({
          electionAdminId: event.electionAdminId,
          name: event.name,
          address: event.address, 
        });
      }
      break;
  }
  return electionAdminList;
}

function isInListAlready(electionAdmin) {
    return electionAdmin.electionAdminId === this;
}