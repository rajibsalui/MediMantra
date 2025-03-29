import express from 'express';
import { startCall,endCall,getActiveCalls } from '../controllers/video.controller';
const router = express.Router();

router.get('/call/active', getActiveCalls);
router.post('/call/start', startCall);


router.post('/call/end', endCall);

export default router;