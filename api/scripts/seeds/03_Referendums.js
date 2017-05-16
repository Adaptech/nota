import uuid from 'uuid';
import casual from 'casual';
import times from 'lodash/times';

import CreateReferendum from '../../src/commands/CreateReferendum';
import Referendum from '../../src/domain/Referendum';
import PostalAddress from '../../src/domain/PostalAddress';

const REFERENDUMS = [];
const REFERENDUM_COUNT = 10;
while (REFERENDUMS.length < REFERENDUM_COUNT) REFERENDUMS.push(uuid.v4());

export default async (services, aggregates) => {
  aggregates.referendums = aggregates.referendums || [];

  for (let referendumId of REFERENDUMS) {
    const data = {
      referendumId,
      name: casual.title,
      proposal: casual.description,
      options: times(2, x => casual.word),
    };
    await services.commandHandler(
      data.referendumId,
      new Referendum(),
      new CreateReferendum(data.referendumId, data.name, data.proposal, data.options)
    );
    aggregates.referendums.push(data.referendumId);
  }
}
