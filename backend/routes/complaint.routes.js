// backend/routes/complaint.routes.js

import express from "express";
 // 1. Import multer
import { createComplaint, updateComplaint, getUserComplaints, getAllUserComplaints, deleteComplaint, getCommunityComplaints, upvoteComplaint, downvoteComplaint, getRecentUpdates} from "../controller/complaint.controller.js";
import { protect } from "../middleware/auth.middleware.js";

import { uploadComplaintPhoto } from "../middleware/upload.middleware.js";
const router = express.Router();

// 2. Configure multer to save files to an 'uploads/' directory


/**
 * @route   POST /api/complaints/create
 * @desc    Create a new complaint
 * @access  Private (requires authentication)
 */
// 3. Add the multer middleware here. 
// It looks for a single file in a form field named 'photo'.
router.post("/create", protect, uploadComplaintPhoto.single('photo'), createComplaint);

// Test endpoint to verify auth is working
router.get("/test-auth", protect, (req, res) => {
  res.json({ message: "Auth working!", user: req.user });
});

/**
 * @route   GET /api/complaints/recent-updates
 * @desc    Get recent updates for the user (status changes, assignments, resolutions)
 * @access  Private
 * IMPORTANT: This must come BEFORE /:id routes to avoid conflicts
 */
router.get("/recent-updates", protect, getRecentUpdates);

/**
 * @route   GET /api/complaints/my-reports
 * @desc    Get user's own complaints
 * @access  Private
 */
router.get("/my-reports", protect, getUserComplaints);

/**
 * @route   GET /api/complaints/all
 * @desc    Get all user complaints (paginated)
 * @access  Private
 */
router.get("/all", protect, getAllUserComplaints);

/**
 * @route   GET /api/complaints/community
 * @desc    Get all complaints for public view
 * @access  Public
 */
router.get("/community", getCommunityComplaints);

/**
 * @route   PATCH /api/complaints/:id
 * @desc    Update an existing complaint
 * @access  Private (requires authentication)
 */
router.patch("/:id", protect, updateComplaint);

/**
 * @route   DELETE /api/complaints/:id
 * @desc    Delete a user's own complaint
 * @access  Private
 */
router.delete("/:id", protect, deleteComplaint);

/**
 * @route   POST /api/complaints/:id/upvote
 * @desc    Upvote a complaint
 * @access  Private
 */
router.post("/:id/upvote", protect, upvoteComplaint);

/**
 * @route   POST /api/complaints/:id/downvote
 * @desc    Downvote a complaint
 * @access  Private
 */
router.post("/:id/downvote", protect, downvoteComplaint);

export default router;