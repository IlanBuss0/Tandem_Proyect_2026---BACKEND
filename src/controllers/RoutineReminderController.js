import {Router} from 'express';import RoutineReminderService from '../services/RoutineReminderService.js';
import AuthorizationService from '../services/AuthorizationService.js';
import { PERTENECIENTE_PERMISSIONS } from '../modules/security/permissions.constants.js';
const router=Router(),service=new RoutineReminderService();
router.put('/sync',async(req,res,next)=>{try{res.json({scheduled:await service.syncAsync(req.user.id,req.body.routines,req.body.timeZone)});}catch(e){next(e);}});
router.put('/calendar/sync',async(req,res,next)=>{try{const targetUserId=Number(req.body.userId||req.user.id);if(targetUserId!==Number(req.user.id)){await AuthorizationService.assertCanUsePertenecienteFeatureByUsuarioId(req.user.id,targetUserId,PERTENECIENTE_PERMISSIONS.USAR_CALENDARIO);}res.json({scheduled:await service.syncCalendarAsync(targetUserId,req.body.events,req.body.timeZone)});}catch(e){next(e);}});
router.delete('/item/:itemId',async(req,res,next)=>{try{res.json({rowsAffected:await service.cancelItemAsync(req.user.id,req.params.itemId)});}catch(e){next(e);}});
router.patch('/item/:itemId/complete',async(req,res,next)=>{try{res.json({rowsAffected:await service.cancelItemAsync(req.user.id,req.params.itemId)});}catch(e){next(e);}});
export default router;
