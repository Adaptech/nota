export const config = {
  key: 'electionAdminId'
};

export function handler(electionAdminList, eventData) {
  const event = eventData.event;
  switch(eventData.typeId) {
   case 'ElectionAdminCreated': {
      electionAdminList.create({
        electionAdminId: event.electionAdminId,
        firstname: event.firstname,
        lastname: event.lastname,
        address: event.address
      });
      break;
   }
  }
  return electionAdminList;
}



