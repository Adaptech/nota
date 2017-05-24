export const config = {
  key: 'voterId'
};

export function handler(voterList, eventData) {
  const event = eventData.event;
  switch(eventData.typeId) {
    case 'VoterRegistered':
      voterList.create({
        voterId: event.voterId,
        organizationId: event.organizationId,
        firstname: event.firstname,
        lastname: event.lastname,
        address: event.address, 
      });
      break;
  }
  return voterList;
}

