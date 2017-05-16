import uuid from 'uuid';
import casual from 'casual';

import CreateOrganization from '../../src/commands/CreateOrganization';
import Organization from '../../src/domain/Organization';
import PostalAddress from '../../src/domain/PostalAddress';

export default async (services, aggregates) => {
  aggregates.organizations = aggregates.organizations || [];
  const electionAdmins = aggregates.electionAdmins;

  for (const electionAdmin of electionAdmins) {
    const data = {
      organizationId: uuid.v4(),
      name: casual.title,
      electionAdminId: electionAdmin,
    };
    await services.commandHandler(
      data.organizationId,
      new Organization(),
      new CreateOrganization(data.organizationId, data.name, data.electionAdminId)
    );
    aggregates.organizations.push(data.organizationId);
  }
}
