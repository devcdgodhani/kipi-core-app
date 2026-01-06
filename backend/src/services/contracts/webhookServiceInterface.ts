export interface IWebhookService {
  validateAndLog(
    payload: any, 
    headers: any, 
    provider: string
  ): Promise<{ isValid: boolean; logId?: string; normalizedEvent?: any }>;
  
  processEvent(event: any): Promise<boolean>;
  
  processWebhook(payload: any, headers: any, provider: string): Promise<boolean>;
}
