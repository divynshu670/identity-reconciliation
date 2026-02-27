import { prisma } from "../config/prisma.js";

export class ContactRepository {

  async findMatchingContacts(email?: string | null, phone?: string | null) {
    return prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          email ? { email } : undefined,
          phone ? { phoneNumber: phone } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findAllLinkedContacts(primaryId: number) {
    return prisma.contact.findMany({
      where: {
        deletedAt: null,
        OR: [
          { id: primaryId },
          { linkedId: primaryId },
        ],
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id: number) {
    return prisma.contact.findUnique({
      where: { id },
    });
  }

  async createPrimary(email?: string | null, phone?: string | null) {
    return prisma.contact.create({
      data: {
        email,
        phoneNumber: phone,
        linkPrecedence: "primary",
      },
    });
  }

  async createSecondary(
    primaryId: number,
    email?: string | null,
    phone?: string | null
  ) {
    return prisma.contact.create({
      data: {
        email,
        phoneNumber: phone,
        linkedId: primaryId,
        linkPrecedence: "secondary",
      },
    });
  }

  async updateToSecondary(id: number, newPrimaryId: number) {
    return prisma.contact.update({
      where: { id },
      data: {
        linkedId: newPrimaryId,
        linkPrecedence: "secondary",
      },
    });
  }

  async reassignChildren(oldPrimaryId: number, newPrimaryId: number) {
    return prisma.contact.updateMany({
      where: {
        linkedId: oldPrimaryId,
      },
      data: {
        linkedId: newPrimaryId,
      },
    });
  }
}