import uuid from 'uuid';
import casual from 'casual';

import RegisterVoter from '../../src/commands/RegisterVoter';
import Voter from '../../src/domain/Voter';
import PostalAddress from '../../src/domain/PostalAddress';

const VOTERS = ['110ec58a-a0f2-4ac4-8393-c866d813b8d2'];
const VOTER_COUNT = 1;
while (VOTERS.length < VOTER_COUNT) VOTERS.push(uuid.v4());

export default async (services, aggregates) => {
  aggregates.voters = aggregates.voters || [];

  for (let voterId of VOTERS) {
    const data = {
      voterId,
      firstname: casual.first_name,
      lastname: casual.last_name,
      address: new PostalAddress(casual.address, casual.building_number, "Vancouver", 'BC', "V6B1A4", "CA"),
    };
    await services.commandHandler(
      data.voterId,
      new Voter(),
      new RegisterVoter(data.voterId, data.firstname, data.lastname, data.address)
    );
    aggregates.voters.push(data.voterId);
  }
}
