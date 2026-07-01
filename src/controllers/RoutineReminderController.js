import {Router} from 'express';import RoutineReminderService from '../services/RoutineReminderService.js';
const router=Router(),service=new RoutineReminderService();
router.put('/sync',async(req,res,next)=>{try{res.json({scheduled:await service.syncAsync(req.user.id,req.body.routines)});}catch(e){next(e);}});
router.delete('/item/:itemId',async(req,res,next)=>{try{res.json({rowsAffected:await service.cancelItemAsync(req.user.id,req.params.itemId)});}catch(e){next(e);}});
router.patch('/item/:itemId/complete',async(req,res,next)=>{try{res.json({rowsAffected:await service.cancelItemAsync(req.user.id,req.params.itemId)});}catch(e){next(e);}});
export default router;
