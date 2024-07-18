import { AssociatedTriggerFunctions, TriggerFunctions } from './../models/triggerFunctions'; // Ajusta la ruta según sea necesario
import axios from 'axios';

export async function triggerWorkflows(triggerId: number, tenant_id: string, postData: any): Promise<void> {
    try {
        const associatedTriggers: any = await AssociatedTriggerFunctions.findAll({
            where: { 
                trigger_id: triggerId,
                tenant_id: tenant_id
            }
        });

        if (associatedTriggers.length > 0) {
            for (const trigger of associatedTriggers) {

                const triggerLink = trigger.dataValues.trigger_link;
                if (triggerLink) {
                    try {
                        await axios.post(triggerLink, postData);
                        console.log(`Workflow triggered successfully for trigger link: ${triggerLink}`);
                    } catch (postError) {
                        console.error(`Failed to trigger workflow for trigger link: ${triggerLink}`, postError);
                    }
                }
            }
        } else {
            console.log('No associated triggers found.');
        }
    } catch (error) {
        console.error('Error fetching associated triggers:', error);
        throw error;
    }
}
