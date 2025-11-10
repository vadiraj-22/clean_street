import express from 'express';
import {
  getCommentsForComplaint,
  addComment,
  likeComment,
  dislikeComment,
  deleteComment
} from '../controller/comment.controller.js';
import { protect, optionalAuth } from '../middleware/auth.middleware.js';
import { uploadCommentImage } from '../middleware/upload.middleware.js';

const router = express.Router();

router.get('/:complaintId', optionalAuth, getCommentsForComplaint);
router.post('/:complaintId', protect, uploadCommentImage.single('image'), addComment);
router.post('/:commentId/like', protect, likeComment);
router.post('/:commentId/dislike', protect, dislikeComment);
router.delete('/:commentId', protect, deleteComment);


export default router;