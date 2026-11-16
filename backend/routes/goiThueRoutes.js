import { Router } from 'express';
import { layDanhSachGoiThue } from '../controllers/goiThueController.js';

const router = Router();
router.get('/', layDanhSachGoiThue);

export default router;