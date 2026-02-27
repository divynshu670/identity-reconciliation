import { prisma } from "../config/prisma.js";
import { ContactRepository } from "../repositories/contact.repository.js";

export class ContactService {
  private repo = new ContactRepository();

  private async getUltimatePrimary(contactId: number): Promise<number> {
    let current = await this.repo.findById(contactId);

    while (current?.linkedId) {
      current = await this.repo.findById(current.linkedId);
    }

    return current!.id;
  }

  async identify(email?: string | null, phone?: string | null) {
    return prisma.$transaction(async () => {

      const matches = await this.repo.findMatchingContacts(email, phone);

      // No match → create new primary
      if (matches.length === 0) {
        const primary = await this.repo.createPrimary(email, phone);

        return {
          primaryContatctId: primary.id, // match spec typo intentionally
          emails: primary.email ? [primary.email] : [],
          phoneNumbers: primary.phoneNumber ? [primary.phoneNumber] : [],
          secondaryContactIds: [],
        };
      }

      // Resolve all matches 
      const primaryMap = new Map<number, Date>();

      for (const contact of matches) {
        const baseId =
          contact.linkPrecedence === "primary"
            ? contact.id
            : contact.linkedId!;

        const ultimatePrimaryId = await this.getUltimatePrimary(baseId);

        const ultimatePrimary = await this.repo.findById(ultimatePrimaryId);

        primaryMap.set(
          ultimatePrimaryId,
          ultimatePrimary!.createdAt
        );
      }

      // Sort primaries by createdAt
      const sortedPrimaries = [...primaryMap.entries()].sort(
        (a, b) => a[1].getTime() - b[1].getTime()
      );

      const oldestPrimaryId = sortedPrimaries[0][0];

      // Merge other primaries into oldest
      if (sortedPrimaries.length > 1) {
        for (let i = 1; i < sortedPrimaries.length; i++) {
          const mergingPrimaryId = sortedPrimaries[i][0];

          await this.repo.updateToSecondary(
            mergingPrimaryId,
            oldestPrimaryId
          );

          await this.repo.reassignChildren(
            mergingPrimaryId,
            oldestPrimaryId
          );
        }
      }

      // Fetch flattened tree
      const allContacts =
        await this.repo.findAllLinkedContacts(oldestPrimaryId);

      const emails = new Set<string>();
      const phones = new Set<string>();
      const secondaryIds: number[] = [];

      for (const contact of allContacts) {
        if (contact.email) emails.add(contact.email);
        if (contact.phoneNumber) phones.add(contact.phoneNumber);

        if (contact.linkPrecedence === "secondary") {
          secondaryIds.push(contact.id);
        }
      }

      // If new info → create secondary
      const emailExists = email && emails.has(email);
      const phoneExists = phone && phones.has(phone);

      if ((email && !emailExists) || (phone && !phoneExists)) {
        const newSecondary = await this.repo.createSecondary(
          oldestPrimaryId,
          email,
          phone
        );

        secondaryIds.push(newSecondary.id);

        if (email) emails.add(email);
        if (phone) phones.add(phone);
      }

      return {
        primaryContatctId: oldestPrimaryId, 
        emails: [...emails],
        phoneNumbers: [...phones],
        secondaryContactIds: secondaryIds,
      };
    });
  }
}