import { MongooseCommonService } from './mongooseCommonService';
import { WhatsAppContactModel } from '../../db/mongodb';
import { IWhatsAppContactAttributes, IWhatsAppContactDocument } from '../../interfaces';
import { WHATSAPP_CONTACT_STATE } from '../../constants';
import { logger } from '../../configs/logger';
import { IWhatsAppContactServiceContract } from '../contracts/whatsAppContactServiceInterface';

export class WhatsAppContactService extends MongooseCommonService<IWhatsAppContactAttributes, IWhatsAppContactDocument> implements IWhatsAppContactServiceContract {
  constructor() {
    super(WhatsAppContactModel);
  }

  /**
   * Find or create a contact by mobile number
   */
  async findOrCreateContact(mobile: string): Promise<IWhatsAppContactDocument> {
    return this.findOrRegister(mobile);
  }

  /**
   * Find or register (Contract method)
   */
  async findOrRegister(mobile: string, name?: string): Promise<IWhatsAppContactDocument> {
    let contact = await this.findOne({ mobile } as any);

    if (!contact) {
      // Clean mobile number - generic logic could be added here
      contact = await this.create({
        mobile,
        consent: false,
        state: WHATSAPP_CONTACT_STATE.NEW,
        totalReplies: 0,
        metadata: {
          firstContactedAt: new Date(),
          totalMessagesSent: 0,
        },
      } as any);
      logger.info(`[WhatsAppContactService] Created new contact: ${mobile}`);
    }

    return contact as unknown as IWhatsAppContactDocument;
  }

  /**
   * Update consent status for a contact
   */
  async updateConsent(contactId: string, consent: boolean): Promise<IWhatsAppContactDocument | null> {
    const updated = await this.upsert(
      { _id: contactId } as any,
      { $set: { consent } } as any
    );
    logger.info(`[WhatsAppContactService] Updated consent for ${contactId}: ${consent}`);
    return updated as unknown as IWhatsAppContactDocument;
  }

  /**
   * Record a reply from a contact
   */
  async recordReply(contactId: string): Promise<void> {
    await this.updateOne(
      { _id: contactId } as any,
      {
        $inc: { totalReplies: 1 },
        $set: {
          lastRepliedAt: new Date(),
          state: WHATSAPP_CONTACT_STATE.ENGAGED, // Auto-upgrade to ENGAGED on reply
        },
      } as any
    );
    logger.info(`[WhatsAppContactService] Recorded reply for ${contactId}, state updated to ENGAGED`);
  }

  /**
   * Mark a contact as Do Not Disturb
   */
  async markAsDND(contactId: string): Promise<IWhatsAppContactDocument | null> {
    const updated = await this.upsert(
      { _id: contactId } as any,
      { $set: { state: WHATSAPP_CONTACT_STATE.DND } } as any
    );
    logger.info(`[WhatsAppContactService] Marked contact ${contactId} as DND`);
    return updated as unknown as IWhatsAppContactDocument;
  }

  /**
   * Increment message sent counter for a contact
   */
  async incrementMessageCount(contactId: string): Promise<void> {
    await this.updateOne(
      { _id: contactId } as any,
      {
        $inc: { 'metadata.totalMessagesSent': 1 },
        $set: { 'metadata.lastContactedAt': new Date() },
      } as any
    );
  }

  /**
   * Get contacts by state
   */
  async getContactsByState(state: WHATSAPP_CONTACT_STATE): Promise<IWhatsAppContactDocument[]> {
    return await this.findAll({ state } as any) as unknown as IWhatsAppContactDocument[];
  }

  /**
   * Get contacts without consent
   */
  async getContactsWithoutConsent(): Promise<IWhatsAppContactDocument[]> {
    return await this.findAll({ consent: false } as any) as unknown as IWhatsAppContactDocument[];
  }
}
export const whatsAppContactService = new WhatsAppContactService();
