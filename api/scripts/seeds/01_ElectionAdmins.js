import uuid from 'uuid';
import casual from 'casual';

import CreateElectionAdmin from '../../src/commands/CreateElectionAdmin';
import ElectionAdmin from '../../src/domain/ElectionAdmin';
import PostalAddress from '../../src/domain/PostalAddress';

const ELECTION_ADMINS = ['110ec58a-a0f2-4ac4-8393-c866d813b8d1'];
const ELECTION_ADMIN_COUNT = 1;
while (ELECTION_ADMINS.length < ELECTION_ADMIN_COUNT) ELECTION_ADMINS.push(uuid.v4());

export default async (services, aggregates) => {
  aggregates.electionAdmins = aggregates.electionAdmins || [];

  for (let electionAdminId of ELECTION_ADMINS) {
    const data = {
      electionAdminId,
      firstname: casual.first_name,
      lastname: casual.last_name,
      address: new PostalAddress(casual.address, casual.building_number, "Vancouver", 'BC', "V6B1A4", "CA"),
    };
    await services.commandHandler(
      data.electionAdminId,
      new ElectionAdmin(),
      new CreateElectionAdmin(data.electionAdminId, data.firstname, data.lastname, data.address)
    );
    aggregates.electionAdmins.push(data.electionAdminId);
  }
}
