import { Router } from 'express';
import { getNewsFeed } from '../controllers/news.controller';

const router = Router();

router.get('/', getNewsFeed);

export default router;
